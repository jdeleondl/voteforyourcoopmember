import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      const { searchParams } = new URL(request.url)
      const action = searchParams.get('action')
      const entity = searchParams.get('entity')
      const adminId = searchParams.get('adminId')
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')
      const limit = parseInt(searchParams.get('limit') || '100')
      const offset = parseInt(searchParams.get('offset') || '0')

      // Build where clause
      const where: any = {}

      if (action) {
        where.action = action
      }

      if (entity) {
        where.entity = entity
      }

      if (adminId) {
        where.adminId = adminId
      }

      if (dateFrom || dateTo) {
        where.timestamp = {}
        if (dateFrom) {
          where.timestamp.gte = new Date(dateFrom)
        }
        if (dateTo) {
          where.timestamp.lte = new Date(dateTo)
        }
      }

      // Fetch logs
      const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
          where,
          include: {
            admin: {
              select: {
                name: true,
                username: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: limit,
          skip: offset,
        }),
        prisma.activityLog.count({ where }),
      ])

      // Get unique actions and entities for filters
      const [actions, entities] = await Promise.all([
        prisma.activityLog.findMany({
          select: { action: true },
          distinct: ['action'],
          orderBy: { action: 'asc' },
        }),
        prisma.activityLog.findMany({
          select: { entity: true },
          where: { entity: { not: null } },
          distinct: ['entity'],
          orderBy: { entity: 'asc' },
        }),
      ])

      return NextResponse.json({
        logs,
        total,
        limit,
        offset,
        filters: {
          actions: actions.map(a => a.action),
          entities: entities.map(e => e.entity),
        },
      })
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      return NextResponse.json(
        { error: 'Error al obtener registros de actividad' },
        { status: 500 }
      )
    }
  })
}
