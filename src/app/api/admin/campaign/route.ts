import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requiredStamps, isActive, giftDescription, cardColor, logo, businessName } = body;

    const updated = db.updateCampaign({
      ...(requiredStamps  !== undefined && { requiredStamps: Number(requiredStamps) }),
      ...(isActive        !== undefined && { isActive: Boolean(isActive) }),
      ...(giftDescription !== undefined && { giftDescription }),
      ...(cardColor       !== undefined && { cardColor }),
      ...(logo            !== undefined && { logo }),
      ...(businessName    !== undefined && { businessName }),
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
