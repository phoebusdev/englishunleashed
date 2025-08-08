import { NextResponse } from 'next/server'

// Free IP geolocation API (no key required)
async function getGeoLocation(ip: string) {
  try {
    // Using ip-api.com (free, no key required, 45 requests per minute)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,lat,lon`)
    const data = await response.json()
    
    if (data.status === 'success') {
      return {
        country: data.country,
        countryCode: data.countryCode,
        region: data.regionName,
        city: data.city,
        lat: data.lat,
        lon: data.lon
      }
    }
  } catch (error) {
    console.error('Geolocation error:', error)
  }
  
  return null
}

export async function GET(req: Request) {
  // Get client IP from headers
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
  
  // Skip for localhost
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'unknown') {
    return NextResponse.json({
      country: 'Local',
      countryCode: 'LOCAL',
      region: 'Development',
      city: 'Localhost'
    })
  }
  
  const geo = await getGeoLocation(ip)
  
  return NextResponse.json(geo || {
    country: 'Unknown',
    countryCode: 'XX',
    region: 'Unknown',
    city: 'Unknown'
  })
}