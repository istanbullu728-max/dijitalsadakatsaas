import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { customerId } = await request.json();
    
    if (!customerId) {
      return NextResponse.json({ error: 'Müşteri ID gerekli' }, { status: 400 });
    }

    // Check if customer exists, if not, wait we should not create on scan, 
    // actually in this system, the customer QR is generated when they first visit the site,
    // or we can auto-create if ID doesn't exist to make it bulletproof? 
    // Since IDs are UUIDs, they shouldn't scan a non-existent UUID unless it's a valid format they generated.
    // Let's create if it doesn't exist so we never block a scan (if it's a valid ID from the frontend).
    
    let customer = db.getCustomer(customerId);
    
    // Auto-create on first scan if it's somehow missing but they have the QR
    // However, the frontend generates a new ID and registers it. 
    // Wait, the easiest flow: frontend generates UUID, saves to local storage, and shows QR.
    // When scanned, backend auto-creates the record if missing.
    if (!customer) {
      // Create new customer with this specific ID
      customer = {
        id: customerId,
        stamps: 0,
        lastStampAt: null,
        createdAt: Date.now()
      };
      // We need a method to insert a specific customer
      db.getCustomers().push(customer);
    }

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
