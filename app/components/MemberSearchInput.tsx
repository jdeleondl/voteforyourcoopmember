'use client'

import { useState, useEffect, useRef } from 'react'

export interface MemberSearchResult {
  id: string
  name: string
  email: string
  employeeId: string
  hasConfirmed?: boolean
}

interface MemberSearchInputProps {
  onSelect: (member: MemberSearchResult) => void
  value?: string
  placeholder?: string
  disabled?: boolean
  label?: string
  filterAttendance?: boolean // Si es true, solo muestra miembros con asistencia confirmada
  className?: string
}

export default function MemberSearchInput({
  onSelect,
  value = '',
  placeholder = 'Escribe un nombre o ID de empleado...',
  disabled = false,
  label = 'Buscar Miembro',
  filterAttendance = false,
  className = '',
}: MemberSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(value)
  const [suggestions, setSuggestions] = useState<MemberSearchResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
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

  // Actualizar searchTerm cuando cambia el value prop
  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  const searchMembers = async (query: string) => {
    try {
      const response = await fetch(`/api/members/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (data.error) {
        setSuggestions([])
      } else {
        let members = data.members || []

        // Filtrar por asistencia si es necesario
        if (filterAttendance) {
          members = members.filter((m: MemberSearchResult) => m.hasConfirmed)
        }

        setSuggestions(members)
        setShowSuggestions(true)
      }
    } catch (err) {
      console.error('Error searching members:', err)
      setSuggestions([])
    }
  }

  const handleSelectMember = (member: MemberSearchResult) => {
    setSearchTerm(member.name)
    setShowSuggestions(false)
    setSuggestions([])
    onSelect(member)
  }

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            placeholder={placeholder}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={disabled}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Dropdown de Sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto">
            <div className="p-2">
              <p className="text-xs text-gray-500 px-3 py-2 font-semibold uppercase">
                {suggestions.length} {suggestions.length === 1 ? 'resultado' : 'resultados'} encontrado{suggestions.length === 1 ? '' : 's'}
              </p>
              {suggestions.map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="px-4 py-3 hover:bg-purple-50 cursor-pointer rounded-lg transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{member.name}</p>
                      <p className="text-sm text-gray-600">ID: {member.employeeId}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    {member.hasConfirmed !== undefined && (
                      <div>
                        {member.hasConfirmed ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirmado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                            Sin confirmar
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {showSuggestions && searchTerm.length >= 2 && suggestions.length === 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="font-semibold">No se encontraron resultados</p>
              <p className="text-sm">
                {filterAttendance
                  ? 'Intenta con otro nombre o ID (solo miembros con asistencia confirmada)'
                  : 'Intenta con otro nombre o ID de empleado'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Ayuda de búsqueda */}
      <p className="text-sm text-gray-500 mt-2">
        💡 Escribe al menos 2 caracteres para ver sugerencias
      </p>
    </div>
  )
}
