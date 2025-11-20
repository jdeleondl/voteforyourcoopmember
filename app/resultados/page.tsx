'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CandidateResult {
  id: string
  name: string
  position: string
  council: string
  voteCount: number
}

interface Results {
  totalVotes: number
  totalAttendees: number
  isValid: boolean
  candidateResults: {
    [council: string]: {
      [position: string]: CandidateResult[]
    }
  }
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

export default function ResultadosPage() {
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/voting/results')
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResults(data)
      }
    } catch (err) {
      setError('Error al cargar resultados')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-lg">
              Volver al Inicio
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-purple-900 mb-2 text-center">
            Resultados de Votación
          </h1>
          <p className="text-gray-600 text-center">
            COOPINTEC 2025 - Asamblea General
          </p>
        </div>

        {/* Validation Status */}
        <div className={`rounded-xl shadow-lg p-6 mb-6 ${
          results?.isValid
            ? 'bg-green-50 border-2 border-green-300'
            : 'bg-red-50 border-2 border-red-300'
        }`}>
          <div className="flex items-center gap-4">
            {results?.isValid ? (
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div>
              <h2 className={`text-xl font-bold ${results?.isValid ? 'text-green-900' : 'text-red-900'}`}>
                {results?.isValid ? 'Votación Válida' : 'Discrepancia Detectada'}
              </h2>
              <p className={results?.isValid ? 'text-green-700' : 'text-red-700'}>
                Total de votos: <strong>{results?.totalVotes}</strong> |
                Total de asistentes: <strong>{results?.totalAttendees}</strong>
                {results?.isValid
                  ? ' - Los números coinciden ✓'
                  : ' - Los números no coinciden'}
              </p>
            </div>
          </div>
        </div>

        {/* Resultados por Consejo */}
        {results && COUNCIL_ORDER.map((councilKey) => {
          const council = results.candidateResults[councilKey]
          if (!council) return null

          return (
            <div key={councilKey} className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-6 pb-3 border-b-2 border-purple-200">
                {COUNCIL_LABELS[councilKey]}
              </h2>

              <div className="space-y-6">
                {Object.entries(council).map(([position, candidates]) => {
                  const maxVotes = Math.max(...candidates.map(c => c.voteCount))
                  const winner = candidates.find(c => c.voteCount === maxVotes)

                  return (
                    <div key={position} className="border-l-4 border-purple-300 pl-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">
                        {POSITION_LABELS[position.split('_').pop() || position] || position}
                      </h3>

                      <div className="space-y-2">
                        {candidates
                          .sort((a, b) => b.voteCount - a.voteCount)
                          .map((candidate) => {
                            const percentage = results.totalVotes > 0
                              ? (candidate.voteCount / results.totalVotes) * 100
                              : 0
                            const isWinner = candidate.id === winner?.id && maxVotes > 0

                            return (
                              <div
                                key={candidate.id}
                                className={`p-4 rounded-lg border-2 ${
                                  isWinner
                                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    {isWinner && (
                                      <div className="text-2xl">🏆</div>
                                    )}
                                    <span className={`font-bold ${isWinner ? 'text-yellow-900' : 'text-gray-800'}`}>
                                      {candidate.name}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-purple-600">
                                      {candidate.voteCount}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {percentage.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>

                                {/* Barra de progreso */}
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                      isWinner
                                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                        : 'bg-gradient-to-r from-purple-400 to-pink-500'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Información adicional */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información de la Votación
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="font-semibold">Total de Asistentes:</span>
              <span>{results?.totalAttendees}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="font-semibold">Total de Votos Emitidos:</span>
              <span>{results?.totalVotes}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="font-semibold">Participación:</span>
              <span>
                {results && results.totalAttendees > 0
                  ? ((results.totalVotes / results.totalAttendees) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="font-semibold">Estado:</span>
              <span className={results?.isValid ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {results?.isValid ? 'Válida' : 'Con Discrepancias'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
