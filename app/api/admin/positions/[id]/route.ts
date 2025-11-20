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
      const { name, council, order, isOccupied, currentHolder, termEndDate } = body

      // Check if position exists
      const existing = await prisma.position.findUnique({
        where: { id },
      })

      if (!existing) {
        return NextResponse.json(
          { error: 'Posición no encontrada' },
          { status: 404 }
        )
      }

      // Build update data
      const updateData: any = {}
      if (name !== undefined) updateData.name = name
      if (council !== undefined) updateData.council = council
      if (order !== undefined) updateData.order = order
      if (isOccupied !== undefined) updateData.isOccupied = isOccupied
      if (currentHolder !== undefined) updateData.currentHolder = currentHolder
      if (termEndDate !== undefined) {
        updateData.termEndDate = termEndDate ? new Date(termEndDate) : null
      }

      // Update position
      const position = await prisma.position.update({
        where: { id },
        data: updateData,
      })

      // Log activity
      await logActivity(
        session.id,
        'update_position',
        'position',
        id,
        {
          name: position.name,
          changes: updateData,
        },
        request
      )

      return NextResponse.json({ success: true, position })
    } catch (error) {
      console.error('Error updating position:', error)
      return NextResponse.json(
        { error: 'Error al actualizar posición' },
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

      // Check if position exists
      const position = await prisma.position.findUnique({
        where: { id },
        include: {
          _count: {
            select: { candidates: true },
          },
        },
      })

      if (!position) {
        return NextResponse.json(
          { error: 'Posición no encontrada' },
          { status: 404 }
        )
      }

      // Check if position has candidates
      if (position._count.candidates > 0) {
        return NextResponse.json(
          { error: `No se puede eliminar. Esta posición tiene ${position._count.candidates} candidatos registrados.` },
          { status: 400 }
        )
      }

      // Delete position
      await prisma.position.delete({
        where: { id },
      })

      // Log activity
      await logActivity(
        session.id,
        'delete_position',
        'position',
        id,
        { name: position.name, council: position.council },
        request
      )

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting position:', error)
      return NextResponse.json(
        { error: 'Error al eliminar posición' },
        { status: 500 }
      )
    }
  })
}
