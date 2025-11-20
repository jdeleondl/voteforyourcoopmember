'use client'

import { useEffect, useState } from 'react'

interface Position {
  id: string
  name: string
  council: string
  order: number
  isOccupied: boolean
  currentHolder: string | null
  termEndDate: string | null
}

interface Candidate {
  id: string
  name: string
  positionId: string
  position: Position
  council: string
  bio: string
  photoUrl: string | null
  status: string
  voteCount: number
  createdAt: string
  updatedAt: string
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCouncil, setFilterCouncil] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    positionId: '',
    council: 'administracion',
    bio: '',
    photoUrl: '',
  })
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchCandidates()
    fetchPositions()
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

  const fetchPositions = async () => {
    try {
      const params = new URLSearchParams()
      if (filterCouncil) params.append('council', filterCouncil)
      params.append('availableOnly', 'true')

      const response = await fetch(`/api/admin/positions?${params}`)
      const data = await response.json()
      setPositions(data.positions || [])
    } catch (error) {
      console.error('Error fetching positions:', error)
    }
  }

  const handleOpenModal = (candidate?: Candidate) => {
    if (candidate) {
      setEditingCandidate(candidate)
      setFormData({
        name: candidate.name,
        positionId: candidate.positionId,
        council: candidate.council,
        bio: candidate.bio,
        photoUrl: candidate.photoUrl || '',
      })
    } else {
      setEditingCandidate(null)
      setFormData({
        name: '',
        positionId: '',
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
    setFormData({
      name: '',
      positionId: '',
      council: 'administracion',
      bio: '',
      photoUrl: '',
    })
  }

  const handleCouncilChange = (council: string) => {
    setFormData({ ...formData, council, positionId: '' })
    // Fetch positions for the selected council
    fetch(`/api/admin/positions?council=${council}&availableOnly=true`)
      .then(res => res.json())
      .then(data => setPositions(data.positions || []))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const url = editingCandidate
        ? `/api/admin/candidates/${editingCandidate.id}`
        : '/api/admin/candidates'

      const method = editingCandidate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  const handleDelete = async (id: string, name: string, voteCount: number) => {
    if (voteCount > 0) {
      alert(`No se puede eliminar a ${name} porque tiene ${voteCount} votos registrados.`)
      return
    }

    if (!confirm(`¿Estás seguro de eliminar a ${name}?`)) {
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

  const handleChangeStatus = async (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const statusLabel = newStatus === 'active' ? 'Activar' : 'Desactivar'

    if (!confirm(`¿${statusLabel} candidato ${name}?`)) {
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
        alert('Estado actualizado exitosamente!')
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

  const getCouncilColor = (council: string) => {
    const colors: Record<string, string> = {
      vigilancia: 'bg-blue-100 text-blue-800',
      administracion: 'bg-purple-100 text-purple-800',
      credito: 'bg-green-100 text-green-800',
    }
    return colors[council] || 'bg-gray-100 text-gray-800'
  }

  const filteredCandidates = candidates

  const statsByCouncil = candidates.reduce((acc, candidate) => {
    if (!acc[candidate.council]) {
      acc[candidate.council] = { total: 0, active: 0, votes: 0 }
    }
    acc[candidate.council].total++
    if (candidate.status === 'active') acc[candidate.council].active++
    acc[candidate.council].votes += candidate.voteCount
    return acc
  }, {} as Record<string, { total: number; active: number; votes: number }>)

  const availablePositionsForCouncil = positions.filter(p => p.council === formData.council)

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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Candidatos</h1>
          <p className="text-gray-600">Administra los candidatos para los diferentes cargos</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(statsByCouncil).map(([council, stats]) => (
          <div key={council} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">{getCouncilLabel(council)}</p>
            <p className="text-2xl font-bold">{stats.total}</p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-green-600">✓ {stats.active} activos</span>
              <span className="text-gray-400">• {stats.votes} votos</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consejo</label>
            <select
              value={filterCouncil}
              onChange={(e) => setFilterCouncil(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los consejos</option>
              <option value="vigilancia">Vigilancia</option>
              <option value="administracion">Administración</option>
              <option value="credito">Crédito</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <div key={candidate.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
            {/* Photo */}
            <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
              {candidate.photoUrl ? (
                <img
                  src={candidate.photoUrl}
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {candidate.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  candidate.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {candidate.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="mb-2">
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getCouncilColor(candidate.council)}`}>
                  {getCouncilLabel(candidate.council)}
                </span>
              </div>

              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {candidate.position.name}
                </span>
              </div>

              {candidate.bio && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{candidate.bio}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold">{candidate.voteCount} votos</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(candidate)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleChangeStatus(candidate.id, candidate.status, candidate.name)}
                  className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {candidate.status === 'active' ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleDelete(candidate.id, candidate.name, candidate.voteCount)}
                  disabled={candidate.voteCount > 0}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={candidate.voteCount > 0 ? 'No se puede eliminar con votos' : 'Eliminar'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500">No hay candidatos registrados</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingCandidate ? 'Editar Candidato' : 'Nuevo Candidato'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consejo *
                    </label>
                    <select
                      value={formData.council}
                      onChange={(e) => handleCouncilChange(e.target.value)}
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
                      Cargo/Posición *
                    </label>
                    <select
                      value={formData.positionId}
                      onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Selecciona un cargo</option>
                      {availablePositionsForCouncil.map((position) => (
                        <option key={position.id} value={position.id}>
                          {position.name}
                          {position.isOccupied && position.termEndDate &&
                            ` (${position.currentHolder} - hasta ${new Date(position.termEndDate).toLocaleDateString('es-DO')})`
                          }
                        </option>
                      ))}
                    </select>
                    {availablePositionsForCouncil.length === 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        No hay cargos disponibles para este consejo. Crea cargos en la sección de Posiciones.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biografía
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Breve descripción del candidato..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL de Foto
                    </label>
                    <input
                      type="url"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
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
