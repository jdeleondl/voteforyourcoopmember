import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'
import { logActivity } from '@/lib/auth'

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      const { searchParams } = new URL(request.url)
      const council = searchParams.get('council')
      const status = searchParams.get('status')
      const positionId = searchParams.get('positionId')

      const where: any = {}

      if (council) {
        where.council = council
      }

      if (status) {
        where.status = status
      }

      if (positionId) {
        where.positionId = positionId
      }

      const candidates = await prisma.candidate.findMany({
        where,
        include: {
          position: true,
          _count: {
            select: { votes: true },
          },
        },
        orderBy: [
          { council: 'asc' },
          { name: 'asc' },
        ],
      })

      // Transform the data to include voteCount
      const candidatesWithVotes = candidates.map(candidate => ({
        ...candidate,
        voteCount: candidate._count.votes,
        _count: undefined,
      }))

      return NextResponse.json({ candidates: candidatesWithVotes })
    } catch (error) {
      console.error('Error fetching candidates:', error)
      return NextResponse.json(
        { error: 'Error al obtener candidatos' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      const body = await request.json()
      const { name, positionId, council, bio, photoUrl } = body

      // Validations
      if (!name || !positionId || !council) {
        return NextResponse.json(
          { error: 'Nombre, posición y consejo son requeridos' },
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

      // Verify position exists and is available
      const position = await prisma.position.findUnique({
        where: { id: positionId },
      })

      if (!position) {
        return NextResponse.json(
          { error: 'Posición no encontrada' },
          { status: 404 }
        )
      }

      if (position.isOccupied && position.termEndDate && position.termEndDate > new Date()) {
        return NextResponse.json(
          { error: 'Esta posición está ocupada y el período aún no ha finalizado' },
          { status: 400 }
        )
      }

      // Create candidate
      const candidate = await prisma.candidate.create({
        data: {
          name,
          positionId,
          council,
          bio: bio || '',
          photoUrl: photoUrl || null,
          status: 'active',
        },
        include: {
          position: true,
        },
      })

      // Log activity
      await logActivity(
        session.id,
        'create_candidate',
        'candidate',
        candidate.id,
        { name, position: position.name, council },
        request
      )

      return NextResponse.json({ success: true, candidate })
    } catch (error) {
      console.error('Error creating candidate:', error)
      return NextResponse.json(
        { error: 'Error al crear candidato' },
        { status: 500 }
      )
    }
  })
}
