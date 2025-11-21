'use client'

import { useEffect, useState } from 'react'

interface Member {
  id: string
  name: string
  employeeId: string
}

interface Position {
  id: string
  name: string
  council: string
  order: number
}

interface Assignment {
  id: string
  positionId: string
  position: Position
  memberId: string
  member: Member
  termStartDate: string
  termEndDate: string
  createdAt: string
  updatedAt: string
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCouncil, setFilterCouncil] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [formData, setFormData] = useState({
    positionId: '',
    memberId: '',
    termStartDate: '',
    termEndDate: '',
  })
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchAssignments()
    fetchPositions()
    fetchMembers()
  }, [filterCouncil])

  const fetchAssignments = async () => {
    try {
      const params = new URLSearchParams()
      if (filterCouncil) params.append('council', filterCouncil)

      const response = await fetch(`/api/admin/assignments?${params}`)
      const data = await response.json()
      setAssignments(data.assignments || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/admin/positions')
      const data = await response.json()
      setPositions(data.positions || [])
    } catch (error) {
      console.error('Error fetching positions:', error)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/admin/members')
      const data = await response.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const handleOpenModal = (assignment?: Assignment) => {
    if (assignment) {
      setEditingAssignment(assignment)
      setFormData({
        positionId: assignment.positionId,
        memberId: assignment.memberId,
        termStartDate: new Date(assignment.termStartDate).toISOString().split('T')[0],
        termEndDate: new Date(assignment.termEndDate).toISOString().split('T')[0],
      })
    } else {
      setEditingAssignment(null)
      setFormData({
        positionId: '',
        memberId: '',
        termStartDate: new Date().toISOString().split('T')[0],
        termEndDate: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAssignment(null)
    setFormData({
      positionId: '',
      memberId: '',
      termStartDate: '',
      termEndDate: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const url = editingAssignment
        ? `/api/admin/assignments/${editingAssignment.id}`
        : '/api/admin/assignments'

      const method = editingAssignment ? 'PUT' : 'POST'

      // For editing, only send termStartDate and termEndDate
      const payload = editingAssignment
        ? { termStartDate: formData.termStartDate, termEndDate: formData.termEndDate }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert(editingAssignment ? 'Asignación actualizada exitosamente!' : 'Asignación creada exitosamente!')
        handleCloseModal()
        fetchAssignments()
      }
    } catch (error) {
      alert('Error al guardar asignación')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (id: string, positionName: string, memberName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la asignación de ${memberName} como ${positionName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/assignments/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert('Asignación eliminada exitosamente!')
        fetchAssignments()
      }
    } catch (error) {
      alert('Error al eliminar asignación')
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

  const getCouncilBadgeColor = (council: string) => {
    const colors: Record<string, string> = {
      vigilancia: 'bg-blue-100 text-blue-800',
      administracion: 'bg-purple-100 text-purple-800',
      credito: 'bg-green-100 text-green-800',
    }
    return colors[council] || 'bg-gray-100 text-gray-800'
  }

  const isActive = (assignment: Assignment) => {
    return new Date(assignment.termEndDate) >= new Date()
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Asignación de Cargos</h1>
          <p className="text-gray-600">Asignar cargos a miembros después de la votación</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Asignación
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consejo/Comité
            </label>
            <select
              value={filterCouncil}
              onChange={(e) => setFilterCouncil(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="administracion">Consejo de Administración</option>
              <option value="vigilancia">Consejo de Vigilancia</option>
              <option value="credito">Comité de Crédito</option>
            </select>
          </div>
          <div className="flex items-end col-span-2">
            <div className="bg-gray-50 px-4 py-2 rounded-lg w-full grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total asignaciones</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {assignments.filter(isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consejo/Comité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miembro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Término
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-lg ${getCouncilBadgeColor(assignment.position.council)}`}>
                      {getCouncilLabel(assignment.position.council)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.position.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.member.name}</div>
                    <div className="text-sm text-gray-500">ID: {assignment.member.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(assignment.termStartDate).toLocaleDateString('es-DO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(assignment.termEndDate).toLocaleDateString('es-DO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isActive(assignment) ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                        Finalizado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(assignment)}
                      className="text-purple-600 hover:text-purple-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id, assignment.position.name, assignment.member.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-12 px-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">No hay asignaciones registradas</p>
            <p className="text-gray-400 text-sm mt-2">
              Haz clic en "Nueva Asignación" para asignar un cargo
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAssignment ? 'Editar Asignación' : 'Nueva Asignación'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Position Selection (only when creating) */}
              {!editingAssignment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo *
                  </label>
                  <select
                    value={formData.positionId}
                    onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona un cargo</option>
                    {positions.map((position) => (
                      <option key={position.id} value={position.id}>
                        {getCouncilLabel(position.council)} - {position.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Position display (when editing - readonly) */}
              {editingAssignment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={`${getCouncilLabel(editingAssignment.position.council)} - ${editingAssignment.position.name}`}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              )}

              {/* Member Selection (only when creating) */}
              {!editingAssignment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Miembro *
                  </label>
                  <select
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona un miembro</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.employeeId}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Member display (when editing - readonly) */}
              {editingAssignment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Miembro
                  </label>
                  <input
                    type="text"
                    value={editingAssignment.member.name}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              )}

              {/* Term Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  value={formData.termStartDate}
                  onChange={(e) => setFormData({ ...formData, termStartDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Term End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Término *
                </label>
                <input
                  type="date"
                  value={formData.termEndDate}
                  onChange={(e) => setFormData({ ...formData, termEndDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                  disabled={processing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={processing}
                >
                  {processing ? 'Guardando...' : editingAssignment ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
