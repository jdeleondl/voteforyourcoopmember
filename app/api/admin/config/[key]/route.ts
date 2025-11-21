import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'
import { logActivity } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  return withAuth(request, async (session) => {
    try {
      const body = await request.json()
      const { value, category, description } = body
      const { key } = params

      // Upsert config
      const config = await prisma.config.upsert({
        where: { key },
        update: {
          value,
          updatedBy: session.username,
          ...(category && { category }),
          ...(description && { description }),
        },
        create: {
          key,
          value,
          updatedBy: session.username,
          category: category || 'general',
          description: description || null,
        },
      })

      await logActivity(
        session.id,
        'update_config',
        'config',
        config.id,
        { key, value: value.substring(0, 20) + '...' },
        request
      )

      return NextResponse.json({ success: true, config })
    } catch (error) {
      console.error('Error updating config:', error)
      return NextResponse.json(
        { error: 'Error al actualizar configuración' },
        { status: 500 }
      )
    }
  })
}
