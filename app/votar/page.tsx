'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Member {
  id: string
  name: string
  email: string
  employeeId: string
}

interface Candidate {
  id: string
  memberId: string
  member: Member
  council: string
  bio: string | null
  photoUrl: string | null
  status: string
}

interface Position {
  id: string
  name: string
  council: string
  order: number
  isOccupied: boolean
  currentHolder: string | null
  termEndDate: string | null
}

interface CandidatesByCouncil {
  [council: string]: Candidate[]
}

interface PositionsByCouncil {
  administracion: Position[]
  vigilancia: Position[]
  credito: Position[]
}

// Orden secuencial de consejos: Administración -> Crédito -> Vigilancia
const COUNCIL_ORDER = ['administracion', 'credito', 'vigilancia'] as const
type CouncilType = typeof COUNCIL_ORDER[number]

export default function VotingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  const [currentStep, setCurrentStep] = useState(0) // 0 = Administración, 1 = Crédito, 2 = Vigilancia
  const [candidates, setCandidates] = useState<CandidatesByCouncil>({})
  const [positions, setPositions] = useState<PositionsByCouncil | null>(null)
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({}) // council -> candidateId
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!code) {
      router.push('/')
      return
    }
    fetchData()
  }, [code])

  const fetchData = async () => {
    try {
      // Verificar si ya votó con este código
      const verifyResponse = await fetch('/api/voting/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code?.trim().toUpperCase() }),
      })

      const verifyData = await verifyResponse.json()

      if (verifyData.error) {
        setError(verifyData.error)
        setLoading(false)
        return
      }

      if (verifyData.hasVoted) {
        // Si ya votó, redirigir a la página de confirmación
        router.push('/votar/confirmacion?already_voted=true')
        return
      }

      // Fetch candidates
      const candidatesResponse = await fetch('/api/candidates')
      const candidatesData = await candidatesResponse.json()

      // Fetch positions (for reference visual)
      const positionsResponse = await fetch('/api/voting/positions')
      const positionsData = await positionsResponse.json()

      if (candidatesData.error) {
        setError(candidatesData.error)
      } else {
        setCandidates(candidatesData.candidates || {})
        setPositions(positionsData.councils)
      }
    } catch (error) {
      setError('Error al cargar candidatos')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCandidate = (council: string, candidateId: string) => {
    setSelectedVotes(prev => {
      const newVotes = { ...prev }

      // Si ya está seleccionado este candidato, deseleccionar
      if (newVotes[council] === candidateId) {
        delete newVotes[council]
      } else {
        // Seleccionar este candidato (solo uno por consejo)
        newVotes[council] = candidateId
      }

      return newVotes
    })
  }

  const handleNext = () => {
    const currentCouncil = COUNCIL_ORDER[currentStep]

    if (!selectedVotes[currentCouncil]) {
      alert(`Debes seleccionar un candidato para ${getCouncilLabel(currentCouncil)} antes de continuar`)
      return
    }

    if (currentStep < COUNCIL_ORDER.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    const currentCouncil = COUNCIL_ORDER[currentStep]

    if (!selectedVotes[currentCouncil]) {
      alert(`Debes seleccionar un candidato para ${getCouncilLabel(currentCouncil)}`)
      return
    }

    const selectedCount = Object.keys(selectedVotes).length

    const confirmMessage = `¿Confirmar voto para ${selectedCount} consejo/comité${selectedCount !== 1 ? 's' : ''}?\n\n` +
      `Consejos votados:\n` +
      Object.keys(selectedVotes).map(c => `• ${getCouncilLabel(c)}`).join('\n')

    if (!confirm(confirmMessage)) {
      return
    }

    setSubmitting(true)

    try {
      // Convert votes object to array of candidate IDs
      const votesArray = Object.values(selectedVotes)

      const response = await fetch('/api/voting/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code?.trim().toUpperCase(),
          votes: votesArray,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        // Redirect to confirmation page
        router.push('/votar/confirmacion')
      }
    } catch (error) {
      alert('Error al enviar votación')
    } finally {
      setSubmitting(false)
    }
  }

  const getCouncilLabel = (council: string) => {
    const labels: Record<string, string> = {
      vigilancia: 'Consejo de Vigilancia',
      administracion: 'Consejo de Administración',
      credito: 'Comité de Crédito',
    }
    return labels[council] || council
  }

  const getCouncilColor = (council: string) => {
    const colors: Record<string, string> = {
      vigilancia: 'from-blue-500 to-blue-600',
      administracion: 'from-purple-500 to-purple-600',
      credito: 'from-green-500 to-green-600',
    }
    return colors[council] || 'from-gray-500 to-gray-600'
  }

  const getCouncilBorderColor = (council: string) => {
    const colors: Record<string, string> = {
      vigilancia: 'border-blue-500',
      administracion: 'border-purple-500',
      credito: 'border-green-500',
    }
    return colors[council] || 'border-gray-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando papeleta electoral...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const currentCouncil = COUNCIL_ORDER[currentStep]
  const candidateList = candidates[currentCouncil] || []
  const selectedCandidate = selectedVotes[currentCouncil]
  const isLastStep = currentStep === COUNCIL_ORDER.length - 1

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Papeleta Electoral</h1>
          <p className="text-gray-600 mb-4">
            COOPINTEC 2025 - Votación Secuencial por Consejo
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Paso {currentStep + 1} de {COUNCIL_ORDER.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentStep + 1) / COUNCIL_ORDER.length) * 100)}% completado
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / COUNCIL_ORDER.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-between">
            {COUNCIL_ORDER.map((council, index) => {
              const isPast = index < currentStep
              const isCurrent = index === currentStep
              const isFuture = index > currentStep
              const hasVoted = selectedVotes[council]

              return (
                <div key={council} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        isPast || hasVoted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-purple-600 text-white ring-4 ring-purple-200'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isPast || hasVoted ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center font-medium ${
                        isCurrent ? 'text-purple-600' : isPast ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {council === 'administracion' ? 'Administración' :
                       council === 'credito' ? 'Crédito' : 'Vigilancia'}
                    </span>
                  </div>
                  {index < COUNCIL_ORDER.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Positions Reference for Current Council */}
        {positions && positions[currentCouncil] && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Cargos Disponibles en {getCouncilLabel(currentCouncil)}
            </h2>
            <div className="flex flex-wrap gap-2">
              {positions[currentCouncil].map((pos) => (
                <div
                  key={pos.id}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    pos.isOccupied
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                  title={
                    pos.isOccupied
                      ? `Ocupado por ${pos.currentHolder} hasta ${new Date(pos.termEndDate!).toLocaleDateString('es-DO')}`
                      : 'Disponible'
                  }
                >
                  {pos.name}
                  {pos.isOccupied && ' 🔒'}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              🔒 = Cargo ocupado (referencia - los candidatos compiten por los cargos disponibles)
            </p>
          </div>
        )}

        {/* Current Council Voting */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Council Header */}
          <div className={`bg-gradient-to-r ${getCouncilColor(currentCouncil)} p-6 text-white`}>
            <h2 className="text-2xl font-bold mb-2">{getCouncilLabel(currentCouncil)}</h2>
            <p className="text-white text-opacity-90">
              {candidateList.length} candidato{candidateList.length !== 1 ? 's' : ''} disponible{candidateList.length !== 1 ? 's' : ''}
              {selectedCandidate && ' • 1 seleccionado'}
            </p>
          </div>

          {/* Candidates Grid */}
          <div className="p-6">
            {candidateList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidateList.map((candidate) => {
                  const isSelected = selectedCandidate === candidate.id

                  return (
                    <div
                      key={candidate.id}
                      onClick={() => handleSelectCandidate(currentCouncil, candidate.id)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected
                          ? `${getCouncilBorderColor(currentCouncil)} bg-purple-50 shadow-lg`
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4 mb-3">
                        {/* Photo */}
                        {candidate.photoUrl ? (
                          <img
                            src={candidate.photoUrl}
                            alt={candidate.member.name}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl font-bold text-purple-600">
                              {candidate.member.name.charAt(0)}
                            </span>
                          </div>
                        )}

                        {/* Name and Selection Indicator */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1 text-lg">
                            {candidate.member.name}
                          </h3>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Seleccionado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {candidate.bio && (
                        <p className="text-sm text-gray-600">{candidate.bio}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay candidatos disponibles para este consejo
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedCandidate || submitting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-lg text-lg flex items-center gap-2 transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Confirmar Voto
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!selectedCandidate}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-lg flex items-center gap-2"
              >
                Siguiente
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Vote Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Resumen de tu votación:</p>
            <div className="space-y-2">
              {COUNCIL_ORDER.map((council) => {
                const candidate = selectedVotes[council]
                  ? candidates[council]?.find(c => c.id === selectedVotes[council])
                  : null

                return (
                  <div key={council} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{getCouncilLabel(council)}:</span>
                    <span className={candidate ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {candidate ? candidate.member.name : 'Sin seleccionar'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
