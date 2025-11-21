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
      const { bio, photoUrl, status, council } = body

      // Check if candidate exists
      const existing = await prisma.candidate.findUnique({
        where: { id },
        include: {
          member: true,
        },
      })

      if (!existing) {
        return NextResponse.json(
          { error: 'Candidato no encontrado' },
          { status: 404 }
        )
      }

      // Validate status if provided
      if (status) {
        const validStatuses = ['active', 'inactive']
        if (!validStatuses.includes(status)) {
          return NextResponse.json(
            { error: 'Estado no válido' },
            { status: 400 }
          )
        }
      }

      // Validate council if provided
      if (council) {
        const validCouncils = ['administracion', 'vigilancia', 'credito']
        if (!validCouncils.includes(council)) {
          return NextResponse.json(
            { error: 'Consejo/Comité no válido' },
            { status: 400 }
          )
        }
      }

      // Build update data (can only update bio, photoUrl, status, council)
      const updateData: any = {}
      if (bio !== undefined) updateData.bio = bio
      if (photoUrl !== undefined) updateData.photoUrl = photoUrl
      if (status !== undefined) updateData.status = status
      if (council !== undefined) updateData.council = council

      // Update candidate
      const candidate = await prisma.candidate.update({
        where: { id },
        data: updateData,
        include: {
          member: true,
        },
      })

      // Log activity
      await logActivity(
        session.id,
        'update_candidate',
        'candidate',
        id,
        {
          memberName: candidate.member.name,
          changes: updateData,
        },
        request
      )

      return NextResponse.json({ success: true, candidate })
    } catch (error) {
      console.error('Error updating candidate:', error)
      return NextResponse.json(
        { error: 'Error al actualizar candidato' },
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

      // Check if candidate exists
      const candidate = await prisma.candidate.findUnique({
        where: { id },
        include: {
          member: true,
          _count: {
            select: { votes: true },
          },
        },
      })

      if (!candidate) {
        return NextResponse.json(
          { error: 'Candidato no encontrado' },
          { status: 404 }
        )
      }

      // Delete all votes for this candidate first
      if (candidate._count.votes > 0) {
        await prisma.vote.deleteMany({
          where: { candidateId: id },
        })
      }

      // Delete candidate
      await prisma.candidate.delete({
        where: { id },
      })

      // Log activity
      await logActivity(
        session.id,
        'delete_candidate',
        'candidate',
        id,
        { memberName: candidate.member.name, council: candidate.council, votesDeleted: candidate._count.votes },
        request
      )

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting candidate:', error)
      return NextResponse.json(
        { error: 'Error al eliminar candidato' },
        { status: 500 }
      )
    }
  })
}
