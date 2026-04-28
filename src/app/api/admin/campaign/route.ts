import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { requiredStamps, isActive } = await request.json();
    
    const updated = db.updateCampaign({
      ...(requiredStamps !== undefined && { requiredStamps: Number(requiredStamps) }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) })
    });
    
    return NextResponse.json({ success: true, campaign: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
