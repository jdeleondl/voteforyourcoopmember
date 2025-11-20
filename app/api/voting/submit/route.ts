import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, votes } = body // votes es un objeto: { positionId: candidateId }

    if (!code || !votes || typeof votes !== 'object') {
      return NextResponse.json(
        { error: 'Código y votos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar código de votación
    const attendance = await prisma.attendance.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { member: true },
    })

    if (!attendance) {
      return NextResponse.json(
        { error: 'Código de votación inválido' },
        { status: 404 }
      )
    }

    if (attendance.status !== 'active') {
      return NextResponse.json(
        { error: 'Este código de votación no está activo' },
        { status: 400 }
      )
    }

    // Verificar si ya votó
    const existingVotes = await prisma.vote.findMany({
      where: { memberId: attendance.memberId },
    })

    if (existingVotes.length > 0) {
      return NextResponse.json(
        { error: 'Ya has votado anteriormente' },
        { status: 400 }
      )
    }

    // Validar que al menos haya un voto
    const voteEntries = Object.entries(votes)
    if (voteEntries.length === 0) {
      return NextResponse.json(
        { error: 'Debe seleccionar al menos un candidato' },
        { status: 400 }
      )
    }

    // Validar que todos los candidatos existan y pertenezcan a posiciones disponibles
    for (const [positionId, candidateId] of voteEntries) {
      // Verificar posición
      const position = await prisma.position.findUnique({
        where: { id: positionId },
      })

      if (!position) {
        return NextResponse.json(
          { error: `Posición inválida: ${positionId}` },
          { status: 400 }
        )
      }

      // Verificar que la posición esté disponible
      const now = new Date()
      const isAvailable = !position.isOccupied ||
                         (position.termEndDate && position.termEndDate <= now)

      if (!isAvailable) {
        return NextResponse.json(
          { error: `La posición "${position.name}" no está disponible para votación` },
          { status: 400 }
        )
      }

      // Verificar candidato
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId as string },
        include: { position: true },
      })

      if (!candidate) {
        return NextResponse.json(
          { error: `Candidato inválido: ${candidateId}` },
          { status: 400 }
        )
      }

      if (candidate.status !== 'active') {
        return NextResponse.json(
          { error: `El candidato ${candidate.name} no está activo` },
          { status: 400 }
        )
      }

      if (candidate.positionId !== positionId) {
        return NextResponse.json(
          { error: `El candidato ${candidate.name} no pertenece a esta posición` },
          { status: 400 }
        )
      }
    }

    // Registrar votos
    const voteRecords = []
    for (const [positionId, candidateId] of voteEntries) {
      const position = await prisma.position.findUnique({
        where: { id: positionId },
      })

      voteRecords.push({
        memberId: attendance.memberId,
        candidateId: candidateId as string,
        position: position!.name,
      })
    }

    // Crear todos los votos en una transacción
    await prisma.vote.createMany({
      data: voteRecords,
    })

    return NextResponse.json({
      success: true,
      message: 'Voto registrado exitosamente',
      votesCount: voteRecords.length,
    })
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Error al registrar el voto' },
      { status: 500 }
    )
  }
}
