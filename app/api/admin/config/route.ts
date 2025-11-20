import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      const configs = await prisma.config.findMany({
        orderBy: [
          { category: 'asc' },
          { key: 'asc' },
        ],
      })

      return NextResponse.json({ configs })
    } catch (error) {
      console.error('Error fetching configs:', error)
      return NextResponse.json(
        { error: 'Error al obtener configuraciones' },
        { status: 500 }
      )
    }
  })
}
