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
          member: true,
          _count: {
            select: { votes: true },
          },
        },
        orderBy: [
          { council: 'asc' },
          { displayOrder: 'asc' },
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
      const { memberId, council, bio, photoUrl } = body

      // Validations
      if (!memberId || !council) {
        return NextResponse.json(
          { error: 'Miembro y consejo son requeridos' },
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

      // Verify member exists
      const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: {
          attendance: true,
          positionAssignments: {
            where: {
              termEndDate: {
                gte: new Date(),
              },
            },
          },
          candidates: {
            where: {
              council,
              status: 'active',
            },
          },
        },
      })

      if (!member) {
        return NextResponse.json(
          { error: 'Miembro no encontrado' },
          { status: 404 }
        )
      }

      // Check if member has confirmed attendance
      if (!member.attendance || member.attendance.status !== 'active') {
        return NextResponse.json(
          { error: 'El miembro debe tener asistencia confirmada para ser candidato' },
          { status: 400 }
        )
      }

      // Check if member has an active position assignment
      if (member.positionAssignments && member.positionAssignments.length > 0) {
        const activeAssignment = member.positionAssignments[0]
        const position = await prisma.position.findUnique({
          where: { id: activeAssignment.positionId },
        })
        return NextResponse.json(
          {
            error: `Este miembro ocupa actualmente el cargo de ${position?.name} hasta ${new Date(activeAssignment.termEndDate).toLocaleDateString('es-DO')} y no puede ser candidato`,
          },
          { status: 400 }
        )
      }

      // Check if member is already a candidate for this council
      if (member.candidates && member.candidates.length > 0) {
        return NextResponse.json(
          { error: 'Este miembro ya es candidato para este consejo' },
          { status: 400 }
        )
      }

      // Calculate the next displayOrder for this council
      const lastCandidate = await prisma.candidate.findFirst({
        where: { council },
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      })
      const nextDisplayOrder = lastCandidate ? lastCandidate.displayOrder + 1 : 1

      // Create candidate
      const candidate = await prisma.candidate.create({
        data: {
          memberId,
          council,
          displayOrder: nextDisplayOrder,
          bio: bio || null,
          photoUrl: photoUrl || null,
          status: 'active',
        },
        include: {
          member: true,
        },
      })

      // Log activity
      await logActivity(
        session.id,
        'create_candidate',
        'candidate',
        candidate.id,
        { memberName: member.name, council },
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
