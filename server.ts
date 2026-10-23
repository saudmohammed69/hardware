import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { CompletedBill, OrderStatus, ShopSettings, WebsiteOrder } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Enable CORS and Android / Cloudflare header compatibility
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-device-id, x-database-epoch, x-device-time, x-device-nonce, x-operation-id, x-device-signature'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Monotonically increasing cursor sequence
let globalSequence = 1000;
function nextSeq(): number {
  globalSequence += 1;
  return globalSequence;
}

// In-memory order storage with valid UUIDs for Android Room database compatibility
const orders: WebsiteOrder[] = [
  {
    id: 'e4eaaaf2-d142-11e1-b3e4-080027620001',
    orderNumber: 'WO-8842',
    revision: 1,
    seq: nextSeq(),
    customer: {
      name: 'Ramesh Patel',
      phone: '9845012345',
      pickupPreference: 'Today between 4:00 PM - 6:00 PM',
      address: 'Shop #12, Market Road, Near Clock Tower',
    },
    items: [
      {
        productId: 'demo-pvc-1',
        name: 'Supreme CPVC Pressure Pipe',
        size: '1 inch (25mm)',
        unit: 'Length',
        unitPricePaisa: 40000,
        quantity: 3,
        isPipe: true,
        fullLengths: 3,
        extraFeet: 6,
        lineTotalPaisa: 141000,
        note: 'Cut into 10ft lengths please',
      },
      {
        productId: 'demo-elbow-2',
        name: 'CPVC 90° Elbow Heavy Duty',
        size: '1 inch',
        unit: 'Piece',
        unitPricePaisa: 3200,
        quantity: 6,
        lineTotalPaisa: 19200,
      },
      {
        productId: 'demo-cement',
        name: 'UltraTech Super Cement',
        size: '50 kg bag',
        unit: 'Bag',
        unitPricePaisa: 39000,
        quantity: 2,
        lineTotalPaisa: 78000,
      },
    ],
    orderNote: 'Urgent plumbing requirement for site work. Keep ready before 4 PM.',
    subtotalPaisa: 238200,
    estimatedGstPaisa: 42876,
    totalPaisa: 238200,
    status: 'NEW',
    unread: true,
    createdAt: Date.now() - 15 * 60 * 1000,
    updatedAt: Date.now() - 15 * 60 * 1000,
    checklist: [],
  },
  {
    id: 'e4eaaaf2-d142-11e1-b3e4-080027620002',
    orderNumber: 'WO-8839',
    revision: 2,
    seq: nextSeq(),
    customer: {
      name: 'Priya Sharma',
      phone: '9741289012',
      pickupPreference: 'Tomorrow Morning 10:00 AM',
    },
    items: [
      {
        productId: 'demo-hammer',
        name: 'Claw Hammer 500g Professional',
        size: '500g',
        unit: 'Piece',
        unitPricePaisa: 29500,
        quantity: 1,
        lineTotalPaisa: 29500,
      },
      {
        productId: 'demo-screw',
        name: 'SS Wood Screws Box (100 pcs)',
        size: '1.5 inch',
        unit: 'Box',
        unitPricePaisa: 18500,
        quantity: 2,
        lineTotalPaisa: 37000,
      },
    ],
    subtotalPaisa: 66500,
    estimatedGstPaisa: 11970,
    totalPaisa: 66500,
    status: 'ACCEPTED',
    unread: false,
    createdAt: Date.now() - 45 * 60 * 1000,
    updatedAt: Date.now() - 20 * 60 * 1000,
    checklist: ['demo-hammer'],
  },
];

const completedBills: CompletedBill[] = [
  {
    id: 'INV-2026-0104',
    orderId: 'e4eaaaf2-d142-11e1-b3e4-080027620000',
    customerName: 'Anand Kumar',
    customerPhone: '9820011223',
    items: [
      {
        productId: 'demo-tape',
        name: 'PVC Insulation Tape 18mm',
        size: 'Roll',
        unit: 'Roll',
        unitPricePaisa: 3500,
        quantity: 4,
        lineTotalPaisa: 14000,
      },
    ],
    subtotalPaisa: 14000,
    discountPaisa: 0,
    gstPaisa: 2520,
    roundOffPaisa: 0,
    finalTotalPaisa: 14000,
    paymentMode: 'UPI',
    createdAt: Date.now() - 120 * 60 * 1000,
    cashierName: 'Mohammed Saud',
  },
];

let shopSettings: ShopSettings = {
  shopName: 'HardwareShop POS & Electricals',
  shopPhone: '+91 98450 00000',
  shopAddress: 'Main Road, Hardware Bazaar, Opposite Metro Pillar #124',
  gstin: '29ABCDE1234F1Z5',
  upiId: 'hardwareshop@upi',
  upiPayeeName: 'Hardware Shop POS',
  openTime: '09:00',
  closeTime: '21:00',
  onlineOrderingActive: true,
};

// SSE Subscribers for Real-Time Event Push to POS & Browsers
interface SseClient {
  id: string;
  res: Response;
}
const sseClients: SseClient[] = [];

function broadcastSse(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].res.write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Helper to find order by UUID or orderNumber (e.g. "WO-8842")
function findOrder(identifier: string): WebsiteOrder | undefined {
  const term = identifier.toLowerCase();
  return orders.find(
    (o) => o.id.toLowerCase() === term || (o.orderNumber && o.orderNumber.toLowerCase() === term)
  );
}

// Convert WebsiteOrder to Android sync event document
function toAndroidEventDoc(o: WebsiteOrder) {
  return {
    orderNumber: o.orderNumber || o.id,
    customer: {
      name: o.customer.name,
      phone: o.customer.phone,
      pickupPreference: o.customer.pickupPreference || '',
      address: o.customer.address || '',
    },
    items: o.items.map((it) => ({
      productId: it.productId,
      name: it.name,
      size: it.size || '',
      unit: it.unit || 'Piece',
      quantity: String(it.quantity || 1),
      fullLengths: String(it.fullLengths || 0),
      extraFeet: String(it.extraFeet || 0),
      inventoryUnitEquivalent: String(it.quantity || 1),
      estimatedLineTotalPaisa: String(it.lineTotalPaisa || 0),
    })),
    estimatedSubtotalPaisa: String(o.subtotalPaisa || 0),
    note: o.orderNote || '',
    finalizedPosBillSyncId: o.finalizedPosBillSyncId || '',
  };
}

// --- Customer & Web REST API ---

app.get('/api/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const clientId = Math.random().toString(36).slice(2);
  const newClient: SseClient = { id: clientId, res };
  sseClients.push(newClient);

  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: Date.now() })}\n\n`);

  req.on('close', () => {
    const index = sseClients.findIndex((c) => c.id === clientId);
    if (index !== -1) sseClients.splice(index, 1);
  });
});

app.get('/api/orders', (req: Request, res: Response) => {
  const status = req.query.status as string;
  if (status) {
    return res.json(orders.filter((o) => o.status === status));
  }
  res.json(orders);
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = findOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Create order from Customer Web Storefront
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, items, orderNote, missingItemRequest } = req.body;

  if (!customer?.name?.trim() || !customer?.phone?.trim()) {
    return res.status(400).json({ error: 'Customer name and valid phone are required' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  // Generate UUID for Room database and display number for customer
  const id = crypto.randomUUID();
  const orderNumber = `WO-${Math.floor(1000 + Math.random() * 9000)}`;

  let subtotal = 0;
  for (const item of items) {
    subtotal += item.lineTotalPaisa || 0;
  }
  const gst = Math.round(subtotal * 0.18);

  const newOrder: WebsiteOrder = {
    id,
    orderNumber,
    revision: 1,
    seq: nextSeq(),
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim().replace(/\D/g, '').slice(-10),
      pickupPreference: customer.pickupPreference || 'Earliest available',
      address: customer.address || '',
    },
    items,
    orderNote: orderNote?.trim() || '',
    missingItemRequest: missingItemRequest?.trim() || '',
    subtotalPaisa: subtotal,
    estimatedGstPaisa: gst,
    totalPaisa: subtotal,
    status: 'NEW',
    unread: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    checklist: [],
  };

  orders.unshift(newOrder);

  // Push instant event to web POS and SSE stream
  broadcastSse('new_order', newOrder);

  res.status(201).json({
    success: true,
    order: newOrder,
    message: 'Order created successfully and pushed to Shop Billing POS',
  });
});

app.post('/api/orders/:id/status', (req: Request, res: Response) => {
  const order = findOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { status, reason } = req.body as { status: OrderStatus; reason?: string };
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  order.status = status;
  order.revision = (order.revision || 1) + 1;
  order.seq = nextSeq();
  order.updatedAt = Date.now();
  if (reason) order.cancellationReason = reason;
  if (status !== 'NEW') order.unread = false;

  broadcastSse('order_updated', order);
  res.json({ success: true, order });
});

app.post('/api/orders/:id/checklist', (req: Request, res: Response) => {
  const order = findOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { checklist } = req.body;
  if (Array.isArray(checklist)) {
    order.checklist = checklist;
    order.updatedAt = Date.now();
    broadcastSse('order_updated', order);
  }

  res.json({ success: true, order });
});

app.post('/api/orders/:id/mark-read', (req: Request, res: Response) => {
  const order = findOrder(req.params.id);
  if (order) {
    order.unread = false;
    broadcastSse('order_updated', order);
  }
  res.json({ success: true });
});

app.get('/api/pos/bills', (_req: Request, res: Response) => {
  res.json(completedBills);
});

app.post('/api/pos/bills', (req: Request, res: Response) => {
  const billData: CompletedBill = req.body;
  if (!billData.items || billData.items.length === 0) {
    return res.status(400).json({ error: 'Bill must have items' });
  }

  const billNumber = Math.floor(100 + Math.random() * 900);
  const billId = billData.id || `INV-${new Date().getFullYear()}-${billNumber}`;

  const savedBill: CompletedBill = {
    ...billData,
    id: billId,
    createdAt: Date.now(),
  };

  completedBills.unshift(savedBill);

  if (savedBill.orderId) {
    const originOrder = findOrder(savedBill.orderId);
    if (originOrder) {
      originOrder.status = 'COMPLETED';
      originOrder.billedBillId = billId;
      originOrder.revision = (originOrder.revision || 1) + 1;
      originOrder.seq = nextSeq();
      originOrder.updatedAt = Date.now();
      broadcastSse('order_updated', originOrder);
    }
  }

  res.status(201).json({ success: true, bill: savedBill });
});

app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(shopSettings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  shopSettings = { ...shopSettings, ...req.body };
  broadcastSse('settings_updated', shopSettings);
  res.json({ success: true, settings: shopSettings });
});

// --- Android POS Native Wire Protocol Endpoints ---
// Supports both direct paths and `/shops/:shopId/...` paths called by Android WebsiteOrdersRepository

const handlePosEvents = (req: Request, res: Response) => {
  const cursor = parseInt(req.query.cursor as string, 10) || 0;

  // Filter orders with seq > cursor
  const delta = orders.filter((o) => (o.seq || 0) > cursor);
  const maxSeq = orders.reduce((max, o) => Math.max(max, o.seq || 0), globalSequence);

  const events = delta.map((o) => ({
    id: o.id,
    revision: o.revision || 1,
    seq: o.seq || globalSequence,
    status: o.status,
    updated_at: o.updatedAt || Date.now(),
    lock_device: o.claimDevice || '',
    bill_id: o.serverBillId || '',
    doc: toAndroidEventDoc(o),
  }));

  res.json({
    cursor: maxSeq,
    hasMore: false,
    events,
  });
};

app.get('/pos/events', handlePosEvents);
app.get('/shops/:shopId/pos/events', handlePosEvents);
app.get('/shops/:shopId/orders', handlePosEvents);

// Action endpoints: accept, prepare, ready, cancel
const handleOrderAction = (action: string) => (req: Request, res: Response) => {
  const order = findOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  switch (action) {
    case 'accept':
      order.status = 'ACCEPTED';
      break;
    case 'prepare':
      order.status = 'PREPARING';
      break;
    case 'ready':
      order.status = 'READY_FOR_PICKUP';
      break;
    case 'cancel':
      order.status = 'CANCELLED';
      order.cancellationReason = req.body.reason || 'Cancelled by merchant';
      break;
  }

  order.revision = (order.revision || 1) + 1;
  order.seq = nextSeq();
  order.updatedAt = Date.now();
  order.unread = false;

  broadcastSse('order_updated', order);
  res.json({ success: true, status: order.status, revision: order.revision });
};

['accept', 'prepare', 'ready', 'cancel'].forEach((act) => {
  app.post(`/orders/:id/${act}`, handleOrderAction(act));
  app.post(`/shops/:shopId/orders/:id/${act}`, handleOrderAction(act));
});

// Billing claim endpoint for Android POS
const handleBillingClaim = (req: Request, res: Response) => {
  const order = findOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { claimToken } = req.body;
  const deviceId = (req.headers['x-device-id'] as string) || 'device-a';
  const billId = crypto.randomUUID();

  order.status = 'BILLING_IN_PROGRESS';
  order.claimToken = claimToken;
  order.claimDevice = deviceId;
  order.serverBillId = billId;
  order.revision = (order.revision || 1) + 1;
  order.seq = nextSeq();
  order.updatedAt = Date.now();

  broadcastSse('order_updated', order);

  res.json({
    status: 'BILLING_IN_PROGRESS',
    billId,
    revision: order.revision,
  });
};

app.post('/orders/:id/billing-claim', handleBillingClaim);
app.post('/shops/:shopId/orders/:id/billing-claim', handleBillingClaim);

// Order completion endpoint for Android POS
const handleOrderComplete = (req: Request, res: Response) => {
  const order = findOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { posBillSyncId } = req.body;
  order.status = 'COMPLETED';
  order.finalizedPosBillSyncId = posBillSyncId || '';
  order.revision = (order.revision || 1) + 1;
  order.seq = nextSeq();
  order.updatedAt = Date.now();

  broadcastSse('order_updated', order);
  res.json({ success: true, status: 'COMPLETED', revision: order.revision });
};

app.post('/orders/:id/complete', handleOrderComplete);
app.post('/shops/:shopId/orders/:id/complete', handleOrderComplete);

// Order adjust endpoint for customer-confirmed changes
const handleOrderAdjust = (req: Request, res: Response) => {
  const order = findOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { items } = req.body;
  if (Array.isArray(items)) {
    order.items = items;
    order.revision = (order.revision || 1) + 1;
    order.seq = nextSeq();
    order.updatedAt = Date.now();
    broadcastSse('order_updated', order);
  }

  res.json({ success: true, revision: order.revision });
};

app.post('/orders/:id/adjust', handleOrderAdjust);
app.post('/shops/:shopId/orders/:id/adjust', handleOrderAdjust);

// Storage safety status for Android Owner dashboard
const handleStorageCheck = (_req: Request, res: Response) => {
  res.json({
    level: 'HEALTHY',
    bytes: 12500000,
    acceptNew: true,
  });
};

app.get('/owner/storage', handleStorageCheck);
app.get('/shops/:shopId/owner/storage', handleStorageCheck);

// Shop hours and public config published by Owner from Android POS
const handlePublicConfig = (req: Request, res: Response) => {
  const { name, phone, address, openMinute, closeMinute, maintenance } = req.body;

  if (name) shopSettings.shopName = name;
  if (phone) shopSettings.shopPhone = phone;
  if (address) shopSettings.shopAddress = address;
  if (maintenance !== undefined) shopSettings.onlineOrderingActive = !maintenance;

  if (openMinute !== undefined && closeMinute !== undefined) {
    const formatHour = (m: number) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    };
    shopSettings.openTime = formatHour(openMinute);
    shopSettings.closeTime = formatHour(closeMinute);
  }

  broadcastSse('settings_updated', shopSettings);
  res.json({ success: true, settings: shopSettings });
};

app.post('/owner/public-config', handlePublicConfig);
app.post('/shops/:shopId/owner/public-config', handlePublicConfig);

// Catalog publication endpoint from Android POS
const handleCatalogPublish = (req: Request, res: Response) => {
  res.json({ success: true, message: 'Products received successfully' });
};

app.post('/catalog/publish', handleCatalogPublish);
app.post('/catalog/publish-batch', handleCatalogPublish);
app.post('/shops/:shopId/catalog/publish-batch', handleCatalogPublish);

// Pairing and session authorization
const handlePairSession = (req: Request, res: Response) => {
  res.json({
    deviceId: req.headers['x-device-id'] || 'device-a',
    databaseEpoch: req.headers['x-database-epoch'] || '00000000-0000-0000-0000-000000000000',
    authorityEpoch: 1,
    status: 'AUTHORIZED',
    shop: req.params.shopId || 'proof-shop',
  });
};

app.post('/pair/session', handlePairSession);
app.post('/shops/:shopId/pair/session', handlePairSession);

// Start Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HardwareShopPOS Web Orders & Android POS Billing Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
