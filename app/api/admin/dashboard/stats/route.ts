import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      // Members stats
      const totalMembers = await prisma.member.count()
      const activeMembers = await prisma.member.count({
        where: { status: 'active' }
      })
      const inactiveMembers = totalMembers - activeMembers

      // Attendance stats
      const confirmedAttendance = await prisma.attendance.count()
      const attendancePercentage = totalMembers > 0
        ? (confirmedAttendance / totalMembers) * 100
        : 0

      // Votes stats
      const uniqueVoters = await prisma.vote.groupBy({
        by: ['memberId'],
      })
      const totalVotes = uniqueVoters.length
      const votesPercentage = confirmedAttendance > 0
        ? (totalVotes / confirmedAttendance) * 100
        : 0

      // Candidates stats
      const totalCandidates = await prisma.candidate.count({
        where: { status: 'active' }
      })
      const candidatesByCouncil = await prisma.candidate.groupBy({
        by: ['council'],
        where: { status: 'active' },
        _count: true,
      })

      const byCouncil: Record<string, number> = {}
      candidatesByCouncil.forEach(item => {
        byCouncil[item.council] = item._count
      })

      return NextResponse.json({
        members: {
          total: totalMembers,
          active: activeMembers,
          inactive: inactiveMembers,
        },
        attendance: {
          confirmed: confirmedAttendance,
          pending: totalMembers - confirmedAttendance,
          percentage: attendancePercentage,
        },
        votes: {
          total: totalVotes,
          percentage: votesPercentage,
        },
        candidates: {
          total: totalCandidates,
          byCouncil,
        },
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return NextResponse.json(
        { error: 'Error al obtener estadísticas' },
        { status: 500 }
      )
    }
  })
}
