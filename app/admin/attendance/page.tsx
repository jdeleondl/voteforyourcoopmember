'use client'

import { useEffect, useState } from 'react'

interface Attendance {
  id: string
  code: string
  confirmedAt: string
  emailSent: boolean
  emailSentAt?: string
  status: string
  regeneratedCount: number
  member: {
    id: string
    name: string
    email: string
    employeeId: string
    phone?: string
  }
}

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAttendances()
  }, [])

  const fetchAttendances = async () => {
    try {
      const response = await fetch('/api/admin/attendance')
      const data = await response.json()
      setAttendances(data.attendances || [])
    } catch (error) {
      console.error('Error fetching attendances:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAttendances = attendances.filter(att =>
    att.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    att.member.employeeId.includes(searchTerm) ||
    att.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRegenerateCode = async (id: string, memberName: string) => {
    if (!confirm(`¿Regenerar código de votación para ${memberName}?\n\nEl código anterior dejará de funcionar.`)) {
      return
    }

    setProcessingId(id)

    try {
      const response = await fetch(`/api/admin/attendance/${id}/regenerate`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert(`Código regenerado exitosamente!\n\nNuevo código: ${data.newCode}`)
        fetchAttendances()
      }
    } catch (error) {
      alert('Error al regenerar código')
    } finally {
      setProcessingId(null)
    }
  }

  const handleResendEmail = async (id: string, memberName: string) => {
    if (!confirm(`¿Reenviar código por email a ${memberName}?`)) {
      return
    }

    setProcessingId(id)

    try {
      const response = await fetch(`/api/admin/attendance/${id}/resend`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert('Email enviado exitosamente!')
        fetchAttendances()
      }
    } catch (error) {
      alert('Error al enviar email')
    } finally {
      setProcessingId(null)
    }
  }

  const handleChangeStatus = async (id: string, newStatus: string, memberName: string) => {
    if (!confirm(`¿Cambiar estado de asistencia de ${memberName} a "${newStatus}"?`)) {
      return
    }

    setProcessingId(id)

    try {
      const response = await fetch(`/api/admin/attendance/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert('Estado actualizado exitosamente!')
        fetchAttendances()
      }
    } catch (error) {
      alert('Error al cambiar estado')
    } finally {
      setProcessingId(null)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('Código copiado al portapapeles!')
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/attendance/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `codigos-votacion-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Error al exportar códigos')
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Asistencia y Códigos</h1>
          <p className="text-gray-600">Administra las confirmaciones y códigos de votación</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Asistentes</p>
          <p className="text-2xl font-bold">{attendances.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Emails Enviados</p>
          <p className="text-2xl font-bold text-green-600">
            {attendances.filter(a => a.emailSent).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Códigos Regenerados</p>
          <p className="text-2xl font-bold text-orange-600">
            {attendances.filter(a => a.regeneratedCount > 0).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nombre, cédula o código..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Attendances Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miembro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confirmación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
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
              {filteredAttendances.map((attendance) => (
                <tr key={attendance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{attendance.member.name}</div>
                      <div className="text-sm text-gray-500">ID: {attendance.member.employeeId}</div>
                      <div className="text-sm text-gray-500">{attendance.member.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-bold bg-yellow-100 px-3 py-1 rounded">
                        {attendance.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(attendance.code)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copiar código"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    {attendance.regeneratedCount > 0 && (
                      <div className="text-xs text-orange-600 mt-1">
                        Regenerado {attendance.regeneratedCount} {attendance.regeneratedCount === 1 ? 'vez' : 'veces'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(attendance.confirmedAt).toLocaleString('es-DO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attendance.emailSent ? (
                      <div>
                        <span className="text-green-600 flex items-center gap-1 text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Enviado
                        </span>
                        {attendance.emailSentAt && (
                          <span className="text-xs text-gray-500">
                            {new Date(attendance.emailSentAt).toLocaleString('es-DO')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No enviado</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      attendance.status === 'active' ? 'bg-green-100 text-green-800' :
                      attendance.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {attendance.status === 'active' ? 'Activo' :
                       attendance.status === 'cancelled' ? 'Cancelado' : 'Regenerado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleRegenerateCode(attendance.id, attendance.member.name)}
                        disabled={processingId === attendance.id}
                        className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                        title="Regenerar código"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleResendEmail(attendance.id, attendance.member.name)}
                        disabled={processingId === attendance.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        title="Reenviar email"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>

                      {attendance.status === 'active' && (
                        <button
                          onClick={() => handleChangeStatus(attendance.id, 'cancelled', attendance.member.name)}
                          disabled={processingId === attendance.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Cancelar asistencia"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}

                      {attendance.status === 'cancelled' && (
                        <button
                          onClick={() => handleChangeStatus(attendance.id, 'active', attendance.member.name)}
                          disabled={processingId === attendance.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Reactivar asistencia"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendances.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No hay asistencias confirmadas</p>
          </div>
        )}
      </div>
    </div>
  )
}
