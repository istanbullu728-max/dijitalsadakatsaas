import { NextResponse } from 'next/server';

const CASHIER_PIN = '1234'; // Simple PIN for MVP

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    
    if (pin === CASHIER_PIN) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('cashier_auth', 'authenticated', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
      });
      return response;
    }
    
    return NextResponse.json({ error: 'Geçersiz PIN' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
