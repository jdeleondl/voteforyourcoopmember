'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Member {
  id: string
  name: string
  email: string
  cedula: string
  hasConfirmed: boolean
}

export default function AsistenciaPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Por favor ingrese un nombre o cédula para buscar')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/members/search?q=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setSearchResults([])
      } else {
        setSearchResults(data.members || [])
        if (data.members.length === 0) {
          setError('No se encontraron miembros con ese nombre o cédula')
        }
      }
    } catch (err) {
      setError('Error al buscar miembro. Por favor intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAttendance = async (member: Member) => {
    if (member.hasConfirmed) {
      setError('Este miembro ya confirmó su asistencia')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/attendance/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId: member.id }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setConfirmationCode(data.code)
        setSelectedMember(member)
        setSearchResults([])
        setSearchTerm('')
      }
    } catch (err) {
      setError('Error al confirmar asistencia. Por favor intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (confirmationCode) {
      navigator.clipboard.writeText(confirmationCode)
      alert('Código copiado al portapapeles')
    }
  }

  if (confirmationCode && selectedMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">
              ¡Asistencia Confirmada!
            </h1>
            <p className="text-gray-600">
              Bienvenido/a, {selectedMember.name}
            </p>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Tu Código de Votación
            </h2>
            <div className="bg-white border-4 border-yellow-400 rounded-lg p-6 mb-4">
              <p className="text-center text-4xl font-mono font-bold text-gray-800 tracking-wider">
                {confirmationCode}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar Código
            </button>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instrucciones Importantes
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span><strong>Guarda este código</strong> - Lo necesitarás para votar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>El código también ha sido enviado a tu correo: <strong>{selectedMember.email}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Usa este código para acceder a la <strong>página de votación</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span><strong>No compartas</strong> tu código con nadie</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Link href="/votacion" className="flex-1">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg transition-colors">
                Ir a Votar Ahora
              </button>
            </Link>
            <Link href="/" className="flex-1">
              <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded-lg transition-colors">
                Volver al Inicio
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-900 mb-2">
              Confirmación de Asistencia
            </h1>
            <p className="text-gray-600">
              Busca tu nombre y confirma tu presencia en la asamblea
            </p>
          </div>

          {/* Buscador */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">
              Buscar por Nombre o Cédula
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ej: Juan Pérez o 001-1234567-8"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-gray-800"
                disabled={loading}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
              <p className="text-red-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* Resultados */}
          {searchResults.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Resultados de la búsqueda ({searchResults.length})
              </h2>
              <div className="space-y-3">
                {searchResults.map((member) => (
                  <div
                    key={member.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{member.name}</h3>
                        <p className="text-gray-600">Cédula: {member.cedula}</p>
                        <p className="text-gray-600 text-sm">{member.email}</p>
                      </div>
                      <button
                        onClick={() => handleConfirmAttendance(member)}
                        disabled={loading || member.hasConfirmed}
                        className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                          member.hasConfirmed
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {member.hasConfirmed ? 'Ya Confirmado' : 'Confirmar Presente'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ¿Cómo funciona?
          </h3>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-indigo-600">1.</span>
              <span>Busca tu nombre o cédula en el buscador</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-indigo-600">2.</span>
              <span>Presiona el botón "Confirmar Presente"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-indigo-600">3.</span>
              <span>Recibirás un código único para votar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-indigo-600">4.</span>
              <span>Usa ese código en la página de votación</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
