#!/usr/bin/env tsx

import { config } from 'dotenv'
import { prisma } from '../lib/db'

config()

async function verifyDatabase() {
  console.log('🔍 Verifying Database Setup...\n')
  
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database Connection: SUCCESS')
    
    // Count records
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const packCount = await prisma.pack.count()
    const orderCount = await prisma.order.count()
    const quizCount = await prisma.quiz.count()
    
    console.log('\n📊 Database Statistics:')
    console.log(`   Users: ${userCount}`)
    console.log(`   Products: ${productCount}`)
    console.log(`   Packs: ${packCount}`)
    console.log(`   Orders: ${orderCount}`)
    console.log(`   Quizzes: ${quizCount}`)
    
    // List admin users
    console.log('\n👤 Admin Users:')
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { email: true, name: true }
    })
    admins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.name || 'No name'})`)
    })
    
    // List products
    console.log('\n📦 Products:')
    const products = await prisma.product.findMany({
      include: { packs: true }
    })
    products.forEach(product => {
      console.log(`   - ${product.title}`)
      console.log(`     Price: £${(product.price / 100).toFixed(2)}`)
      console.log(`     Packs: ${product.packs.length}`)
      console.log(`     Active: ${product.active}`)
    })
    
    // List packs with videos
    console.log('\n🎥 Video Packs:')
    const videoPacks = await prisma.pack.findMany({
      where: { videoId: { not: null } },
      take: 5
    })
    videoPacks.forEach(pack => {
      console.log(`   - ${pack.title}`)
      console.log(`     Video ID: ${pack.videoId}`)
    })
    
    console.log('\n✨ Database verification complete!')
    console.log('\n🔐 Login Credentials:')
    console.log('   admin@englishunleashed.com / changeme123')
    console.log('   test@admin.com / test123456')
    console.log('   debug@test.com / password123')
    
  } catch (error) {
    console.error('❌ Verification failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDatabase()