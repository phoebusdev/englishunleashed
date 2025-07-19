import { NextResponse } from 'next/server';
import { fetchGumroadProducts } from 'lib/gumroad';

export async function GET() {
  try {
    const products = await fetchGumroadProducts();
    
    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('Error in Gumroad products API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Gumroad products',
      },
      { status: 500 }
    );
  }
}