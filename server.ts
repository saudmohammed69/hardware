import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CompletedBill, OrderStatus, ShopSettings, WebsiteOrder } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS and iframe compatibility
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-device-id, x-database-epoch');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// In-memory persistent order storage with initial seed orders
const orders: WebsiteOrder[] = [
  {
    id: 'WO-8842',
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
        lineTotalPaisa: 141000, // 3 * 40000 + 6 * 3500 = 120000 + 21000 = 141000
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
    createdAt: Date.now() - 15 * 60 * 1000, // 15 mins ago
    updatedAt: Date.now() - 15 * 60 * 1000,
    checklist: [],
  },
  {
    id: 'WO-8839',
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
    orderId: 'WO-8830',
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

// REST Endpoints
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

  // Send initial ping and current orders
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
  const order = orders.find((o) => o.id.toLowerCase() === req.params.id.toLowerCase());
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, items, orderNote, missingItemRequest } = req.body;

  if (!customer?.name?.trim() || !customer?.phone?.trim()) {
    return res.status(400).json({ error: 'Customer name and valid phone are required' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  // Generate clean sequential / random order ID like WO-7128
  const orderNumber = Math.floor(1000 + Math.random() * 9000);
  const id = `WO-${orderNumber}`;

  let subtotal = 0;
  for (const item of items) {
    subtotal += item.lineTotalPaisa || 0;
  }
  const gst = Math.round(subtotal * 0.18);

  const newOrder: WebsiteOrder = {
    id,
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
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

  // Broadcast to all connected POS billing clients in real-time
  broadcastSse('new_order', newOrder);

  res.status(201).json({
    success: true,
    order: newOrder,
    message: 'Order created successfully and pushed to Shop Billing POS',
  });
});

app.post('/api/orders/:id/status', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id.toLowerCase() === req.params.id.toLowerCase());
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { status, reason } = req.body as { status: OrderStatus; reason?: string };
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  order.status = status;
  order.updatedAt = Date.now();
  if (reason) order.cancellationReason = reason;
  if (status !== 'NEW') order.unread = false;

  broadcastSse('order_updated', order);
  res.json({ success: true, order });
});

app.post('/api/orders/:id/checklist', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id.toLowerCase() === req.params.id.toLowerCase());
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
  const order = orders.find((o) => o.id.toLowerCase() === req.params.id.toLowerCase());
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

  // If this bill originated from a website order, mark the order as COMPLETED
  if (savedBill.orderId) {
    const originOrder = orders.find((o) => o.id.toLowerCase() === savedBill.orderId?.toLowerCase());
    if (originOrder) {
      originOrder.status = 'COMPLETED';
      originOrder.billedBillId = billId;
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

// HardwareShopPOS Android App Compatibility Endpoints
// Supporting Saud's existing Android code routes: /shops/:shopId/orders etc.
app.get('/shops/:shopId/orders', (_req: Request, res: Response) => {
  res.json({
    cursor: Date.now(),
    orders: orders.map((o) => ({
      id: o.id,
      revision: 1,
      seq: o.createdAt,
      status: o.status,
      customer: o.customer,
      items: o.items,
      totalPaisa: o.totalPaisa,
      document: JSON.stringify(o),
    })),
  });
});

app.post('/shops/:shopId/pair/session', (req: Request, res: Response) => {
  res.json({
    deviceId: req.headers['x-device-id'] || 'device-a',
    databaseEpoch: req.headers['x-database-epoch'] || '00000000-0000-0000-0000-000000000000',
    authorityEpoch: 1,
    status: 'AUTHORIZED',
    shop: req.params.shopId,
  });
});

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
    console.log(`HardwareShopPOS Web Orders & Billing Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
