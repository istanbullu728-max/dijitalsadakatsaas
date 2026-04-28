import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let customer = db.getCustomer(id);
    const campaign = db.getCampaign();
    
    // If not found on backend (because it's in-memory MVP and server restarted),
    // we return a zero-stamp customer object to make the frontend robust.
    if (!customer) {
      customer = {
        id,
        stamps: 0,
        lastStampAt: null,
        createdAt: Date.now()
      };
    }

    return NextResponse.json({
      success: true,
      customer,
      campaign
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
