import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'
import { logActivity } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (session) => {
    try {
      const { id } = params
      const body = await request.json()
      const { termStartDate, termEndDate } = body

      // Check if assignment exists
      const existing = await prisma.positionAssignment.findUnique({
        where: { id },
        include: {
          position: true,
          member: true,
        },
      })

      if (!existing) {
        return NextResponse.json(
          { error: 'Asignación no encontrada' },
          { status: 404 }
        )
      }

      // Build update data
      const updateData: any = {}
      if (termStartDate !== undefined) updateData.termStartDate = new Date(termStartDate)
      if (termEndDate !== undefined) updateData.termEndDate = new Date(termEndDate)

      // Update assignment
      const assignment = await prisma.positionAssignment.update({
        where: { id },
        data: updateData,
        include: {
          position: true,
          member: true,
        },
      })

      // Log activity
      await logActivity(
        session.id,
        'update_assignment',
        'position_assignment',
        id,
        {
          positionName: assignment.position.name,
          memberName: assignment.member.name,
          changes: updateData,
        },
        request
      )

      return NextResponse.json({ success: true, assignment })
    } catch (error) {
      console.error('Error updating assignment:', error)
      return NextResponse.json(
        { error: 'Error al actualizar asignación' },
        { status: 500 }
      )
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (session) => {
    try {
      const { id } = params

      // Check if assignment exists
      const assignment = await prisma.positionAssignment.findUnique({
        where: { id },
        include: {
          position: true,
          member: true,
        },
      })

      if (!assignment) {
        return NextResponse.json(
          { error: 'Asignación no encontrada' },
          { status: 404 }
        )
      }

      // Delete assignment
      await prisma.positionAssignment.delete({
        where: { id },
      })

      // Log activity
      await logActivity(
        session.id,
        'delete_assignment',
        'position_assignment',
        id,
        {
          positionName: assignment.position.name,
          memberName: assignment.member.name,
        },
        request
      )

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting assignment:', error)
      return NextResponse.json(
        { error: 'Error al eliminar asignación' },
        { status: 500 }
      )
    }
  })
}
