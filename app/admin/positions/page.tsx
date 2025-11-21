'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Position {
  id: string
  name: string
  council: string
  order: number
  isOccupied: boolean
  currentHolder: string | null
  termEndDate: string | null
  createdAt: string
  updatedAt: string
  _count: {
    assignments: number
  }
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCouncil, setFilterCouncil] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    council: 'administracion',
    order: 1,
  })
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPositions()
  }, [filterCouncil])

  const fetchPositions = async () => {
    try {
      const params = new URLSearchParams()
      if (filterCouncil) params.append('council', filterCouncil)

      const response = await fetch(`/api/admin/positions?${params}`)
      const data = await response.json()
      setPositions(data.positions || [])
    } catch (error) {
      console.error('Error fetching positions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (position?: Position) => {
    if (position) {
      setEditingPosition(position)
      setFormData({
        name: position.name,
        council: position.council,
        order: position.order,
      })
    } else {
      setEditingPosition(null)
      setFormData({
        name: '',
        council: 'administracion',
        order: 1,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPosition(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const url = editingPosition
        ? `/api/admin/positions/${editingPosition.id}`
        : '/api/admin/positions'

      const method = editingPosition ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert(editingPosition ? 'Posición actualizada exitosamente!' : 'Posición creada exitosamente!')
        handleCloseModal()
        fetchPositions()
      }
    } catch (error) {
      alert('Error al guardar posición')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (id: string, name: string, assignmentsCount: number) => {
    if (assignmentsCount > 0) {
      alert(`No se puede eliminar "${name}" porque tiene ${assignmentsCount} asignaciones registradas.`)
      return
    }

    if (!confirm(`¿Estás seguro de eliminar la posición "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/positions/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert('Posición eliminada exitosamente!')
        fetchPositions()
      }
    } catch (error) {
      alert('Error al eliminar posición')
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
      vigilancia: 'bg-blue-100 text-blue-800',
      administracion: 'bg-purple-100 text-purple-800',
      credito: 'bg-green-100 text-green-800',
    }
    return colors[council] || 'bg-gray-100 text-gray-800'
  }

  const isPositionAvailable = (position: Position) => {
    if (!position.isOccupied) return true
    if (!position.termEndDate) return false
    return new Date(position.termEndDate) <= new Date()
  }

  const groupedPositions = positions.reduce((acc, position) => {
    if (!acc[position.council]) {
      acc[position.council] = []
    }
    acc[position.council].push(position)
    return acc
  }, {} as Record<string, Position[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Posiciones</h1>
          <p className="text-gray-600">Configura los cargos disponibles por consejo</p>
          <p className="text-sm text-gray-500 mt-1">
            💡 Los cargos se asignan a miembros en la sección{' '}
            <Link href="/admin/assignments" className="text-purple-600 underline">
              Asignaciones
            </Link>
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Posición
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total de Posiciones</p>
          <p className="text-2xl font-bold">{positions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Disponibles</p>
          <p className="text-2xl font-bold text-green-600">
            {positions.filter(p => isPositionAvailable(p)).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Ocupadas</p>
          <p className="text-2xl font-bold text-orange-600">
            {positions.filter(p => !isPositionAvailable(p)).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Asignaciones Totales</p>
          <p className="text-2xl font-bold text-blue-600">
            {positions.reduce((sum, p) => sum + p._count.assignments, 0)}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Consejo</label>
        <select
          value={filterCouncil}
          onChange={(e) => setFilterCouncil(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Todos los consejos</option>
          <option value="administracion">Administración</option>
          <option value="vigilancia">Vigilancia</option>
          <option value="credito">Crédito</option>
        </select>
      </div>

      {/* Positions by Council */}
      {Object.entries(groupedPositions).map(([council, councilPositions]) => (
        <div key={council} className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">{getCouncilLabel(council)}</h2>
            <p className="text-sm text-gray-600">{councilPositions.length} posiciones</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ocupante Actual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin de Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignaciones</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {councilPositions
                  .sort((a, b) => a.order - b.order)
                  .map((position) => {
                    const available = isPositionAvailable(position)
                    return (
                      <tr key={position.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {position.order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{position.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {available ? 'Disponible' : 'Ocupada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {position.currentHolder || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {position.termEndDate
                            ? new Date(position.termEndDate).toLocaleDateString('es-DO')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {position._count.assignments}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleOpenModal(position)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(position.id, position.name, position._count.assignments)}
                              disabled={position._count.assignments > 0}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={position._count.assignments > 0 ? 'No se puede eliminar porque tiene asignaciones' : ''}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {positions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 mb-2">No hay posiciones registradas</p>
          <p className="text-sm text-gray-400">Crea cargos que luego podrás asignar a miembros</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingPosition ? 'Editar Posición' : 'Nueva Posición'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Cargo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: Presidente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consejo *
                    </label>
                    <select
                      value={formData.council}
                      onChange={(e) => setFormData({ ...formData, council: e.target.value })}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="administracion">Consejo de Administración</option>
                      <option value="vigilancia">Consejo de Vigilancia</option>
                      <option value="credito">Comité de Crédito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orden de visualización *
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      required
                      min="1"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Define el orden en que se mostrará este cargo (1 = primero)
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-blue-800">
                    💡 Para asignar este cargo a un miembro, ve a la sección{' '}
                    <Link href="/admin/assignments" className="underline font-semibold">
                      Asignaciones
                    </Link>{' '}
                    después de crear la posición.
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={processing}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {processing ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
