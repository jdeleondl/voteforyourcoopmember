import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'
import { logActivity } from '@/lib/auth'

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      const { searchParams } = new URL(request.url)
      const council = searchParams.get('council')
      const availableOnly = searchParams.get('availableOnly') === 'true'

      const where: any = {}

      if (council) {
        where.council = council
      }

      const positions = await prisma.position.findMany({
        where,
        include: {
          _count: {
            select: { assignments: true },
          },
          assignments: {
            where: {
              termEndDate: {
                gte: new Date(), // Solo asignaciones activas
              },
            },
            include: {
              member: true,
            },
          },
        },
        orderBy: [
          { council: 'asc' },
          { order: 'asc' },
        ],
      })

      // Mapear con información de asignación activa
      const positionsWithStatus = positions.map(position => {
        const activeAssignment = position.assignments.length > 0 ? position.assignments[0] : null

        return {
          id: position.id,
          name: position.name,
          council: position.council,
          order: position.order,
          createdAt: position.createdAt,
          updatedAt: position.updatedAt,
          isOccupied: !!activeAssignment,
          currentHolder: activeAssignment ? activeAssignment.member.name : null,
          termEndDate: activeAssignment ? activeAssignment.termEndDate : null,
          _count: {
            assignments: position._count.assignments,
          },
        }
      })

      // Filtrar por disponibilidad si es necesario
      const filteredPositions = availableOnly
        ? positionsWithStatus.filter(p => !p.isOccupied || (p.termEndDate && new Date(p.termEndDate) <= new Date()))
        : positionsWithStatus

      return NextResponse.json({ positions: filteredPositions })
    } catch (error) {
      console.error('Error fetching positions:', error)
      return NextResponse.json(
        { error: 'Error al obtener posiciones' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      const body = await request.json()
      const { name, council, order } = body

      // Validations
      if (!name || !council || order === undefined) {
        return NextResponse.json(
          { error: 'Nombre, consejo y orden son requeridos' },
          { status: 400 }
        )
      }

      // Validate council
      const validCouncils = ['vigilancia', 'administracion', 'credito']
      if (!validCouncils.includes(council)) {
        return NextResponse.json(
          { error: 'Consejo no válido' },
          { status: 400 }
        )
      }

      // Check if position already exists
      const existing = await prisma.position.findUnique({
        where: {
          name_council: {
            name,
            council,
          },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Ya existe una posición con ese nombre en este consejo' },
          { status: 400 }
        )
      }

      // Create position (solo name, council, order - la asignación se hace en /admin/assignments)
      const position = await prisma.position.create({
        data: {
          name,
          council,
          order,
        },
      })

      // Log activity
      await logActivity(
        session.id,
        'create_position',
        'position',
        position.id,
        { name, council },
        request
      )

      return NextResponse.json({ success: true, position })
    } catch (error) {
      console.error('Error creating position:', error)
      return NextResponse.json(
        { error: 'Error al crear posición' },
        { status: 500 }
      )
    }
  })
}
