import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const enabledConfig = await prisma.config.findUnique({
      where: { key: 'ATTENDANCE_WINDOW_ENABLED' }
    })

    // If not enabled or not found, allow attendance
    if (!enabledConfig || enabledConfig.value !== 'true') {
      return NextResponse.json({
        restricted: false,
        open: true,
        message: 'La confirmación de asistencia está disponible'
      })
    }

    const startConfig = await prisma.config.findUnique({
      where: { key: 'ATTENDANCE_WINDOW_START' }
    })
    const endConfig = await prisma.config.findUnique({
      where: { key: 'ATTENDANCE_WINDOW_END' }
    })

    const now = new Date()
    let open = true
    let status: 'before' | 'during' | 'after' = 'during'
    let message = 'La confirmación de asistencia está disponible'
    let startDate: Date | null = null
    let endDate: Date | null = null

    if (startConfig?.value) {
      startDate = new Date(startConfig.value)
      if (now < startDate) {
        open = false
        status = 'before'
        message = `La confirmación de asistencia aún no está disponible. Inicia el ${startDate.toLocaleDateString('es-DO')} a las ${startDate.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}`
      }
    }

    if (endConfig?.value) {
      endDate = new Date(endConfig.value)
      if (now > endDate) {
        open = false
        status = 'after'
        message = `El período de confirmación de asistencia ha finalizado. Cerró el ${endDate.toLocaleDateString('es-DO')} a las ${endDate.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}`
      }
    }

    return NextResponse.json({
      restricted: true,
      open,
      status,
      message,
      window: {
        start: startDate?.toISOString() || null,
        end: endDate?.toISOString() || null,
      }
    })
  } catch (error) {
    console.error('Error checking attendance window:', error)
    return NextResponse.json(
      { error: 'Error al verificar ventana de asistencia' },
      { status: 500 }
    )
  }
}
