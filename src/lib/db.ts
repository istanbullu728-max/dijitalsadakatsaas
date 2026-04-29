// No external uuid package — using native crypto.randomUUID() (Node 15+, all browsers)
const randomUUID = () => crypto.randomUUID();


// Types
export interface Customer {
  id: string; // UUID
  stamps: number;
  lastStampAt: number | null; // Timestamp
  createdAt: number;
  phone?: string;
  name?: string;
}

export interface StampLog {
  id: string;
  customerId: string;
  timestamp: number;
  cashierId: string;
  action: 'stamp' | 'redeem'; // stamp = damga, redeem = ödül kullanıldı
}

export interface Campaign {
  requiredStamps: number;
  isActive: boolean;
  giftDescription: string; // e.g. "1 Bedava Kahve"
  cardColor: string;        // hex color e.g. "#6366F1"
  businessName?: string;  // işletme adı
  logo?: string;          // base64 data URL
}

// In-memory Database
// (Resets when the dev server restarts, perfect for MVP without Firebase)
let customers: Customer[] = [];
let logs: StampLog[] = [];
let campaign: Campaign = {
  requiredStamps: 10,
  isActive: true,
  giftDescription: '1 Bedava Kahve',
  cardColor: '#6366F1',
  businessName: 'İşletmem',
  logo: '',
};

export const db = {
  getCustomers: () => customers,
  getCustomer: (id: string) => customers.find(c => c.id === id) || null,

  createCustomer: (name?: string): Customer => {
    const newCustomer: Customer = {
      id: randomUUID(),
      stamps: 0,
      lastStampAt: null,
      createdAt: Date.now(),
      name,
    };
    customers.push(newCustomer);
    return newCustomer;
  },

  updateCustomerPhone: (customerId: string, phone: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found');
    customer.phone = phone;
    return customer;
  },

  addStamp: (customerId: string, cashierId: string = 'cashier-1') => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found');

    const now = Date.now();
    // 20-second cooldown rule
    if (customer.lastStampAt && now - customer.lastStampAt < 20000) {
      throw new Error('Lütfen tekrar damga basmak için 20 saniye bekleyin.');
    }

    customer.stamps += 1;
    customer.lastStampAt = now;

    // Log the transaction
    logs.push({
      id: randomUUID(),
      customerId,
      timestamp: now,
      cashierId,
      action: 'stamp',
    });

    return customer;
  },

  redeemReward: (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found');

    if (customer.stamps < campaign.requiredStamps) {
      throw new Error('Yeterli damga yok.');
    }

    // Reset stamps after reward (or deduct required amount)
    customer.stamps -= campaign.requiredStamps;

    logs.push({
      id: randomUUID(),
      customerId,
      timestamp: Date.now(),
      cashierId: 'system',
      action: 'redeem',
    });

    return customer;
  },

  getStats: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const activeCustomersToday = new Set(
      logs.filter(log => log.timestamp >= todayStart).map(l => l.customerId)
    ).size;

    const stampsToday = logs.filter(log => log.timestamp >= todayStart && log.action === 'stamp').length;

    // Returning customers: customers with more than 1 stamp
    const returningCustomers = customers.filter(c => c.stamps > 1 || logs.filter(l => l.customerId === c.id).length > 1).length;
    const totalCustomers = customers.length;

    const returningPercentage = totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0;

    // Last 7 days stamp data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const start = d.getTime();
      const end = start + 86400000;
      return {
        label: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
        count: logs.filter(l => l.timestamp >= start && l.timestamp < end && l.action === 'stamp').length,
      };
    });

    const rewardsTotal = logs.filter(l => l.action === 'redeem').length;
    const stampsTotal = logs.filter(l => l.action === 'stamp').length;

    return {
      activeCustomersToday,
      stampsToday,
      returningPercentage,
      totalCustomers,
      last7Days,
      rewardsTotal,
      stampsTotal,
    };
  },

  getCampaign: () => campaign,
  updateCampaign: (newCampaign: Partial<Campaign>) => {
    campaign = { ...campaign, ...newCampaign };
    return campaign;
  },

  getLogs: (period: 'today' | 'week' | 'all' = 'all') => {
    const now = Date.now();
    const todayStart = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
    const weekStart = todayStart - 6 * 86400000;

    let filtered = logs;
    if (period === 'today') filtered = logs.filter(l => l.timestamp >= todayStart);
    if (period === 'week') filtered = logs.filter(l => l.timestamp >= weekStart);

    return [...filtered].reverse(); // Newest first
  },
};
