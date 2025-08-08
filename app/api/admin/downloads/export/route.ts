import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from 'lib/auth'
import { prisma } from 'lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv'
    const days = parseInt(searchParams.get('days') || '30')
    
    // Get download data
    const downloads = await prisma.downloadLog.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get related data
    const userIds = [...new Set(downloads.filter(d => d.userId).map(d => d.userId!))]
    const packIds = [...new Set(downloads.map(d => d.packId))]
    const orderIds = [...new Set(downloads.map(d => d.orderId))]
    
    const [users, packs, orders] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, name: true }
      }),
      prisma.pack.findMany({
        where: { id: { in: packIds } },
        select: { id: true, title: true }
      }),
      prisma.order.findMany({
        where: { id: { in: orderIds } },
        select: { id: true, amount: true, createdAt: true }
      })
    ])

    // Create user and pack maps for quick lookup
    const userMap = new Map(users.map(u => [u.id, u]))
    const packMap = new Map(packs.map(p => [p.id, p]))
    const orderMap = new Map(orders.map(o => [o.id, o]))

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Download Date',
        'User Email',
        'User Name',
        'Pack Title',
        'Order Amount',
        'Order Date',
        'IP Address',
        'Browser',
        'OS',
        'Referrer'
      ]

      const rows = downloads.map(download => {
        const user = download.userId ? userMap.get(download.userId) : null
        const pack = packMap.get(download.packId)
        const order = orderMap.get(download.orderId)
        
        return [
          download.createdAt.toISOString(),
          user?.email || 'Guest',
          user?.name || '',
          pack?.title || 'Unknown',
          order ? (order.amount / 100).toFixed(2) : '',
          order?.createdAt.toISOString() || '',
          download.ipAddress || '',
          getBrowserFromUserAgent(download.userAgent),
          getOSFromUserAgent(download.userAgent),
          download.referrer || 'Direct'
        ]
      })

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="downloads-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      // Return JSON
      const data = downloads.map(download => {
        const user = download.userId ? userMap.get(download.userId) : null
        const pack = packMap.get(download.packId)
        const order = orderMap.get(download.orderId)
        
        return {
          id: download.id,
          downloadDate: download.createdAt,
          user: user ? { email: user.email, name: user.name } : null,
          pack: pack?.title || 'Unknown',
          order: order ? {
            amount: order.amount / 100,
            date: order.createdAt
          } : null,
          ipAddress: download.ipAddress,
          browser: getBrowserFromUserAgent(download.userAgent),
          os: getOSFromUserAgent(download.userAgent),
          referrer: download.referrer || 'Direct'
        }
      })

      return NextResponse.json({
        downloads: data,
        count: data.length,
        period: `${days} days`
      })
    }
  } catch (error) {
    console.error('Download export error:', error)
    return NextResponse.json(
      { error: 'Failed to export downloads' },
      { status: 500 }
    )
  }
}

function getBrowserFromUserAgent(userAgent: string | null): string {
  if (!userAgent) return 'Unknown'
  
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('Opera')) return 'Opera'
  
  return 'Other'
}

function getOSFromUserAgent(userAgent: string | null): string {
  if (!userAgent) return 'Unknown'
  
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Mac OS')) return 'macOS'
  if (userAgent.includes('Linux')) return 'Linux'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS'
  
  return 'Other'
}