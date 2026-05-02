import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { customerId } = await request.json();
    
    if (!customerId) {
      return NextResponse.json({ error: 'Müşteri ID gerekli' }, { status: 400 });
    }

    db.ensureCustomer(customerId);

    const updatedCustomer = db.addStamp(customerId, 'cashier-1');
    const campaign = db.getCampaign();

    const isRewardReached = updatedCustomer.stamps >= campaign.requiredStamps;

    return NextResponse.json({ 
      success: true, 
      customer: updatedCustomer,
      isRewardReached,
      campaign
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sunucu hatası' }, { status: 400 });
  }
}
