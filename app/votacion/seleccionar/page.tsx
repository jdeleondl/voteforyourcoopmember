'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Candidate {
  id: string
  name: string
  position: string
  council: string
}

interface GroupedCandidates {
  [council: string]: {
    [position: string]: Candidate[]
  }
}

interface Votes {
  [position: string]: string // position -> candidateId
}

const POSITION_LABELS: { [key: string]: string } = {
  'presidente': 'Presidente',
  'vicepresidente': 'Vicepresidente',
  'tesorero': 'Tesorero',
  'secretario': 'Secretario',
  'vocal': 'Vocal',
  'vocal1': 'Vocal 1',
  'vocal2': 'Vocal 2',
  'suplente1': 'Suplente 1',
  'suplente2': 'Suplente 2',
}

const COUNCIL_LABELS: { [key: string]: string } = {
  'administracion': 'Consejo de Administración',
  'vigilancia': 'Consejo/Comité de Vigilancia',
  'credito': 'Comité de Crédito',
}

const COUNCIL_ORDER = ['administracion', 'vigilancia', 'credito']

export default function SeleccionarPage() {
  const [candidates, setCandidates] = useState<GroupedCandidates>({})
  const [votes, setVotes] = useState<Votes>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memberName, setMemberName] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const code = sessionStorage.getItem('votingCode')
    if (!code) {
      router.push('/votacion')
      return
    }

    fetchCandidates()
    validateCode(code)
  }, [])

  const validateCode = async (code: string) => {
    try {
      const response = await fetch('/api/voting/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (data.hasVoted) {
        alert('Ya has ejercido tu derecho al voto.')
        router.push('/')
        return
      }

      setMemberName(data.member.name)
    } catch (err) {
      console.error('Error validating code:', err)
    }
  }

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates')
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setCandidates(data.candidates)
      }
    } catch (err) {
      setError('Error al cargar candidatos')
    } finally {
      setLoading(false)
    }
  }

  const handleVoteChange = (position: string, candidateId: string) => {
    setVotes((prev) => ({
      ...prev,
      [position]: candidateId,
    }))
  }

  const getTotalPositions = () => {
    let total = 0
    Object.values(candidates).forEach((council) => {
      total += Object.keys(council).length
    })
    return total
  }

  const getSelectedCount = () => {
    return Object.keys(votes).length
  }

  const allPositionsFilled = () => {
    return getSelectedCount() === getTotalPositions()
  }

  const handleSubmit = async () => {
    if (!allPositionsFilled()) {
      alert('Debes seleccionar un candidato para cada cargo antes de continuar.')
      return
    }

    const confirmed = confirm(
      '¿Estás seguro de confirmar tu votación? No podrás cambiar tu selección después de confirmar.'
    )

    if (!confirmed) return

    setSubmitting(true)
    setError(null)

    try {
      const code = sessionStorage.getItem('votingCode')

      const response = await fetch('/api/voting/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, votes }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setSubmitting(false)
      } else {
        sessionStorage.removeItem('votingCode')
        router.push('/votacion/confirmacion')
      }
    } catch (err) {
      setError('Error al enviar votación. Por favor intente nuevamente.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando candidatos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4 pb-32">
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-indigo-900">
                Selección de Candidatos
              </h1>
              <p className="text-gray-600 mt-1">
                COOPINTEC 2025 - Votante: <strong>{memberName}</strong>
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progreso de Selección
              </span>
              <span className="text-sm font-medium text-indigo-600">
                {getSelectedCount()} de {getTotalPositions()} cargos
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 transition-all duration-300"
                style={{
                  width: `${getTotalPositions() > 0 ? (getSelectedCount() / getTotalPositions()) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Candidatos por Consejo */}
        {COUNCIL_ORDER.map((councilKey) => {
          const council = candidates[councilKey]
          if (!council) return null

          return (
            <div key={councilKey} className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6 pb-3 border-b-2 border-indigo-200">
                {COUNCIL_LABELS[councilKey]}
              </h2>

              <div className="space-y-6">
                {Object.entries(council).map(([position, positionCandidates]) => (
                  <div key={position} className="border-l-4 border-indigo-300 pl-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">
                      {POSITION_LABELS[position] || position}
                    </h3>

                    <div className="space-y-2">
                      {positionCandidates.map((candidate) => (
                        <label
                          key={candidate.id}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            votes[`${councilKey}_${position}`] === candidate.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`${councilKey}_${position}`}
                            value={candidate.id}
                            checked={votes[`${councilKey}_${position}`] === candidate.id}
                            onChange={() => handleVoteChange(`${councilKey}_${position}`, candidate.id)}
                            className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-3 text-gray-800 font-medium">
                            {candidate.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Botón flotante de confirmación */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-indigo-500 shadow-2xl p-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="text-sm">
              <p className="font-bold text-gray-800">
                {allPositionsFilled() ? (
                  <span className="text-green-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ¡Todos los cargos seleccionados!
                  </span>
                ) : (
                  <span className="text-orange-600">
                    Faltan {getTotalPositions() - getSelectedCount()} cargos por seleccionar
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!allPositionsFilled() || submitting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {submitting ? 'Enviando...' : 'Confirmar Votación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
