import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'
import { logActivity } from '@/lib/auth'

// PUT - Update member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (session) => {
    try {
      const body = await request.json()
      const { name, email, cedula, phone, status } = body
      const { id } = params

      if (!name || !email || !cedula) {
        return NextResponse.json(
          { error: 'Nombre, email y cédula son requeridos' },
          { status: 400 }
        )
      }

      // Check if email or cedula already exists for another member
      const existing = await prisma.member.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                { email },
                { cedula },
              ],
            },
          ],
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Ya existe otro miembro con ese email o cédula' },
          { status: 400 }
        )
      }

      const member = await prisma.member.update({
        where: { id },
        data: {
          name,
          email,
          cedula,
          phone: phone || null,
          status: status || 'active',
        },
      })

      await logActivity(
        session.id,
        'update_member',
        'member',
        member.id,
        { name, email, cedula, status },
        request
      )

      return NextResponse.json({ success: true, member })
    } catch (error) {
      console.error('Error updating member:', error)
      return NextResponse.json(
        { error: 'Error al actualizar miembro' },
        { status: 500 }
      )
    }
  })
}

// DELETE - Delete member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (session) => {
    try {
      const { id } = params

      // Check if member has attendance or votes
      const member = await prisma.member.findUnique({
        where: { id },
        include: {
          attendance: true,
          votes: true,
        },
      })

      if (!member) {
        return NextResponse.json(
          { error: 'Miembro no encontrado' },
          { status: 404 }
        )
      }

      if (member.votes.length > 0) {
        return NextResponse.json(
          { error: 'No se puede eliminar un miembro que ya votó' },
          { status: 400 }
        )
      }

      // Delete attendance if exists
      if (member.attendance) {
        await prisma.attendance.delete({
          where: { id: member.attendance.id },
        })
      }

      // Delete member
      await prisma.member.delete({
        where: { id },
      })

      await logActivity(
        session.id,
        'delete_member',
        'member',
        id,
        { name: member.name },
        request
      )

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting member:', error)
      return NextResponse.json(
        { error: 'Error al eliminar miembro' },
        { status: 500 }
      )
    }
  })
}
