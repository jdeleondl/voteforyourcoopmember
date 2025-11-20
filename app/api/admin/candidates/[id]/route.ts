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
      const { name, positionId, council, bio, photoUrl, status } = body

      // Check if candidate exists
      const existing = await prisma.candidate.findUnique({
        where: { id },
      })

      if (!existing) {
        return NextResponse.json(
          { error: 'Candidato no encontrado' },
          { status: 404 }
        )
      }

      // Validate council if provided
      if (council) {
        const validCouncils = ['vigilancia', 'administracion', 'credito']
        if (!validCouncils.includes(council)) {
          return NextResponse.json(
            { error: 'Consejo no válido' },
            { status: 400 }
          )
        }
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

      // Verify position if provided
      if (positionId) {
        const position = await prisma.position.findUnique({
          where: { id: positionId },
        })

        if (!position) {
          return NextResponse.json(
            { error: 'Posición no encontrada' },
            { status: 404 }
          )
        }
      }

      // Build update data
      const updateData: any = {}
      if (name !== undefined) updateData.name = name
      if (positionId !== undefined) updateData.positionId = positionId
      if (council !== undefined) updateData.council = council
      if (bio !== undefined) updateData.bio = bio
      if (photoUrl !== undefined) updateData.photoUrl = photoUrl
      if (status !== undefined) updateData.status = status

      // Update candidate
      const candidate = await prisma.candidate.update({
        where: { id },
        data: updateData,
        include: {
          position: true,
        },
      })

      // Log activity
      await logActivity(
        session.id,
        'update_candidate',
        'candidate',
        id,
        {
          name: candidate.name,
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

      // Check if candidate has votes
      if (candidate._count.votes > 0) {
        return NextResponse.json(
          { error: `No se puede eliminar. El candidato tiene ${candidate._count.votes} votos registrados.` },
          { status: 400 }
        )
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
        { name: candidate.name, council: candidate.council },
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
