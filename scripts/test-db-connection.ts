#!/usr/bin/env tsx

import { config } from 'dotenv'
import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

config()

async function testDatabase() {
  console.log('🔍 Testing Database Connection...\n')
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
  
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!\n')
    
    // Check users
    console.log('📊 Current Users:')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true
      }
    })
    
    if (users.length === 0) {
      console.log('   No users found')
    } else {
      users.forEach(user => {
        console.log(`   - ${user.email} (Admin: ${user.isAdmin}, Created: ${user.createdAt.toLocaleDateString()})`)
      })
    }
    
    // Check products
    console.log('\n📦 Current Products:')
    const products = await prisma.product.findMany({
      include: {
        packs: true
      }
    })
    
    if (products.length === 0) {
      console.log('   No products found')
    } else {
      products.forEach(product => {
        console.log(`   - ${product.title} (£${(product.price / 100).toFixed(2)}, Active: ${product.active})`)
        console.log(`     Packs: ${product.packs.length}`)
      })
    }
    
    // Check packs
    console.log('\n📚 Current Packs:')
    const packs = await prisma.pack.findMany({
      take: 5
    })
    
    if (packs.length === 0) {
      console.log('   No packs found')
    } else {
      packs.forEach(pack => {
        console.log(`   - ${pack.title}`)
        console.log(`     Video: ${pack.videoId || 'None'}, PDF: ${pack.hasPdf}, Quiz: ${pack.hasQuiz}`)
      })
    }
    
    // Create a test admin user with known password
    console.log('\n👤 Creating/Updating Test Admin User...')
    const password = 'test123456'
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const testAdmin = await prisma.user.upsert({
      where: { email: 'test@admin.com' },
      update: {
        password: hashedPassword,
        isAdmin: true,
      },
      create: {
        email: 'test@admin.com',
        password: hashedPassword,
        name: 'Test Admin',
        isAdmin: true,
      },
    })
    
    console.log('✅ Test admin created/updated:')
    console.log('   Email: test@admin.com')
    console.log('   Password: test123456')
    
    // Create sample content
    console.log('\n📝 Creating Sample Content...')
    
    // Create a sample product with pack
    const sampleProduct = await prisma.product.upsert({
      where: { 
        id: 'sample-product-1' 
      },
      update: {
        title: 'Complete English Basics Bundle',
        description: 'Everything you need to start learning English',
        price: 1999, // £19.99
        type: 'BUNDLE',
        active: true,
      },
      create: {
        id: 'sample-product-1',
        title: 'Complete English Basics Bundle',
        description: 'Everything you need to start learning English',
        price: 1999, // £19.99
        type: 'BUNDLE',
        active: true,
        stripePaymentLinkId: 'link_sample',
        stripePaymentLinkUrl: 'https://buy.stripe.com/test_sample',
      }
    })
    
    console.log('✅ Sample product created:', sampleProduct.title)
    
    // Create sample packs with videos
    const samplePacks = [
      {
        id: 'pack-1',
        title: 'Lesson 1: Introduction to English',
        description: 'Learn the basics of English pronunciation',
        videoId: 'jNQXAC9IVRw', // "Me at the zoo" - first YouTube video
        productId: sampleProduct.id,
      },
      {
        id: 'pack-2',
        title: 'Lesson 2: Daily Conversations',
        description: 'Common phrases for everyday use',
        videoId: 'dQw4w9WgXcQ', // Rick Roll for testing
        productId: sampleProduct.id,
      },
      {
        id: 'pack-3',
        title: 'Lesson 3: British Pronunciation',
        description: 'Master the British accent',
        videoId: '9bZkp7q19f0', // Gangnam Style for variety
        productId: sampleProduct.id,
      }
    ]
    
    for (const packData of samplePacks) {
      const pack = await prisma.pack.upsert({
        where: { id: packData.id },
        update: {
          title: packData.title,
          description: packData.description,
          videoId: packData.videoId,
          hasPdf: true,
          hasQuiz: false,
        },
        create: {
          ...packData,
          hasPdf: true,
          hasQuiz: false,
        }
      })
      console.log(`✅ Pack created: ${pack.title}`)
    }
    
    // Create standalone video packs (not tied to products)
    const videoPacks = [
      {
        id: 'video-pack-1',
        title: 'Free Lesson: English Greetings',
        description: 'Learn how to greet people in English',
        videoId: 'J7hHCnJ8Kf4', // Random educational video ID
      },
      {
        id: 'video-pack-2',
        title: 'Free Lesson: Numbers in English',
        description: 'Count from 1 to 100 in English',
        videoId: 'D0Ajq682yrA', // Random educational video ID
      }
    ]
    
    for (const videoData of videoPacks) {
      const pack = await prisma.pack.upsert({
        where: { id: videoData.id },
        update: {
          ...videoData,
          hasPdf: false,
          hasQuiz: false,
        },
        create: {
          ...videoData,
          productId: sampleProduct.id, // Add to product for now
          hasPdf: false,
          hasQuiz: false,
        }
      })
      console.log(`✅ Video pack created: ${pack.title}`)
    }
    
    console.log('\n✨ Database setup complete!')
    console.log('\nYou can now login with:')
    console.log('Email: test@admin.com')
    console.log('Password: test123456')
    
  } catch (error) {
    console.error('❌ Database Error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()