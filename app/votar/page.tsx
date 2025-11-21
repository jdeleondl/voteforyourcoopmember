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
  displayOrder: number
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

interface VotesByCouncil {
  [council: string]: {
    candidateId: string
    candidateName: string
  }
}

// Orden secuencial de consejos: Administración -> Crédito -> Vigilancia
const COUNCIL_ORDER = ['administracion', 'credito', 'vigilancia'] as const
type CouncilType = typeof COUNCIL_ORDER[number]

export default function VotingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  const [currentCouncil, setCurrentCouncil] = useState<CouncilType | null>(null)
  const [candidates, setCandidates] = useState<CandidatesByCouncil>({})
  const [positions, setPositions] = useState<PositionsByCouncil | null>(null)
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({}) // council -> candidateId (pending)
  const [confirmedVotes, setConfirmedVotes] = useState<VotesByCouncil>({}) // council -> vote info (already saved)
  const [availableCouncils, setAvailableCouncils] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [memberName, setMemberName] = useState('')

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

      setMemberName(verifyData.memberName || '')
      setAvailableCouncils(verifyData.availableCouncils || [])

      // Load existing votes
      if (verifyData.votesByCouncil) {
        setConfirmedVotes(verifyData.votesByCouncil)
      }

      // If user has completed all votes, redirect to confirmation
      if (verifyData.hasCompletedAllVotes && verifyData.availableCouncils?.length > 0) {
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

        // Find first council with candidates that hasn't been voted on yet
        const firstAvailable = COUNCIL_ORDER.find(council =>
          (verifyData.availableCouncils || []).includes(council) &&
          !verifyData.votesByCouncil?.[council]
        )
        setCurrentCouncil(firstAvailable || null)
      }
    } catch (error) {
      setError('Error al cargar candidatos')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCandidate = (council: string, candidateId: string) => {
    // Don't allow selection if this council was already voted
    if (confirmedVotes[council]) return

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

  const handleConfirmCouncilVote = async (council: string) => {
    const candidateId = selectedVotes[council]
    if (!candidateId) {
      alert(`Debes seleccionar un candidato para ${getCouncilLabel(council)}`)
      return
    }

    const candidate = candidates[council]?.find(c => c.id === candidateId)
    if (!candidate) return

    const confirmMessage = `¿Confirmar tu voto para ${candidate.member.name} en ${getCouncilLabel(council)}?\n\nEsta acción no se puede deshacer.`

    if (!confirm(confirmMessage)) {
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/voting/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code?.trim().toUpperCase(),
          candidateId,
          council,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        // Mark this vote as confirmed
        setConfirmedVotes(prev => ({
          ...prev,
          [council]: {
            candidateId,
            candidateName: candidate.member.name
          }
        }))

        // Remove from pending selection
        setSelectedVotes(prev => {
          const newVotes = { ...prev }
          delete newVotes[council]
          return newVotes
        })

        // Check if all available councils have been voted
        if (data.hasCompletedAllVotes) {
          router.push('/votar/confirmacion')
          return
        }

        // Move to next available council
        const nextCouncil = COUNCIL_ORDER.find(c =>
          availableCouncils.includes(c) &&
          !confirmedVotes[c] &&
          c !== council
        )
        setCurrentCouncil(nextCouncil || null)
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

  const getCouncilStatus = (council: string): 'available' | 'voted' | 'disabled' => {
    if (confirmedVotes[council]) return 'voted'
    if (availableCouncils.includes(council)) return 'available'
    return 'disabled'
  }

  const getVotedCouncilsCount = () => {
    return Object.keys(confirmedVotes).length
  }

  const getTotalAvailableCouncils = () => {
    return availableCouncils.length
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

  const candidateList = currentCouncil ? (candidates[currentCouncil] || []) : []
  const selectedCandidate = currentCouncil ? selectedVotes[currentCouncil] : null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Papeleta Electoral</h1>
          <p className="text-gray-600 mb-1">
            COOPINTEC 2025 - Votación por Consejo
          </p>
          {memberName && (
            <p className="text-purple-600 font-medium">
              Votante: {memberName}
            </p>
          )}

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progreso de votación
              </span>
              <span className="text-sm text-gray-500">
                {getVotedCouncilsCount()} de {getTotalAvailableCouncils()} consejos votados
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${getTotalAvailableCouncils() > 0 ? (getVotedCouncilsCount() / getTotalAvailableCouncils()) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Council Status Cards */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {COUNCIL_ORDER.map((council) => {
              const status = getCouncilStatus(council)
              const isCurrent = currentCouncil === council

              return (
                <button
                  key={council}
                  onClick={() => status === 'available' && !confirmedVotes[council] && setCurrentCouncil(council)}
                  disabled={status === 'disabled' || status === 'voted'}
                  className={`p-3 rounded-lg text-center transition-all ${
                    status === 'voted'
                      ? 'bg-green-100 border-2 border-green-500'
                      : status === 'disabled'
                      ? 'bg-gray-100 border-2 border-gray-300 opacity-60'
                      : isCurrent
                      ? 'bg-purple-100 border-2 border-purple-500 ring-2 ring-purple-200'
                      : 'bg-white border-2 border-gray-200 hover:border-purple-300 cursor-pointer'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {status === 'voted' ? (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : status === 'disabled' ? (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                    <span className={`text-xs font-medium ${
                      status === 'voted' ? 'text-green-700' :
                      status === 'disabled' ? 'text-gray-500' :
                      'text-gray-700'
                    }`}>
                      {council === 'administracion' ? 'Administración' :
                       council === 'credito' ? 'Crédito' : 'Vigilancia'}
                    </span>
                    <span className={`text-xs ${
                      status === 'voted' ? 'text-green-600' :
                      status === 'disabled' ? 'text-gray-400' :
                      'text-gray-500'
                    }`}>
                      {status === 'voted' ? 'Votado' :
                       status === 'disabled' ? 'Sin habilitar' :
                       'Pendiente'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Confirmed Votes Summary */}
        {Object.keys(confirmedVotes).length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Votos Confirmados
            </h3>
            <div className="space-y-1">
              {COUNCIL_ORDER.map((council) => {
                const vote = confirmedVotes[council]
                if (!vote) return null
                return (
                  <div key={council} className="flex items-center justify-between text-sm">
                    <span className="text-green-700">{getCouncilLabel(council)}:</span>
                    <span className="font-medium text-green-800">{vote.candidateName}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Current Council Voting */}
        {currentCouncil && (
          <>
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
                      {pos.isOccupied && ' (Ocupado)'}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Los candidatos compiten por los cargos disponibles
                </p>
              </div>
            )}

            {/* Council Voting Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              {/* Council Header */}
              <div className={`bg-gradient-to-r ${getCouncilColor(currentCouncil)} p-6 text-white`}>
                <h2 className="text-2xl font-bold mb-2">{getCouncilLabel(currentCouncil)}</h2>
                <p className="text-white text-opacity-90">
                  {candidateList.length} candidato{candidateList.length !== 1 ? 's' : ''} disponible{candidateList.length !== 1 ? 's' : ''}
                  {selectedCandidate && ' - 1 seleccionado'}
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
                            {/* Display Order Number */}
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm">
                                {candidate.displayOrder}
                              </span>
                            </div>

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

            {/* Confirm Vote Button */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <button
                onClick={() => handleConfirmCouncilVote(currentCouncil)}
                disabled={!selectedCandidate || submitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-lg text-lg flex items-center justify-center gap-2 transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Confirmando voto...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Confirmar Voto para {getCouncilLabel(currentCouncil)}
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 text-center mt-3">
                Una vez confirmado, tu voto para este consejo no podrá ser modificado
              </p>
            </div>
          </>
        )}

        {/* No more councils to vote message */}
        {!currentCouncil && getTotalAvailableCouncils() > 0 && getVotedCouncilsCount() < getTotalAvailableCouncils() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-yellow-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold text-yellow-800 mb-2">Votación en Progreso</h3>
            <p className="text-yellow-700">
              Algunos consejos aún no han sido habilitados. Puedes volver más tarde para completar tu votación.
            </p>
          </div>
        )}

        {/* All votes completed but still on this page */}
        {!currentCouncil && getTotalAvailableCouncils() > 0 && getVotedCouncilsCount() >= getTotalAvailableCouncils() && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-green-800 mb-2">Votación Completada</h3>
            <p className="text-green-700 mb-4">
              Has votado en todos los consejos disponibles.
            </p>
            <button
              onClick={() => router.push('/votar/confirmacion')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg"
            >
              Ver Confirmación
            </button>
          </div>
        )}

        {/* No councils available at all */}
        {getTotalAvailableCouncils() === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Votación No Disponible</h3>
            <p className="text-gray-600 mb-4">
              Actualmente no hay consejos habilitados para votación. Por favor, regresa más tarde.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg"
            >
              Volver al Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
