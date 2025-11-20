import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logActivity } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin_session')

    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value)
        await logActivity(session.id, 'logout', 'admin', session.id, undefined, request)
      } catch (e) {
        // Ignorar error de parsing
      }
    }

    cookieStore.delete('admin_session')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}
