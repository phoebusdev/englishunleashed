#!/usr/bin/env tsx

import { config } from 'dotenv'
import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

config()

async function testAuth() {
  console.log('🔐 Testing Authentication...\n')
  
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected\n')
    
    // List all users
    console.log('📊 All Users in Database:')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true,
        isAdmin: true,
      }
    })
    
    for (const user of users) {
      console.log(`\nUser: ${user.email}`)
      console.log(`  ID: ${user.id}`)
      console.log(`  Admin: ${user.isAdmin}`)
      console.log(`  Has Password: ${!!user.password}`)
      
      if (user.password) {
        // Test password
        const testPasswords = ['test123456', 'changeme123', 'testpass123']
        console.log('  Testing passwords:')
        for (const testPass of testPasswords) {
          const isValid = await bcrypt.compare(testPass, user.password)
          if (isValid) {
            console.log(`    ✅ Password works: ${testPass}`)
          }
        }
      }
    }
    
    // Create a new test user with a known password
    console.log('\n🔧 Creating new test user...')
    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newUser = await prisma.user.upsert({
      where: { email: 'debug@test.com' },
      update: {
        password: hashedPassword,
        isAdmin: true,
      },
      create: {
        email: 'debug@test.com',
        password: hashedPassword,
        name: 'Debug User',
        isAdmin: true,
      },
    })
    
    console.log('✅ New test user created:')
    console.log('   Email: debug@test.com')
    console.log('   Password: password123')
    console.log('   Admin: true')
    
    // Verify the password works
    const verifyUser = await prisma.user.findUnique({
      where: { email: 'debug@test.com' }
    })
    
    if (verifyUser && verifyUser.password) {
      const isValid = await bcrypt.compare('password123', verifyUser.password)
      console.log(`\n✅ Password verification: ${isValid ? 'SUCCESS' : 'FAILED'}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()