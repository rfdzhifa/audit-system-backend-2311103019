const { PrismaClient, Role } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // =======================
  // ADMIN
  // =======================
  const adminEmail = 'admin@gmail.com'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: await bcrypt.hash('admin123', 10),
        role: Role.ADMIN
      }
    })

    console.log('Admin created')
  } else {
    console.log('Admin already exists')
  }

  // =======================
  // USER DEFAULT
  // =======================
  const userEmail = 'user@gmail.com'

  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail }
  })

  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: 'Regular User',
        email: userEmail,
        password: hashedPassword,
        role: Role.USER
      }
    })

    console.log('User created')
  } else {
    console.log('User already exists')
  }

  // =======================
  // AUDITOR
  // =======================
  const auditorEmail = 'auditor@gmail.com'

  const existingAuditor = await prisma.user.findUnique({
    where: { email: auditorEmail }
  })

  if (!existingAuditor) {
    await prisma.user.create({
      data: {
        name: 'Audit Officer',
        email: auditorEmail,
        password: hashedPassword,
        role: Role.AUDITOR
      }
    })

    console.log('Auditor created')
  } else {
    console.log('Auditor already exists')
  }
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })