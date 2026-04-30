import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const stats = db.getStats();
    const campaign = db.getCampaign();
    const customers = db.getCustomers();
    
    return NextResponse.json({
      success: true,
      stats,
      campaign,
      customers: customers.sort((a, b) => b.stamps - a.stamps) // Sort by most loyal
    });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
