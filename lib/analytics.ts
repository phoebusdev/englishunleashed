import { headers } from 'next/headers'
import { prisma } from './db'

// Simple session ID generation (you can use a more robust solution)
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Parse user agent (simple version without external dependencies)
export function parseUserAgent(userAgent: string | null) {
  if (!userAgent) return { browser: null, os: null, device: null }
  
  const ua = userAgent.toLowerCase()
  
  // Detect browser
  let browser = null
  if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('edge')) browser = 'Edge'
  
  // Detect OS
  let os = null
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'MacOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'
  
  // Detect device type
  let device = 'desktop'
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) device = 'mobile'
  else if (ua.includes('tablet') || ua.includes('ipad')) device = 'tablet'
  
  return { browser, os, device }
}

// Parse referrer for traffic source
export function parseTrafficSource(referrer: string | null, url: URL) {
  if (!referrer) return { source: 'direct', medium: 'none', campaign: null }
  
  const ref = new URL(referrer)
  const utmSource = url.searchParams.get('utm_source')
  const utmMedium = url.searchParams.get('utm_medium')
  const utmCampaign = url.searchParams.get('utm_campaign')
  
  if (utmSource) {
    return {
      source: utmSource,
      medium: utmMedium || 'none',
      campaign: utmCampaign
    }
  }
  
  const hostname = ref.hostname.toLowerCase()
  
  // Search engines
  if (hostname.includes('google')) {
    return { source: 'google', medium: 'organic', campaign: null }
  }
  if (hostname.includes('bing')) {
    return { source: 'bing', medium: 'organic', campaign: null }
  }
  if (hostname.includes('yahoo')) {
    return { source: 'yahoo', medium: 'organic', campaign: null }
  }
  if (hostname.includes('duckduckgo')) {
    return { source: 'duckduckgo', medium: 'organic', campaign: null }
  }
  
  // Social media
  if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
    return { source: 'facebook', medium: 'social', campaign: null }
  }
  if (hostname.includes('instagram.com')) {
    return { source: 'instagram', medium: 'social', campaign: null }
  }
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return { source: 'twitter', medium: 'social', campaign: null }
  }
  if (hostname.includes('linkedin.com')) {
    return { source: 'linkedin', medium: 'social', campaign: null }
  }
  if (hostname.includes('youtube.com')) {
    return { source: 'youtube', medium: 'social', campaign: null }
  }
  if (hostname.includes('tiktok.com')) {
    return { source: 'tiktok', medium: 'social', campaign: null }
  }
  if (hostname.includes('reddit.com')) {
    return { source: 'reddit', medium: 'social', campaign: null }
  }
  if (hostname.includes('pinterest.com')) {
    return { source: 'pinterest', medium: 'social', campaign: null }
  }
  
  // Email clients
  if (hostname.includes('mail.google.com') || hostname.includes('gmail.com')) {
    return { source: 'gmail', medium: 'email', campaign: null }
  }
  if (hostname.includes('outlook.com') || hostname.includes('outlook.live.com')) {
    return { source: 'outlook', medium: 'email', campaign: null }
  }
  
  // Other
  return { source: ref.hostname, medium: 'referral', campaign: null }
}

// Track page view
export async function trackPageView({
  pathname,
  sessionId,
  userId,
  referrer,
  userAgent,
  geo,
}: {
  pathname: string
  sessionId: string
  userId?: string | null
  referrer?: string | null
  userAgent?: string | null
  geo?: {
    country?: string
    countryCode?: string
    region?: string
    city?: string
  } | null
}) {
  try {
    const { browser, os, device } = parseUserAgent(userAgent)
    
    // Record page view
    await prisma.pageView.create({
      data: {
        pathname,
        sessionId,
        userId,
        referrer,
        userAgent,
        browser,
        os,
        device,
        country: geo?.country,
        city: geo?.city,
        region: geo?.region,
      }
    })
    
    // Update session
    const session = await prisma.analyticsSession.findUnique({
      where: { sessionId }
    })
    
    if (!session) {
      // Create new session
      const url = new URL(pathname, 'https://example.com')
      const { source, medium, campaign } = parseTrafficSource(referrer, url)
      
      await prisma.analyticsSession.create({
        data: {
          sessionId,
          userId,
          pageViews: 1,
          entryPage: pathname,
          source,
          medium,
          campaign,
        }
      })
    } else {
      // Update existing session
      await prisma.analyticsSession.update({
        where: { sessionId },
        data: {
          pageViews: { increment: 1 },
          exitPage: pathname,
          endedAt: new Date()
        }
      })
    }
  } catch (error) {
    console.error('Analytics tracking error:', error)
  }
}

// Get analytics data for dashboard
export async function getAnalyticsData(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const [
    totalPageViews,
    uniqueVisitors,
    avgPageViews,
    topPages,
    deviceStats,
    trafficSources,
    pageViewsByDay,
    topCountries,
    topCities
  ] = await Promise.all([
    // Total page views
    prisma.pageView.count({
      where: { createdAt: { gte: startDate } }
    }),
    
    // Unique visitors (unique sessions)
    prisma.analyticsSession.count({
      where: { startedAt: { gte: startDate } }
    }),
    
    // Average page views per session
    prisma.analyticsSession.aggregate({
      where: { startedAt: { gte: startDate } },
      _avg: { pageViews: true }
    }),
    
    // Top pages
    prisma.pageView.groupBy({
      by: ['pathname'],
      where: { createdAt: { gte: startDate } },
      _count: { pathname: true },
      orderBy: { _count: { pathname: 'desc' } },
      take: 10
    }),
    
    // Device breakdown
    prisma.pageView.groupBy({
      by: ['device'],
      where: { 
        createdAt: { gte: startDate },
        device: { not: null }
      },
      _count: { device: true }
    }),
    
    // Traffic sources
    prisma.analyticsSession.groupBy({
      by: ['source', 'medium'],
      where: { startedAt: { gte: startDate } },
      _count: { source: true },
      orderBy: { _count: { source: 'desc' } },
      take: 10
    }),
    
    // Page views by day
    prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as views
      FROM PageView
      WHERE createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    ` as Promise<Array<{ date: Date; views: bigint }>>,
    
    // Top countries
    prisma.pageView.groupBy({
      by: ['country'],
      where: { 
        createdAt: { gte: startDate },
        country: { not: null }
      },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10
    }),
    
    // Top cities
    prisma.pageView.groupBy({
      by: ['city', 'country'],
      where: { 
        createdAt: { gte: startDate },
        city: { not: null }
      },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10
    })
  ])
  
  return {
    totalPageViews,
    uniqueVisitors,
    avgPageViewsPerSession: avgPageViews._avg.pageViews || 0,
    topPages,
    deviceStats,
    trafficSources,
    pageViewsByDay: pageViewsByDay.map(row => ({
      date: row.date,
      views: Number(row.views)
    })),
    topCountries,
    topCities
  }
}