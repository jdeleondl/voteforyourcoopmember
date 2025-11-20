import { prisma } from './prisma'

// Simple authentication using cookies (en producción usar NextAuth.js o similar)

export interface AdminSession {
  id: string
  username: string
  name: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  // En producción, usar bcrypt. Para simplicidad, usamos base64
  // NOTA: Esto es solo para demostración. En producción SIEMPRE usar bcrypt
  return Buffer.from(password).toString('base64')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(password)
  return hashed === hash
}

export async function createAdmin(data: {
  username: string
  password: string
  name: string
  email: string
  role?: string
}) {
  const hashedPassword = await hashPassword(data.password)

  return prisma.admin.create({
    data: {
      username: data.username,
      password: hashedPassword,
      name: data.name,
      email: data.email,
      role: data.role || 'admin',
    },
  })
}

export async function authenticateAdmin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({
    where: { username },
  })

  if (!admin) {
    return null
  }

  const isValid = await verifyPassword(password, admin.password)
  if (!isValid) {
    return null
  }

  // Actualizar último login
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() },
  })

  return {
    id: admin.id,
    username: admin.username,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  }
}

export async function logActivity(
  adminId: string | null,
  action: string,
  entity?: string,
  entityId?: string,
  details?: any,
  request?: Request
) {
  const ipAddress = request?.headers.get('x-forwarded-for') ||
                    request?.headers.get('x-real-ip') ||
                    'unknown'
  const userAgent = request?.headers.get('user-agent') || 'unknown'

  return prisma.activityLog.create({
    data: {
      adminId,
      action,
      entity,
      entityId,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
      userAgent,
    },
  })
}
