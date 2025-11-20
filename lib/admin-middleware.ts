import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function requireAuth(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin_session')

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    return session
  } catch (error) {
    return null
  }
}

export async function withAuth(
  request: NextRequest,
  handler: (session: any) => Promise<NextResponse>
) {
  const session = await requireAuth(request)

  if (!session) {
    return NextResponse.json(
      { error: 'No autenticado. Inicia sesión primero.' },
      { status: 401 }
    )
  }

  return handler(session)
}
