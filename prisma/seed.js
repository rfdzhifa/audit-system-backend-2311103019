const { PrismaClient, Role } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@gmail.com'

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail
    }
  })

  if (existingAdmin) {
    console.log('Admin already exists')
    return
  }

  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN
    }
  })

  console.log('Default admin created')
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })