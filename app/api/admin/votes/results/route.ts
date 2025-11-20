import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      // Get all votes with candidate and member info
      const votes = await prisma.vote.findMany({
        include: {
          candidate: true,
          member: true,
        },
      })

      // Get unique voters count
      const uniqueVoters = await prisma.vote.groupBy({
        by: ['memberId'],
      })

      // Get confirmed attendance count
      const confirmedAttendance = await prisma.attendance.count({
        where: { status: 'active' },
      })

      // Get all candidates with their vote counts
      const candidates = await prisma.candidate.findMany({
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

      // Group results by council
      const resultsByCouncil: Record<string, any> = {}

      candidates.forEach((candidate) => {
        if (!resultsByCouncil[candidate.council]) {
          resultsByCouncil[candidate.council] = {
            council: candidate.council,
            candidates: [],
            totalVotes: 0,
          }
        }

        const voteCount = candidate._count.votes

        resultsByCouncil[candidate.council].candidates.push({
          id: candidate.id,
          name: candidate.name,
          bio: candidate.bio,
          photoUrl: candidate.photoUrl,
          status: candidate.status,
          voteCount,
          percentage: 0, // Will calculate after
        })

        resultsByCouncil[candidate.council].totalVotes += voteCount
      })

      // Calculate percentages
      Object.values(resultsByCouncil).forEach((council: any) => {
        council.candidates.forEach((candidate: any) => {
          if (council.totalVotes > 0) {
            candidate.percentage = (candidate.voteCount / council.totalVotes) * 100
          }
        })

        // Sort by vote count descending
        council.candidates.sort((a: any, b: any) => b.voteCount - a.voteCount)
      })

      // Get voting timeline (votes per hour)
      const votingTimeline = await prisma.vote.findMany({
        select: {
          votedAt: true,
        },
        orderBy: {
          votedAt: 'asc',
        },
      })

      // Group votes by hour
      const votesByHour: Record<string, number> = {}
      votingTimeline.forEach((vote) => {
        const hour = new Date(vote.votedAt).toISOString().slice(0, 13) + ':00'
        votesByHour[hour] = (votesByHour[hour] || 0) + 1
      })

      return NextResponse.json({
        summary: {
          totalVotes: votes.length,
          uniqueVoters: uniqueVoters.length,
          confirmedAttendance,
          participationRate: confirmedAttendance > 0
            ? (uniqueVoters.length / confirmedAttendance) * 100
            : 0,
        },
        resultsByCouncil,
        votesByHour,
        lastUpdated: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error fetching vote results:', error)
      return NextResponse.json(
        { error: 'Error al obtener resultados' },
        { status: 500 }
      )
    }
  })
}
