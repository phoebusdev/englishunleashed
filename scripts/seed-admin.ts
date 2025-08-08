import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function seedAdmin() {
  const email = 'admin@englishunleashed.com'
  const password = 'changeme123' // Change this!

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        isAdmin: true,
      },
      create: {
        email,
        password: hashedPassword,
        isAdmin: true,
        name: 'Admin',
      },
    })

    console.log('Admin user created/updated:', admin.email)
    console.log('Default password:', password)
    console.log('⚠️  Please change the password after first login!')
  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdmin()