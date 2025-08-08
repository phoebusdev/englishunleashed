import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugOrders() {
  console.log('🔍 Debugging Order Issues\n')
  
  try {
    // Check all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log('👥 All Users:')
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name || 'No name'}) - Created: ${user.createdAt.toLocaleDateString()}`)
    })
    
    // Check all orders
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        product: true
      }
    })
    
    console.log('\n📦 All Orders:')
    if (orders.length === 0) {
      console.log('  No orders found in database!')
    } else {
      orders.forEach(order => {
        console.log(`  Order ${order.id}:`)
        console.log(`    - User: ${order.user.email}`)
        console.log(`    - Product: ${order.product.title}`)
        console.log(`    - Status: ${order.status}`)
        console.log(`    - Amount: £${(order.amount / 100).toFixed(2)}`)
        console.log(`    - Created: ${order.createdAt.toISOString()}`)
        console.log(`    - Stripe ID: ${order.stripeId || 'None'}`)
      })
    }
    
    // Check for specific user
    const userEmail = process.argv[2]
    if (userEmail) {
      console.log(`\n🔎 Checking orders for user: ${userEmail}`)
      
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: {
          orders: {
            include: {
              product: {
                include: {
                  packs: true
                }
              }
            }
          }
        }
      })
      
      if (!user) {
        console.log('  User not found!')
      } else {
        console.log(`  User ID: ${user.id}`)
        console.log(`  Orders: ${user.orders.length}`)
        
        if (user.orders.length > 0) {
          user.orders.forEach((order, index) => {
            console.log(`\n  Order ${index + 1}:`)
            console.log(`    - Product: ${order.product.title}`)
            console.log(`    - Status: ${order.status}`)
            console.log(`    - Packs: ${order.product.packs.length}`)
          })
        }
      }
    }
    
    // Check products and packs
    console.log('\n📚 Products & Packs:')
    const products = await prisma.product.findMany({
      include: {
        packs: true,
        _count: {
          select: { orders: true }
        }
      }
    })
    
    products.forEach(product => {
      console.log(`  ${product.title}:`)
      console.log(`    - Packs: ${product.packs.length}`)
      console.log(`    - Orders: ${product._count.orders}`)
      console.log(`    - Active: ${product.active}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run with: npx tsx tests/debug-orders.ts [email]
debugOrders()