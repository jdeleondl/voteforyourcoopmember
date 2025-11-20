'use client'

import { useEffect, useState } from 'react'

interface Candidate {
  id: string
  name: string
  bio: string | null
  photoUrl: string | null
  status: string
  voteCount: number
  percentage: number
}

interface CouncilResults {
  council: string
  candidates: Candidate[]
  totalVotes: number
}

interface VoteResults {
  summary: {
    totalVotes: number
    uniqueVoters: number
    confirmedAttendance: number
    participationRate: number
  }
  resultsByCouncil: Record<string, CouncilResults>
  votesByHour: Record<string, number>
  lastUpdated: string
}

export default function VotesPage() {
  const [results, setResults] = useState<VoteResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchResults()

    if (autoRefresh) {
      const interval = setInterval(fetchResults, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/admin/votes/results')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
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

  const exportResults = () => {
    if (!results) return

    let csvContent = 'Consejo,Candidato,Votos,Porcentaje\n'

    Object.values(results.resultsByCouncil).forEach((council) => {
      council.candidates.forEach((candidate) => {
        csvContent += `${getCouncilLabel(council.council)},"${candidate.name}",${candidate.voteCount},${candidate.percentage.toFixed(2)}%\n`
      })
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `resultados-votacion-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay resultados disponibles</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resultados de Votación</h1>
          <p className="text-gray-600">
            Actualizado: {new Date(results.lastUpdated).toLocaleString('es-DO')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-medium ${
              autoRefresh
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {autoRefresh ? '✓ Auto-actualizar' : 'Auto-actualizar OFF'}
          </button>
          <button
            onClick={exportResults}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar CSV
          </button>
          <button
            onClick={fetchResults}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{results.summary.totalVotes}</p>
          <p className="text-sm text-gray-600">Total Votos</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{results.summary.uniqueVoters}</p>
          <p className="text-sm text-gray-600">Votantes Únicos</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{results.summary.confirmedAttendance}</p>
          <p className="text-sm text-gray-600">Asistentes Confirmados</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{results.summary.participationRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Participación</p>
        </div>
      </div>

      {/* Results by Council */}
      <div className="space-y-6">
        {Object.values(results.resultsByCouncil).map((council) => (
          <div key={council.council} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Council Header */}
            <div className={`bg-gradient-to-r ${getCouncilColor(council.council)} p-6 text-white`}>
              <h2 className="text-2xl font-bold mb-2">{getCouncilLabel(council.council)}</h2>
              <p className="text-white text-opacity-90">
                {council.totalVotes} votos totales • {council.candidates.length} candidato(s)
              </p>
            </div>

            {/* Candidates Results */}
            <div className="p-6 space-y-4">
              {council.candidates.map((candidate, index) => (
                <div key={candidate.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Ranking */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : index === 1
                          ? 'bg-gray-100 text-gray-600'
                          : index === 2
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-gray-50 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Photo */}
                    <div className="flex-shrink-0">
                      {candidate.photoUrl ? (
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-purple-600">
                            {candidate.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
                          {candidate.bio && (
                            <p className="text-sm text-gray-600 mt-1">{candidate.bio}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-gray-900">{candidate.voteCount}</p>
                          <p className="text-sm text-gray-500">votos</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`bg-gradient-to-r ${getCouncilColor(council.council)} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${candidate.percentage}%` }}
                          ></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-700">
                            {candidate.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {council.candidates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay votos para este consejo
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Voting Timeline */}
      {Object.keys(results.votesByHour).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Línea de Tiempo de Votación</h2>
          <div className="space-y-2">
            {Object.entries(results.votesByHour)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([hour, count]) => (
                <div key={hour} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-40">
                    {new Date(hour).toLocaleString('es-DO', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="flex-1 relative">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{
                          width: `${(count / Math.max(...Object.values(results.votesByHour))) * 100}%`,
                        }}
                      >
                        <span className="text-xs font-semibold text-white">{count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
