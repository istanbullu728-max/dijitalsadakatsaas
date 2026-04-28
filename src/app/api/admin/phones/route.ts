import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const customers = db.getCustomers();
    // Return customers with phone info
    const phones = customers.map(c => ({
      id: c.id,
      phone: c.phone || '',
      stamps: c.stamps,
      createdAt: c.createdAt,
    }));
    return NextResponse.json({ success: true, phones });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { customerId, phone } = await request.json();
    if (!customerId || !phone) {
      return NextResponse.json({ error: 'customerId ve phone zorunludur' }, { status: 400 });
    }
    const updated = db.updateCustomerPhone(customerId, phone);
    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
