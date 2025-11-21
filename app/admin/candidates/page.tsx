'use client'

import { useEffect, useState } from 'react'
import MemberSearchInput, { MemberSearchResult } from '@/app/components/MemberSearchInput'

interface Member {
  id: string
  name: string
  email: string
  employeeId: string
}

interface Candidate {
  id: string
  memberId: string
  member: Member
  council: string
  bio: string | null
  photoUrl: string | null
  status: string
  voteCount: number
  createdAt: string
  updatedAt: string
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCouncil, setFilterCouncil] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [selectedMemberName, setSelectedMemberName] = useState('')
  const [formData, setFormData] = useState({
    memberId: '',
    council: 'administracion',
    bio: '',
    photoUrl: '',
  })
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchCandidates()
  }, [filterCouncil, filterStatus])

  const fetchCandidates = async () => {
    try {
      const params = new URLSearchParams()
      if (filterCouncil) params.append('council', filterCouncil)
      if (filterStatus) params.append('status', filterStatus)

      const response = await fetch(`/api/admin/candidates?${params}`)
      const data = await response.json()
      setCandidates(data.candidates || [])
    } catch (error) {
      console.error('Error fetching candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (candidate?: Candidate) => {
    if (candidate) {
      setEditingCandidate(candidate)
      setFormData({
        memberId: candidate.memberId,
        council: candidate.council,
        bio: candidate.bio || '',
        photoUrl: candidate.photoUrl || '',
      })
    } else {
      setEditingCandidate(null)
      setSelectedMemberName('')
      setFormData({
        memberId: '',
        council: 'administracion',
        bio: '',
        photoUrl: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCandidate(null)
    setSelectedMemberName('')
    setFormData({
      memberId: '',
      council: 'administracion',
      bio: '',
      photoUrl: '',
    })
  }

  const handleMemberSelect = (member: MemberSearchResult) => {
    setFormData({ ...formData, memberId: member.id })
    setSelectedMemberName(member.name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const url = editingCandidate
        ? `/api/admin/candidates/${editingCandidate.id}`
        : '/api/admin/candidates'

      const method = editingCandidate ? 'PUT' : 'POST'

      // For editing, only send bio, photoUrl, status (not memberId or council)
      const payload = editingCandidate
        ? { bio: formData.bio, photoUrl: formData.photoUrl }
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
        alert(editingCandidate ? 'Candidato actualizado exitosamente!' : 'Candidato creado exitosamente!')
        handleCloseModal()
        fetchCandidates()
      }
    } catch (error) {
      alert('Error al guardar candidato')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (id: string, memberName: string, voteCount: number) => {
    if (voteCount > 0) {
      alert(`No se puede eliminar a ${memberName} porque tiene ${voteCount} votos registrados.`)
      return
    }

    if (!confirm(`¿Estás seguro de eliminar a ${memberName} como candidato?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/candidates/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert('Candidato eliminado exitosamente!')
        fetchCandidates()
      }
    } catch (error) {
      alert('Error al eliminar candidato')
    }
  }

  const handleChangeStatus = async (id: string, currentStatus: string, memberName: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const statusLabel = newStatus === 'active' ? 'Activar' : 'Desactivar'

    if (!confirm(`¿${statusLabel} candidato ${memberName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert(`Candidato ${statusLabel.toLowerCase()}do exitosamente!`)
        fetchCandidates()
      }
    } catch (error) {
      alert('Error al cambiar estado')
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
          <h1 className="text-3xl font-bold text-gray-900">Candidatos</h1>
          <p className="text-gray-600">Gestionar candidatos propuestos para votación</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Candidato
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="bg-gray-50 px-4 py-2 rounded-lg w-full">
              <p className="text-sm text-gray-600">Total candidatos</p>
              <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Card Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{candidate.member.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        candidate.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {candidate.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-lg ${getCouncilBadgeColor(candidate.council)}`}>
                    {getCouncilLabel(candidate.council)}
                  </span>
                </div>
                {candidate.photoUrl ? (
                  <img
                    src={candidate.photoUrl}
                    alt={candidate.member.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">
                      {candidate.member.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {candidate.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{candidate.bio}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{candidate.voteCount} voto{candidate.voteCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Card Actions */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <button
                onClick={() => handleOpenModal(candidate)}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              <button
                onClick={() => handleChangeStatus(candidate.id, candidate.status, candidate.member.name)}
                className={`font-medium text-sm ${
                  candidate.status === 'active' ? 'text-gray-600 hover:text-gray-700' : 'text-green-600 hover:text-green-700'
                }`}
              >
                {candidate.status === 'active' ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={() => handleDelete(candidate.id, candidate.member.name, candidate.voteCount)}
                className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                disabled={candidate.voteCount > 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {candidates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-lg">No hay candidatos registrados</p>
          <p className="text-gray-400 text-sm mt-2">
            Haz clic en "Nuevo Candidato" para agregar uno
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCandidate ? 'Editar Candidato' : 'Nuevo Candidato'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Council Selection (only when creating) */}
              {!editingCandidate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consejo/Comité *
                  </label>
                  <select
                    value={formData.council}
                    onChange={(e) => setFormData({ ...formData, council: e.target.value, memberId: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="administracion">Consejo de Administración</option>
                    <option value="vigilancia">Consejo de Vigilancia</option>
                    <option value="credito">Comité de Crédito</option>
                  </select>
                </div>
              )}

              {/* Member Selection (only when creating) */}
              {!editingCandidate && (
                <div>
                  <MemberSearchInput
                    label="Miembro Presente *"
                    placeholder="Buscar por nombre o ID de empleado..."
                    onSelect={handleMemberSelect}
                    value={selectedMemberName}
                    filterAttendance={true}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Solo se muestran miembros con asistencia confirmada
                  </p>
                  {!formData.memberId && (
                    <input type="text" required value={formData.memberId} style={{ display: 'none' }} />
                  )}
                </div>
              )}

              {/* Member name (when editing - readonly) */}
              {editingCandidate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Miembro
                  </label>
                  <input
                    type="text"
                    value={editingCandidate.member.name}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              )}

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biografía
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Experiencia y cualificaciones del candidato..."
                />
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Foto
                </label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/foto.jpg"
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
                  {processing ? 'Guardando...' : editingCandidate ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
