'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Member {
  id: string
  name: string
  email: string
  cedula: string
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

export default function VotingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

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

  const handleSubmit = async () => {
    const selectedCount = Object.keys(selectedVotes).length

    if (selectedCount === 0) {
      alert('Debe seleccionar al menos un candidato para votar')
      return
    }

    const confirmMessage = `¿Confirmar voto para ${selectedCount} consejo/comité${selectedCount !== 1 ? 's' : ''}?`
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

  const totalCandidates = Object.values(candidates).reduce((sum, list) => sum + list.length, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Papeleta Electoral</h1>
          <p className="text-gray-600 mb-4">
            COOPINTEC 2025 - Selecciona tu candidato preferido de cada consejo o comité
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Instrucciones:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Puedes votar por UN candidato de cada consejo/comité</li>
                  <li>La votación es opcional - vota solo por los que desees</li>
                  <li>Debes votar por al menos UN candidato</li>
                  <li>Haz clic en un candidato para seleccionarlo o deseleccionarlo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Positions Reference (Visual indicator) */}
        {positions && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cargos Disponibles (Referencia)</h2>
            <div className="space-y-4">
              {Object.entries(positions).map(([council, posList]) => (
                <div key={council}>
                  <h3 className="font-semibold text-gray-700 mb-2">{getCouncilLabel(council)}</h3>
                  <div className="flex flex-wrap gap-2">
                    {posList.map((pos) => (
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
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              🔒 = Cargo ocupado (solo referencia - los candidatos compiten por los cargos disponibles)
            </p>
          </div>
        )}

        {/* Voting Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Candidatos seleccionados</p>
              <p className="text-3xl font-bold text-purple-600">
                {Object.keys(selectedVotes).length} / {Object.keys(candidates).length}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedVotes).length === 0 || submitting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-lg text-lg flex items-center gap-2 transition-colors"
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
          </div>
        </div>

        {/* Candidates by Council */}
        <div className="space-y-6">
          {Object.entries(candidates).map(([council, candidateList]) => {
            const selectedCandidate = selectedVotes[council]

            return (
              <div key={council} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Council Header */}
                <div className={`bg-gradient-to-r ${getCouncilColor(council)} p-6 text-white`}>
                  <h2 className="text-2xl font-bold mb-2">{getCouncilLabel(council)}</h2>
                  <p className="text-white text-opacity-90">
                    {candidateList.length} candidato{candidateList.length !== 1 ? 's' : ''} disponible{candidateList.length !== 1 ? 's' : ''}
                    {selectedCandidate && ' • 1 seleccionado'}
                  </p>
                </div>

                {/* Candidates Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidateList.map((candidate) => {
                    const isSelected = selectedCandidate === candidate.id

                    return (
                      <div
                        key={candidate.id}
                        onClick={() => handleSelectCandidate(council, candidate.id)}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                          isSelected
                            ? `${getCouncilBorderColor(council)} bg-purple-50 shadow-lg`
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
                          <p className="text-sm text-gray-600 line-clamp-3">{candidate.bio}</p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {candidateList.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No hay candidatos disponibles para este consejo
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {totalCandidates === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">
              No hay candidatos disponibles para votación en este momento
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
