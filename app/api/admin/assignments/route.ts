import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'
import { logActivity } from '@/lib/auth'

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      const { searchParams } = new URL(request.url)
      const council = searchParams.get('council')
      const activeOnly = searchParams.get('activeOnly')

      const where: any = {}

      // Filter by active assignments only
      if (activeOnly === 'true') {
        where.termEndDate = {
          gte: new Date(),
        }
      }

      // Get all assignments with position and member info
      const assignments = await prisma.positionAssignment.findMany({
        where,
        include: {
          position: true,
          member: true,
        },
        orderBy: [
          { position: { council: 'asc' } },
          { position: { order: 'asc' } },
          { termEndDate: 'desc' },
        ],
      })

      // Filter by council if provided
      const filteredAssignments = council
        ? assignments.filter(a => a.position.council === council)
        : assignments

      return NextResponse.json({ assignments: filteredAssignments })
    } catch (error) {
      console.error('Error fetching assignments:', error)
      return NextResponse.json(
        { error: 'Error al obtener asignaciones' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      const body = await request.json()
      const { positionId, memberId, termStartDate, termEndDate } = body

      // Validations
      if (!positionId || !memberId || !termEndDate) {
        return NextResponse.json(
          { error: 'Posición, miembro y fecha de término son requeridos' },
          { status: 400 }
        )
      }

      // Verify position exists
      const position = await prisma.position.findUnique({
        where: { id: positionId },
      })

      if (!position) {
        return NextResponse.json(
          { error: 'Posición no encontrada' },
          { status: 404 }
        )
      }

      // Verify member exists
      const member = await prisma.member.findUnique({
        where: { id: memberId },
      })

      if (!member) {
        return NextResponse.json(
          { error: 'Miembro no encontrado' },
          { status: 404 }
        )
      }

      // Check if this position already has an active assignment
      const existingAssignment = await prisma.positionAssignment.findFirst({
        where: {
          positionId,
          termEndDate: {
            gte: new Date(),
          },
        },
        include: {
          member: true,
        },
      })

      if (existingAssignment) {
        return NextResponse.json(
          {
            error: `Esta posición ya está asignada a ${existingAssignment.member.name} hasta ${new Date(existingAssignment.termEndDate).toLocaleDateString('es-DO')}`,
          },
          { status: 400 }
        )
      }

      // Create assignment
      const assignment = await prisma.positionAssignment.create({
        data: {
          positionId,
          memberId,
          termStartDate: termStartDate ? new Date(termStartDate) : new Date(),
          termEndDate: new Date(termEndDate),
        },
        include: {
          position: true,
          member: true,
        },
      })

      // Log activity
      await logActivity(
        session.id,
        'create_assignment',
        'position_assignment',
        assignment.id,
        {
          positionName: position.name,
          memberName: member.name,
          termEndDate: assignment.termEndDate,
        },
        request
      )

      return NextResponse.json({ success: true, assignment })
    } catch (error) {
      console.error('Error creating assignment:', error)
      return NextResponse.json(
        { error: 'Error al crear asignación' },
        { status: 500 }
      )
    }
  })
}
