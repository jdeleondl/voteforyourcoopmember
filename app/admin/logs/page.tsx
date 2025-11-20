'use client'

import { useEffect, useState } from 'react'

interface ActivityLog {
  id: string
  adminId: string | null
  action: string
  entity: string | null
  entityId: string | null
  details: string | null
  ipAddress: string
  userAgent: string
  timestamp: string
  admin: {
    name: string
    username: string
  } | null
}

interface LogsResponse {
  logs: ActivityLog[]
  total: number
  limit: number
  offset: number
  filters: {
    actions: string[]
    entities: string[]
  }
}

export default function ActivityLogsPage() {
  const [data, setData] = useState<LogsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    dateFrom: '',
    dateTo: '',
  })
  const [page, setPage] = useState(0)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const limit = 50

  useEffect(() => {
    fetchLogs()
  }, [filters, page])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      })

      if (filters.action) params.append('action', filters.action)
      if (filters.entity) params.append('entity', filters.entity)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/admin/logs?${params}`)
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(0) // Reset to first page
  }

  const resetFilters = () => {
    setFilters({
      action: '',
      entity: '',
      dateFrom: '',
      dateTo: '',
    })
    setPage(0)
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('create') || action.includes('add')) return 'bg-green-100 text-green-800'
    if (action.includes('update') || action.includes('edit')) return 'bg-blue-100 text-blue-800'
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-800'
    if (action.includes('login') || action.includes('logout')) return 'bg-purple-100 text-purple-800'
    if (action.includes('regenerate')) return 'bg-orange-100 text-orange-800'
    if (action.includes('send') || action.includes('email')) return 'bg-cyan-100 text-cyan-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'login': 'Inicio de Sesión',
      'logout': 'Cierre de Sesión',
      'create_member': 'Crear Miembro',
      'update_member': 'Actualizar Miembro',
      'delete_member': 'Eliminar Miembro',
      'regenerate_code': 'Regenerar Código',
      'resend_email': 'Reenviar Email',
      'change_status': 'Cambiar Estado',
      'update_config': 'Actualizar Configuración',
      'test_connection': 'Probar Conexión',
    }
    return labels[action] || action
  }

  const toggleExpandLog = (id: string) => {
    setExpandedLog(expandedLog === id ? null : id)
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Registro de Actividad</h1>
        <p className="text-gray-600">Auditoría completa de todas las acciones administrativas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total de Registros</p>
          <p className="text-2xl font-bold">{data?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Tipos de Acciones</p>
          <p className="text-2xl font-bold">{data?.filters.actions.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Entidades Afectadas</p>
          <p className="text-2xl font-bold">{data?.filters.entities.length || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <button
            onClick={resetFilters}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            Limpiar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Acción</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas las acciones</option>
              {data?.filters.actions.map((action) => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entidad</label>
            <select
              value={filters.entity}
              onChange={(e) => handleFilterChange('entity', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas las entidades</option>
              {data?.filters.entities.map((entity) => (
                <option key={entity} value={entity || ''}>
                  {entity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Administrador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.logs.map((log) => (
                <>
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString('es-DO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.admin?.name || 'Sistema'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.admin?.username || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.entity || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {log.details && (
                        <button
                          onClick={() => toggleExpandLog(log.id)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          {expandedLog === log.id ? 'Ocultar' : 'Ver'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedLog === log.id && log.details && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="text-sm text-gray-900">
                          <p className="font-semibold mb-2">Detalles:</p>
                          <pre className="bg-white p-4 rounded border overflow-x-auto text-xs">
                            {JSON.stringify(JSON.parse(log.details), null, 2)}
                          </pre>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="font-semibold">User Agent:</span>
                              <p className="text-gray-600 break-all">{log.userAgent}</p>
                            </div>
                            {log.entityId && (
                              <div>
                                <span className="font-semibold">Entity ID:</span>
                                <p className="text-gray-600">{log.entityId}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {data?.logs.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No hay registros de actividad</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{page * limit + 1}</span> a{' '}
                  <span className="font-medium">{Math.min((page + 1) * limit, data?.total || 0)}</span> de{' '}
                  <span className="font-medium">{data?.total || 0}</span> registros
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + Math.max(0, page - 2)
                    if (pageNum >= totalPages) return null
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNum
                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
