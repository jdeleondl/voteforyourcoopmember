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

      const where: any = {}

      if (council) {
        where.council = council
      }

      if (status) {
        where.status = status
      }

      const candidates = await prisma.candidate.findMany({
        where,
        include: {
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
      const { name, council, bio, photoUrl } = body

      // Validations
      if (!name || !council) {
        return NextResponse.json(
          { error: 'Nombre y consejo son requeridos' },
          { status: 400 }
        )
      }

      // Validate council
      const validCouncils = ['vigilancia', 'administracion', 'educacion']
      if (!validCouncils.includes(council)) {
        return NextResponse.json(
          { error: 'Consejo no válido' },
          { status: 400 }
        )
      }

      // Create candidate
      const candidate = await prisma.candidate.create({
        data: {
          name,
          council,
          bio: bio || '',
          photoUrl: photoUrl || null,
          status: 'active',
        },
      })

      // Log activity
      await logActivity(
        session.id,
        'create_candidate',
        'candidate',
        candidate.id,
        { name, council },
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
