'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Member {
  id: string
  name: string
  email: string
  employeeId: string
  hasConfirmed: boolean
}

export default function AsistenciaPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<Member[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchMembers(searchTerm)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300) // Espera 300ms después de que el usuario deja de escribir

    return () => clearTimeout(delaySearch)
  }, [searchTerm])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchMembers = async (query: string) => {
    try {
      const response = await fetch(`/api/members/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (data.error) {
        setSuggestions([])
      } else {
        setSuggestions(data.members || [])
        setShowSuggestions(true)
      }
    } catch (err) {
      console.error('Error searching members:', err)
      setSuggestions([])
    }
  }

  const handleSelectMember = (member: Member) => {
    setSearchTerm(member.name)
    setSelectedMember(member)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleConfirmAttendance = async () => {
    if (!selectedMember) {
      setError('Por favor selecciona un miembro de la lista')
      return
    }

    if (selectedMember.hasConfirmed) {
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
        body: JSON.stringify({ memberId: selectedMember.id }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setConfirmationCode(data.code)
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

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    setSelectedMember(null)
    setError(null)
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

          {/* Buscador con Autocompletado */}
          <div className="mb-6" ref={searchRef}>
            <label className="block text-gray-700 font-bold mb-2">
              Buscar por Nombre o ID de Empleado
            </label>
            <div className="relative">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true)
                      }
                    }}
                    placeholder="Escribe tu nombre o ID de empleado..."
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-gray-800"
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Dropdown de Sugerencias */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-indigo-300 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <p className="text-xs text-gray-500 px-3 py-2 font-semibold uppercase">
                      {suggestions.length} {suggestions.length === 1 ? 'resultado' : 'resultados'} encontrado{suggestions.length === 1 ? '' : 's'}
                    </p>
                    {suggestions.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => handleSelectMember(member)}
                        className="px-4 py-3 hover:bg-indigo-50 cursor-pointer rounded-lg transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">{member.name}</p>
                            <p className="text-sm text-gray-600">ID: {member.employeeId}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                          <div>
                            {member.hasConfirmed ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Ya confirmó
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                Disponible
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensaje cuando no hay resultados */}
              {showSuggestions && searchTerm.length >= 2 && suggestions.length === 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="font-semibold">No se encontraron resultados</p>
                    <p className="text-sm">Intenta con otro nombre o ID de empleado</p>
                  </div>
                </div>
              )}
            </div>

            {/* Ayuda de búsqueda */}
            <p className="text-sm text-gray-500 mt-2">
              💡 Escribe al menos 2 caracteres para ver sugerencias
            </p>
          </div>

          {/* Miembro Seleccionado */}
          {selectedMember && (
            <div className="mb-6 p-4 bg-indigo-50 border-2 border-indigo-300 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-indigo-600 font-semibold">Miembro Seleccionado:</p>
                  <p className="text-xl font-bold text-indigo-900">{selectedMember.name}</p>
                  <p className="text-sm text-gray-600">ID: {selectedMember.employeeId}</p>
                  <p className="text-sm text-gray-600">{selectedMember.email}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedMember(null)
                    setSearchTerm('')
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleConfirmAttendance}
                disabled={loading || selectedMember.hasConfirmed}
                className={`w-full py-4 rounded-lg font-bold transition-colors ${
                  selectedMember.hasConfirmed
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Confirmando...
                  </span>
                ) : selectedMember.hasConfirmed ? (
                  'Este miembro ya confirmó su asistencia'
                ) : (
                  'Confirmar Mi Presencia'
                )}
              </button>
            </div>
          )}

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
              <span>Escribe tu nombre o ID de empleado en el buscador</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-indigo-600">2.</span>
              <span>Selecciona tu nombre del desplegable que aparece</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-indigo-600">3.</span>
              <span>Presiona el botón "Confirmar Mi Presencia"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-indigo-600">4.</span>
              <span>Recibirás un código único para votar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-indigo-600">5.</span>
              <span>Usa ese código en la página de votación</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
