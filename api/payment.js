// StudySync — Razorpay Payment Handler
// File: api/payment.js
// Handles: create order + verify payment signature + activate Premium

import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { action } = req.query;

  // ── CREATE ORDER ─────────────────────────────────────────────
  if (action === 'create-order') {
    const { plan } = req.body;

    // Prices in paise (₹1 = 100 paise)
    const prices = { trial: 0, monthly: 2500, quarter: 7000, restore: 1000 };
    const amount = prices[plan] ?? 2500;
    const currency = 'INR';

    if (amount === 0) {
      // Free trial — no payment needed, just return success
      return res.status(200).json({ free: true, plan: 'trial' });
    }

    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');

    try {
      const r = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
        body: JSON.stringify({ amount, currency, receipt: `ss_${Date.now()}`, notes: { plan } }),
      });
      const order = await r.json();
      return res.status(200).json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Could not create order' });
    }
  }

  // ── VERIFY PAYMENT ───────────────────────────────────────────
  if (action === 'verify') {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, plan } = req.body;

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // ✅ Payment verified — update Firebase user to Premium
    // Uncomment below after setting up Firebase Admin SDK:
    //
    // const admin = require('firebase-admin');
    // const expiry = plan === 'quarter'
    //   ? new Date(Date.now() + 90 * 86400000).toISOString()
    //   : plan === 'restore'
    //     ? null
    //     : new Date(Date.now() + 30 * 86400000).toISOString();
    //
    // await admin.firestore().collection('users').doc(userId).update({
    //   isPro: plan !== 'restore',
    //   plan,
    //   proSince: new Date().toISOString(),
    //   proExpiry: expiry,
    //   streakRestoreUsed: plan === 'restore' ? true : false,
    // });

    return res.status(200).json({ success: true, plan });
  }

  return res.status(400).json({ error: 'Unknown action' });
}
