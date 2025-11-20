import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'
import { logActivity } from '@/lib/auth'

// GET - List all members
export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      const members = await prisma.member.findMany({
        include: {
          attendance: true,
          votes: true,
        },
        orderBy: {
          name: 'asc',
        },
      })

      const membersData = members.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        cedula: member.cedula,
        phone: member.phone,
        status: member.status,
        createdAt: member.createdAt.toISOString(),
        hasAttendance: !!member.attendance,
        hasVoted: member.votes.length > 0,
      }))

      return NextResponse.json({ members: membersData })
    } catch (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json(
        { error: 'Error al obtener miembros' },
        { status: 500 }
      )
    }
  })
}

// POST - Create new member
export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      const body = await request.json()
      const { name, email, cedula, phone, status } = body

      if (!name || !email || !cedula) {
        return NextResponse.json(
          { error: 'Nombre, email y cédula son requeridos' },
          { status: 400 }
        )
      }

      // Check if email or cedula already exists
      const existing = await prisma.member.findFirst({
        where: {
          OR: [
            { email },
            { cedula },
          ],
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Ya existe un miembro con ese email o cédula' },
          { status: 400 }
        )
      }

      const member = await prisma.member.create({
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
        'create_member',
        'member',
        member.id,
        { name, email, cedula },
        request
      )

      return NextResponse.json({ success: true, member })
    } catch (error) {
      console.error('Error creating member:', error)
      return NextResponse.json(
        { error: 'Error al crear miembro' },
        { status: 500 }
      )
    }
  })
}
