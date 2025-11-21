'use client'

import { useEffect, useState } from 'react'

interface ConfigItem {
  id: string
  key: string
  value: string
  description?: string
  category: string
}

interface ConfigCategory {
  name: string
  label: string
  icon: string
  description: string
}

const categories: ConfigCategory[] = [
  {
    name: 'attendance',
    label: 'Asistencia',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    description: 'Ventana de tiempo para confirmar asistencia',
  },
  {
    name: 'database',
    label: 'Base de Datos',
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
    description: 'Configuración de conexión a la base de datos',
  },
  {
    name: 'email',
    label: 'Correo Electrónico',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    description: 'Configuración SMTP para envío de correos',
  },
  {
    name: 'general',
    label: 'General',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    description: 'Configuración general de la aplicación',
  },
  {
    name: 'voting',
    label: 'Votación',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    description: 'Parámetros del proceso de votación',
  },
]

export default function ConfigPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('attendance')
  const [editing, setEditing] = useState<string | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)

  // Attendance window state
  const [attendanceWindow, setAttendanceWindow] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    enabled: false,
  })
  const [savingAttendance, setSavingAttendance] = useState(false)

  useEffect(() => {
    fetchConfigs()
  }, [])

  useEffect(() => {
    // Parse attendance window from configs
    const startConfig = configs.find(c => c.key === 'ATTENDANCE_WINDOW_START')
    const endConfig = configs.find(c => c.key === 'ATTENDANCE_WINDOW_END')
    const enabledConfig = configs.find(c => c.key === 'ATTENDANCE_WINDOW_ENABLED')

    if (startConfig?.value) {
      try {
        const startDateTime = new Date(startConfig.value)
        setAttendanceWindow(prev => ({
          ...prev,
          startDate: startDateTime.toISOString().split('T')[0],
          startTime: startDateTime.toTimeString().slice(0, 5),
        }))
      } catch (e) {
        // Invalid date format
      }
    }

    if (endConfig?.value) {
      try {
        const endDateTime = new Date(endConfig.value)
        setAttendanceWindow(prev => ({
          ...prev,
          endDate: endDateTime.toISOString().split('T')[0],
          endTime: endDateTime.toTimeString().slice(0, 5),
        }))
      } catch (e) {
        // Invalid date format
      }
    }

    setAttendanceWindow(prev => ({
      ...prev,
      enabled: enabledConfig?.value === 'true',
    }))
  }, [configs])

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/config')
      const data = await response.json()
      setConfigs(data.configs || [])
    } catch (error) {
      console.error('Error fetching configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (key: string, value: string) => {
    try {
      const response = await fetch(`/api/admin/config/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert('Configuración guardada exitosamente')
        fetchConfigs()
        setEditing(null)
      }
    } catch (error) {
      alert('Error al guardar configuración')
    }
  }

  const handleSaveAttendanceWindow = async () => {
    setSavingAttendance(true)

    try {
      // Prepare start and end datetime strings
      const startDateTime = attendanceWindow.startDate && attendanceWindow.startTime
        ? new Date(`${attendanceWindow.startDate}T${attendanceWindow.startTime}`).toISOString()
        : ''
      const endDateTime = attendanceWindow.endDate && attendanceWindow.endTime
        ? new Date(`${attendanceWindow.endDate}T${attendanceWindow.endTime}`).toISOString()
        : ''

      // Save all three config values
      const updates = [
        { key: 'ATTENDANCE_WINDOW_START', value: startDateTime, category: 'attendance', description: 'Fecha/hora de inicio para confirmar asistencia' },
        { key: 'ATTENDANCE_WINDOW_END', value: endDateTime, category: 'attendance', description: 'Fecha/hora de fin para confirmar asistencia' },
        { key: 'ATTENDANCE_WINDOW_ENABLED', value: String(attendanceWindow.enabled), category: 'attendance', description: 'Habilitar restricción de ventana de tiempo' },
      ]

      for (const update of updates) {
        await fetch(`/api/admin/config/${update.key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        })
      }

      alert('Ventana de asistencia guardada exitosamente')
      fetchConfigs()
    } catch (error) {
      alert('Error al guardar la configuración')
    } finally {
      setSavingAttendance(false)
    }
  }

  const handleTestConnection = async (type: 'database' | 'email') => {
    setTestingConnection(true)

    try {
      const response = await fetch(`/api/admin/config/test/${type}`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ Conexión exitosa!\n\n${data.message || ''}`)
      } else {
        alert(`❌ Error de conexión:\n\n${data.error || 'Error desconocido'}`)
      }
    } catch (error) {
      alert('Error al probar conexión')
    } finally {
      setTestingConnection(false)
    }
  }

  const filteredConfigs = configs.filter(c => c.category === activeCategory)

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="text-gray-600">Gestiona las variables de entorno y configuraciones</p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              activeCategory === cat.name
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className={`w-6 h-6 ${activeCategory === cat.name ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cat.icon} />
              </svg>
              <span className={`font-semibold ${activeCategory === cat.name ? 'text-purple-900' : 'text-gray-700'}`}>
                {cat.label}
              </span>
            </div>
            <p className="text-xs text-gray-500">{cat.description}</p>
          </button>
        ))}
      </div>

      {/* Test Buttons */}
      {(activeCategory === 'database' || activeCategory === 'email') && (
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => handleTestConnection(activeCategory as 'database' | 'email')}
            disabled={testingConnection}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {testingConnection ? 'Probando...' : `Probar Conexión ${activeCategory === 'database' ? 'BD' : 'Email'}`}
          </button>
        </div>
      )}

      {/* Attendance Window Configuration */}
      {activeCategory === 'attendance' && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ventana de Tiempo para Confirmar Asistencia
          </h2>
          <p className="text-gray-600 mb-6">
            Define el rango de fecha y hora durante el cual los miembros pueden confirmar su asistencia.
          </p>

          {/* Enable/Disable Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={attendanceWindow.enabled}
                onChange={(e) => setAttendanceWindow(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="font-medium text-gray-700">
                Habilitar restricción de ventana de tiempo
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-8">
              {attendanceWindow.enabled
                ? 'Los miembros solo podrán confirmar asistencia dentro del rango especificado'
                : 'Los miembros pueden confirmar asistencia en cualquier momento'}
            </p>
          </div>

          {attendanceWindow.enabled && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Start DateTime */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Inicio de Ventana
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={attendanceWindow.startDate}
                      onChange={(e) => setAttendanceWindow(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                    <input
                      type="time"
                      value={attendanceWindow.startTime}
                      onChange={(e) => setAttendanceWindow(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* End DateTime */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fin de Ventana
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={attendanceWindow.endDate}
                      onChange={(e) => setAttendanceWindow(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                    <input
                      type="time"
                      value={attendanceWindow.endTime}
                      onChange={(e) => setAttendanceWindow(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current Status */}
          {attendanceWindow.enabled && attendanceWindow.startDate && attendanceWindow.endDate && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Resumen de la Configuración:</h4>
              <p className="text-sm text-purple-700">
                La confirmación de asistencia estará disponible desde{' '}
                <strong>{attendanceWindow.startDate} a las {attendanceWindow.startTime || '00:00'}</strong>{' '}
                hasta{' '}
                <strong>{attendanceWindow.endDate} a las {attendanceWindow.endTime || '23:59'}</strong>
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6">
            <button
              onClick={handleSaveAttendanceWindow}
              disabled={savingAttendance}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {savingAttendance ? 'Guardando...' : 'Guardar Configuración de Asistencia'}
            </button>
          </div>
        </div>
      )}

      {/* Config Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredConfigs.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No hay configuraciones para esta categoría</p>
              <p className="text-sm mt-2">Las configuraciones se crean automáticamente al usarse</p>
            </div>
          )}

          {filteredConfigs.map((config) => (
            <ConfigRow
              key={config.id}
              config={config}
              isEditing={editing === config.key}
              onEdit={() => setEditing(config.key)}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Advertencia:</strong> Los cambios en la configuración pueden requerir reiniciar la aplicación para tener efecto.
              Ten cuidado al modificar valores de base de datos o email, ya que configuraciones incorrectas pueden hacer que el sistema deje de funcionar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Config Row Component
function ConfigRow({
  config,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: {
  config: ConfigItem
  isEditing: boolean
  onEdit: () => void
  onSave: (key: string, value: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(config.value)
  const [showValue, setShowValue] = useState(false)

  const isSecret = config.key.toLowerCase().includes('password') ||
                   config.key.toLowerCase().includes('secret') ||
                   config.key.toLowerCase().includes('key')

  return (
    <div className="p-6 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 font-mono">
              {config.key}
            </h3>
            {isSecret && (
              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                Secreto
              </span>
            )}
          </div>
          {config.description && (
            <p className="text-sm text-gray-500 mb-3">{config.description}</p>
          )}

          {isEditing ? (
            <div>
              <input
                type={isSecret && !showValue ? 'password' : 'text'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder={`Valor para ${config.key}`}
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onSave(config.key, value)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setValue(config.value)
                    onCancel()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <code className="px-3 py-1 bg-gray-100 rounded font-mono text-sm">
                {isSecret && !showValue ? '••••••••' : config.value || '(no configurado)'}
              </code>
              {isSecret && (
                <button
                  onClick={() => setShowValue(!showValue)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showValue ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <button
            onClick={onEdit}
            className="ml-4 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  )
}
