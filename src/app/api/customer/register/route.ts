import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'İsim alanı zorunludur' }, { status: 400 });
    }

    const newCustomer = db.createCustomer(name.trim());
    
    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
