'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface VoteResult {
  candidateId: string
  candidateName: string
  displayOrder: number
  council: string
  voteCount: number
}

interface CouncilResults {
  council: string
  councilLabel: string
  candidates: VoteResult[]
  totalVotes: number
}

interface Summary {
  totalAttendees: number
  totalVoters: number
  participationRate: number
}

export default function ResultsPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<CouncilResults[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loadingResults, setLoadingResults] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/voting/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setIsAuthenticated(true)
        setMemberName(data.memberName || '')
        sessionStorage.setItem('resultsAuth', JSON.stringify({ code, memberName: data.memberName }))
        fetchResults()
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async () => {
    setLoadingResults(true)
    try {
      const response = await fetch('/api/voting/results')
      const data = await response.json()
      if (data.results) {
        setResults(data.results)
        setSummary(data.summary)
      }
    } catch (err) {
      console.error('Error fetching results:', err)
    } finally {
      setLoadingResults(false)
    }
  }

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('resultsAuth')
    if (savedAuth) {
      try {
        const { code: savedCode, memberName: savedName } = JSON.parse(savedAuth)
        setCode(savedCode)
        setMemberName(savedName)
        setIsAuthenticated(true)
        fetchResults()
      } catch {
        sessionStorage.removeItem('resultsAuth')
      }
    }
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('resultsAuth')
    setIsAuthenticated(false)
    setCode('')
    setMemberName('')
    setResults([])
    setSummary(null)
  }

  const getCouncilColor = (council: string) => {
    const colors: Record<string, { bg: string; bar: string; text: string; gradient: string }> = {
      administracion: { bg: 'bg-purple-50', bar: 'bg-purple-500', text: 'text-purple-700', gradient: 'from-purple-500 to-purple-600' },
      credito: { bg: 'bg-green-50', bar: 'bg-green-500', text: 'text-green-700', gradient: 'from-green-500 to-green-600' },
      vigilancia: { bg: 'bg-blue-50', bar: 'bg-blue-500', text: 'text-blue-700', gradient: 'from-blue-500 to-blue-600' },
    }
    return colors[council] || { bg: 'bg-gray-50', bar: 'bg-gray-500', text: 'text-gray-700', gradient: 'from-gray-500 to-gray-600' }
  }

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Resultados de Votación</h1>
            <p className="text-gray-600 mt-2">COOPINTEC 2025</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingresa tu código de votación
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-center text-xl tracking-wider"
                placeholder="XXXXXXXX"
                maxLength={10}
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Verificando...' : 'Ver Resultados'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Results Dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resultados de Votación</h1>
              <p className="text-gray-600">COOPINTEC 2025</p>
              {memberName && (
                <p className="text-purple-600 font-medium mt-1">
                  Bienvenido(a), {memberName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchResults}
                disabled={loadingResults}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${loadingResults ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg"
              >
                Salir
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-semibold">Total Asistentes</h3>
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-gray-800">{summary.totalAttendees}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-semibold">Votantes</h3>
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-gray-800">{summary.totalVoters}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-semibold">Participación</h3>
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-gray-800">{summary.participationRate.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {/* Results by Council */}
        {loadingResults ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando resultados...</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Sin Resultados</h2>
            <p className="text-gray-500">Los resultados aún no están disponibles</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((councilData) => {
              const colors = getCouncilColor(councilData.council)
              const maxVotes = Math.max(...councilData.candidates.map(c => c.voteCount), 1)
              const winner = councilData.candidates.length > 0 ? councilData.candidates[0] : null

              return (
                <div key={councilData.council} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Council Header */}
                  <div className={`bg-gradient-to-r ${colors.gradient} p-4 text-white`}>
                    <h2 className="text-xl font-bold">
                      {councilData.councilLabel}
                    </h2>
                    <p className="text-sm opacity-90">
                      Total de votos: {councilData.totalVotes}
                    </p>
                  </div>

                  {/* Bar Chart */}
                  <div className="p-6">
                    {councilData.candidates.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No hay candidatos en este consejo
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {councilData.candidates.map((candidate, index) => {
                          const percentage = councilData.totalVotes > 0
                            ? (candidate.voteCount / councilData.totalVotes) * 100
                            : 0
                          const barWidth = maxVotes > 0
                            ? (candidate.voteCount / maxVotes) * 100
                            : 0
                          const isWinner = index === 0 && candidate.voteCount > 0

                          return (
                            <div key={candidate.candidateId} className="relative">
                              {/* Candidate Info */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${colors.bar} text-white font-bold text-lg`}>
                                    {candidate.displayOrder}
                                  </span>
                                  <div>
                                    <span className="font-medium text-gray-900 flex items-center gap-2">
                                      {candidate.candidateName}
                                      {isWinner && (
                                        <span className="text-yellow-500 text-xl" title="Líder">
                                          👑
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Candidato #{candidate.displayOrder}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-2xl font-bold text-gray-900">{candidate.voteCount}</span>
                                  <span className="text-gray-500 ml-1 text-sm">votos</span>
                                  <div className="text-sm text-gray-400">({percentage.toFixed(1)}%)</div>
                                </div>
                              </div>

                              {/* Bar */}
                              <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                                <div
                                  className={`${isWinner ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : colors.bar} h-8 rounded-full transition-all duration-700 flex items-center px-3`}
                                  style={{ width: `${Math.max(barWidth, 5)}%` }}
                                >
                                  {barWidth > 20 && (
                                    <span className="text-sm font-bold text-white">
                                      {percentage.toFixed(0)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Los resultados se actualizan en tiempo real</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-purple-600 hover:text-purple-800"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}
