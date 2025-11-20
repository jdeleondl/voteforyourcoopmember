'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Position {
  id: string
  name: string
  council: string
  order: number
  isOccupied: boolean
  currentHolder: string | null
  termEndDate: string | null
  isAvailable: boolean
  isBlocked: boolean
  candidates: Candidate[]
}

interface Candidate {
  id: string
  name: string
  bio: string
  photoUrl: string | null
  status: string
}

interface Councils {
  administracion: Position[]
  vigilancia: Position[]
  credito: Position[]
}

export default function VotingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  const [councils, setCouncils] = useState<Councils | null>(null)
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({}) // positionId -> candidateId
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!code) {
      router.push('/')
      return
    }
    fetchPositions()
  }, [code])

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/voting/positions')
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setCouncils(data.councils)
      }
    } catch (error) {
      setError('Error al cargar posiciones')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCandidate = (positionId: string, candidateId: string) => {
    setSelectedVotes(prev => {
      const newVotes = { ...prev }

      // Si ya está seleccionado, deseleccionar
      if (newVotes[positionId] === candidateId) {
        delete newVotes[positionId]
      } else {
        // Seleccionar este candidato
        newVotes[positionId] = candidateId
      }

      return newVotes
    })
  }

  const handleSubmit = async () => {
    if (Object.keys(selectedVotes).length === 0) {
      alert('Debe seleccionar al menos un candidato para votar')
      return
    }

    const confirmMessage = `¿Confirmar voto para ${Object.keys(selectedVotes).length} posición(es)?`
    if (!confirm(confirmMessage)) {
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/voting/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          votes: selectedVotes,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert('¡Voto registrado exitosamente!')
        router.push('/votar/confirmacion')
      }
    } catch (error) {
      alert('Error al enviar el voto')
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

  if (!code) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando papeleta...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!councils) {
    return null
  }

  const totalSelected = Object.keys(selectedVotes).length

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Papeleta Electoral COOPINTEC 2025</h1>
          <p className="text-gray-600">
            Seleccione los candidatos de su preferencia. Puede votar por uno o más cargos disponibles.
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Cargo Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Cargo Ocupado (Bloqueado)</span>
            </div>
          </div>
        </div>

        {/* Voting Sections */}
        {Object.entries(councils).map(([council, positions]) => {
          const availablePositions = positions.filter(p => p.isAvailable)

          if (availablePositions.length === 0) {
            return null
          }

          return (
            <div key={council} className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              {/* Council Header */}
              <div className={`bg-gradient-to-r ${getCouncilColor(council)} p-6 text-white`}>
                <h2 className="text-2xl font-bold">{getCouncilLabel(council)}</h2>
                <p className="text-white text-opacity-90">
                  {availablePositions.length} cargo(s) disponible(s) • {
                    positions.filter(p => p.isBlocked).length
                  } bloqueado(s)
                </p>
              </div>

              {/* Positions Grid */}
              <div className="p-6">
                {/* Position Headers Row */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div className="flex flex-wrap gap-2">
                    {positions.map((position) => (
                      <div
                        key={position.id}
                        className={`px-4 py-2 rounded-lg font-medium text-sm ${
                          position.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                        title={
                          position.isBlocked
                            ? `Ocupado por ${position.currentHolder} hasta ${new Date(position.termEndDate!).toLocaleDateString('es-DO')}`
                            : 'Disponible para votación'
                        }
                      >
                        {position.name}
                        {position.isBlocked && ' 🔒'}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Candidates by Position */}
                {availablePositions.map((position) => (
                  <div key={position.id} className="mb-8 last:mb-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm">
                        {position.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({position.candidates.length} candidato{position.candidates.length !== 1 ? 's' : ''})
                      </span>
                    </h3>

                    {position.candidates.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No hay candidatos para este cargo</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {position.candidates.map((candidate) => {
                          const isSelected = selectedVotes[position.id] === candidate.id

                          return (
                            <button
                              key={candidate.id}
                              onClick={() => handleSelectCandidate(position.id, candidate.id)}
                              className={`p-4 rounded-lg border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-50 shadow-lg'
                                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Photo */}
                                <div className="flex-shrink-0">
                                  {candidate.photoUrl ? (
                                    <img
                                      src={candidate.photoUrl}
                                      alt={candidate.name}
                                      className="w-16 h-16 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                                      <span className="text-2xl font-bold text-white">
                                        {candidate.name.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 mb-1">
                                    {candidate.name}
                                  </h4>
                                  {candidate.bio && (
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {candidate.bio}
                                    </p>
                                  )}
                                  {isSelected && (
                                    <div className="mt-2 flex items-center gap-1 text-purple-600 text-sm font-semibold">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      Seleccionado
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Submit Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 sticky bottom-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {totalSelected === 0
                  ? 'No ha seleccionado ningún candidato'
                  : `${totalSelected} voto${totalSelected !== 1 ? 's' : ''} seleccionado${totalSelected !== 1 ? 's' : ''}`
                }
              </p>
              <p className="text-sm text-gray-600">
                {totalSelected === 0
                  ? 'Seleccione al menos un candidato para continuar'
                  : 'Haga clic en un candidato seleccionado para deseleccionarlo'
                }
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={totalSelected === 0 || submitting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-lg transition-colors"
            >
              {submitting ? 'Enviando...' : 'Confirmar Voto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
