import nodemailer from 'nodemailer'
import type { Order, OrderStatus, PaymentMethod } from '@/types/database'
import { formatDate, formatTime, getOrderStatusConfig } from '@/lib/utils'
import type { ReservationBooking } from '@/types/index'
import { PAYMENT_METHOD_LABELS, ROYAL_FOODS } from '@/lib/constants'
import { getAdminEmail, normalizeEmail } from '@/lib/email-utils'

// Set in .env.local:
//   GMAIL_USER=your@gmail.com
//   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
//   ADMIN_EMAIL=amaranaeem453@gmail.com   (must include the dot: @gmail.com)
//   NEXT_PUBLIC_SITE_URL=https://your-site.com

const GMAIL_USER = process.env.GMAIL_USER ?? ''
const GMAIL_APP_PASSWORD = (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s+/g, '')
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

function createTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error(
      'GMAIL_USER and GMAIL_APP_PASSWORD must be set in .env.local. ' +
      'Get an App Password from: myaccount.google.com → Security → App passwords'
    )
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  })
}

type SendMailParams = {
  to: string | string[]
  subject: string
  html: string
}

async function sendMail({ to, subject, html }: SendMailParams) {
  const recipients = (Array.isArray(to) ? to : [to])
    .map((addr) => normalizeEmail(addr) ?? addr.trim())
    .filter(Boolean)

  if (!recipients.length) {
    throw new Error('No valid recipient email address')
  }

  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"${ROYAL_FOODS.name}" <${GMAIL_USER}>`,
    to: recipients.join(', '),
    subject,
    html,
  })
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatAmount(amount: number) {
  return `Rs ${amount.toLocaleString('en-PK')}`
}

function orderEmailShell(title: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:Arial,sans-serif;color:#1A2238;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">
    <tr>
      <td style="padding:28px;border-bottom:3px solid #D62828;">
        <p style="margin:0;font-size:24px;font-weight:bold;color:#D62828;">${ROYAL_FOODS.name}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#666;">${ROYAL_FOODS.tagline}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#1A2238;">${title}</h1>
        ${body}
      </td>
    </tr>
    <tr>
      <td style="padding:20px 28px;border-top:1px solid #e5e7eb;font-size:11px;color:#888;">
        © ${new Date().getFullYear()} ${ROYAL_FOODS.name}. This is an automated message.
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Order emails ───────────────────────────────────────────────────────────────

/** Admin notification when a customer places an order (no customer email). */
export async function sendAdminNewOrderEmail(
  order: Pick<
    Order,
    | 'order_ref'
    | 'customer_name'
    | 'customer_phone'
    | 'payment_method'
    | 'total_amount'
    | 'id'
  >
) {
  const trackUrl = `${SITE_URL}/order/${order.id}`
  const paymentLabel = PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod]

  await sendMail({
    to: getAdminEmail(),
    subject: `New Order (Pending) - ${order.order_ref}`,
    html: orderEmailShell(
      'New Online Order',
      `<p style="color:#555;font-size:14px;line-height:1.6;">
        ${order.customer_name} — ${order.customer_phone}<br/>
        ${paymentLabel} — ${formatAmount(order.total_amount)}<br/><br/>
        <a href="${SITE_URL}/admin/orders" style="color:#D62828;">Review in admin panel</a>
        · <a href="${trackUrl}" style="color:#D62828;">View order</a>
      </p>`
    ),
  })

  return { ok: true as const }
}

/** Customer email when they place an order (if email provided). */
export async function sendOrderReceivedEmail(
  order: Pick<
    Order,
    | 'order_ref'
    | 'customer_name'
    | 'customer_email'
    | 'delivery_address'
    | 'payment_method'
    | 'total_amount'
    | 'id'
  >
) {
  const to = normalizeEmail(order.customer_email)
  if (!to) return { ok: false as const, skipped: true }

  const trackUrl = `${SITE_URL}/order/${order.id}`
  const paymentLabel = PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod]

  const body = `
    <p style="color:#555;font-size:14px;line-height:1.6;">
      Hi ${order.customer_name}, we received your order <strong style="color:#D62828;">${order.order_ref}</strong>.
      Our team will confirm it shortly.
    </p>
    <table style="width:100%;margin:20px 0;font-size:13px;color:#555;">
      <tr><td style="padding:6px 0;">Reference</td><td style="text-align:right;color:#D62828;">${order.order_ref}</td></tr>
      <tr><td style="padding:6px 0;">Payment</td><td style="text-align:right;">${paymentLabel}</td></tr>
      <tr><td style="padding:6px 0;">Total</td><td style="text-align:right;font-weight:600;">${formatAmount(order.total_amount)}</td></tr>
      <tr><td style="padding:6px 0;">Delivery</td><td style="text-align:right;">${order.delivery_address}</td></tr>
    </table>
    <p style="margin:24px 0 0;">
      <a href="${trackUrl}" style="display:inline-block;padding:12px 24px;background:#D62828;color:#fff;text-decoration:none;font-size:13px;font-weight:600;border-radius:6px;">Track Your Order</a>
    </p>`

  await sendMail({
    to,
    subject: `Order Received - ${order.order_ref} | ${ROYAL_FOODS.name}`,
    html: orderEmailShell('Thank You for Your Order', body),
  })

  return { ok: true as const }
}

/** Single customer email — sent when admin confirms the order. */
export async function sendOrderConfirmedEmail(
  order: Pick<
    Order,
    | 'order_ref'
    | 'customer_name'
    | 'customer_email'
    | 'delivery_address'
    | 'payment_method'
    | 'total_amount'
    | 'id'
  >
) {
  const to = normalizeEmail(order.customer_email)
  if (!to) return { ok: false as const, skipped: true }

  const trackUrl = `${SITE_URL}/order/${order.id}`
  const paymentLabel = PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod]

  const body = `
    <p style="color:#555;font-size:14px;line-height:1.6;">
      Hi ${order.customer_name}, your order <strong style="color:#D62828;">${order.order_ref}</strong> is confirmed and will be prepared for delivery.
    </p>
    <table style="width:100%;margin:20px 0;font-size:13px;color:#555;">
      <tr><td style="padding:6px 0;">Reference</td><td style="text-align:right;color:#D62828;">${order.order_ref}</td></tr>
      <tr><td style="padding:6px 0;">Payment</td><td style="text-align:right;">${paymentLabel}</td></tr>
      <tr><td style="padding:6px 0;">Total</td><td style="text-align:right;font-weight:600;">${formatAmount(order.total_amount)}</td></tr>
      <tr><td style="padding:6px 0;">Delivery</td><td style="text-align:right;">${order.delivery_address}</td></tr>
    </table>
    <p style="color:#555;font-size:13px;">
      Track live updates on your order page.
    </p>
    <p style="margin:24px 0 0;">
      <a href="${trackUrl}" style="display:inline-block;padding:12px 24px;background:#D62828;color:#fff;text-decoration:none;font-size:13px;font-weight:600;border-radius:6px;">Track Your Order</a>
    </p>`

  await sendMail({
    to,
    subject: `Order Confirmed - ${order.order_ref} | ${ROYAL_FOODS.name}`,
    html: orderEmailShell('Your Order is Confirmed', body),
  })

  return { ok: true as const }
}

export type OrderEmailResult =
  | { ok: true }
  | { ok: false; skipped: true; reason: 'missing_email' }
  | { ok: false; skipped: false; reason: 'send_failed'; message: string }

/** Ensures confirmation email is sent or returns a clear failure reason. */
export async function sendOrderConfirmedEmailOrReport(
  order: Parameters<typeof sendOrderConfirmedEmail>[0]
): Promise<OrderEmailResult> {
  const to = normalizeEmail(order.customer_email)
  if (!to) {
    return { ok: false, skipped: true, reason: 'missing_email' }
  }

  try {
    await sendOrderConfirmedEmail(order)
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      skipped: false,
      reason: 'send_failed',
      message: err instanceof Error ? err.message : 'Email failed',
    }
  }
}

/** @deprecated Use sendAdminNewOrderEmail — kept for send-email route compatibility */
export async function sendOrderPlacedEmail(
  order: Parameters<typeof sendAdminNewOrderEmail>[0] &
    Pick<Order, 'customer_email' | 'delivery_address'>
) {
  return sendAdminNewOrderEmail(order)
}

export async function sendOrderStatusEmail(
  order: Pick<
    Order,
    'order_ref' | 'customer_name' | 'customer_email' | 'status' | 'id' | 'total_amount'
  >,
  previousStatus?: OrderStatus
) {
  if (!order.customer_email) return { ok: false as const, skipped: true }
  if (previousStatus === order.status) return { ok: false as const, skipped: true }

  const to = normalizeEmail(order.customer_email)
  if (!to) return { ok: false as const, skipped: true }

  const { label } = getOrderStatusConfig(order.status)
  const trackUrl = `${SITE_URL}/order/${order.id}`

  const body = `
    <p style="color:#a8a8a0;font-family:sans-serif;font-size:14px;line-height:1.6;">
      Dear ${order.customer_name}, your order <strong style="color:#c9a84c;">${order.order_ref}</strong> has been updated.
    </p>
    <p style="font-size:18px;color:#f5f5f0;margin:20px 0;">Status: <span style="color:#c9a84c;">${label}</span></p>
    <p style="margin:24px 0 0;">
      <a href="${trackUrl}" style="display:inline-block;padding:12px 24px;background:#8b0000;color:#fff;text-decoration:none;font-family:sans-serif;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;">View Order</a>
    </p>`

  await sendMail({
    to,
    subject: `Order Update - ${label} | ${order.order_ref}`,
    html: orderEmailShell('Order Status Updated', body),
  })

  return { ok: true as const }
}

export async function sendPaymentReceivedEmail(
  order: Pick<Order, 'order_ref' | 'customer_name' | 'customer_email' | 'id'>
) {
  const to = normalizeEmail(order.customer_email)
  if (!to) return { ok: false as const, skipped: true }

  const body = `
    <p style="color:#555;font-size:14px;line-height:1.6;">
      Hi ${order.customer_name}, we verified your payment for order <strong style="color:#D62828;">${order.order_ref}</strong>.
      Your order is now confirmed and being prepared.
    </p>
    <p style="margin:24px 0 0;">
      <a href="${SITE_URL}/order/${order.id}" style="display:inline-block;padding:12px 24px;background:#D62828;color:#fff;text-decoration:none;font-size:13px;font-weight:600;border-radius:6px;">Track Order</a>
    </p>`

  await sendMail({
    to,
    subject: `Payment Confirmed - ${order.order_ref} | ${ROYAL_FOODS.name}`,
    html: orderEmailShell('Payment Received', body),
  })

  return { ok: true as const }
}

// ── Reservation emails ─────────────────────────────────────────────────────────

type ReservationEmailFields = Pick<
  ReservationBooking,
  | 'booking_ref'
  | 'customer_name'
  | 'customer_email'
  | 'date'
  | 'time_slot'
  | 'party_size'
  | 'id'
> & { cancel_token?: string }

function reservationDetailsHtml(r: ReservationEmailFields) {
  const cancelUrl = r.cancel_token
    ? `${SITE_URL}/api/reservations/cancel?token=${r.cancel_token}`
    : null
  return `
    <table style="width:100%;margin:16px 0;font-family:sans-serif;font-size:13px;color:#a8a8a0;">
      <tr><td style="padding:6px 0;">Reference</td><td style="text-align:right;color:#c9a84c;">${r.booking_ref}</td></tr>
      <tr><td style="padding:6px 0;">Date</td><td style="text-align:right;">${formatDate(r.date)}</td></tr>
      <tr><td style="padding:6px 0;">Time</td><td style="text-align:right;">${formatTime(r.time_slot)}</td></tr>
      <tr><td style="padding:6px 0;">Party</td><td style="text-align:right;">${r.party_size} guests</td></tr>
    </table>
    ${
      cancelUrl
        ? `<p style="margin:20px 0 0;font-family:sans-serif;font-size:12px;color:#a8a8a0;">
            Need to cancel? <a href="${cancelUrl}" style="color:#c9a84c;">Cancel your reservation</a> - your table will be released immediately.
          </p>`
        : ''
    }
    <p style="margin:16px 0 0;">
      <a href="${SITE_URL}/reservations/confirm/${r.id}" style="display:inline-block;padding:12px 24px;background:#8b0000;color:#fff;text-decoration:none;font-family:sans-serif;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;">View Booking</a>
    </p>`
}

export async function sendReservationReceivedEmail(
  reservation: ReservationEmailFields
) {
  const to = reservation.customer_email?.trim()
  if (!to) return { ok: false as const, skipped: true }

  const body = `
    <p style="color:#a8a8a0;font-family:sans-serif;font-size:14px;line-height:1.6;">
      Dear ${reservation.customer_name}, thank you for your reservation request at Eclat.
      We have received it and will review availability shortly.
    </p>
    ${reservationDetailsHtml({ ...reservation, cancel_token: undefined })}
    <p style="color:#e09050;font-family:sans-serif;font-size:13px;margin-top:16px;">
      Status: <strong>Pending confirmation</strong> - you will receive another email once our team confirms your table.
    </p>`

  await sendMail({
    to,
    subject: `Reservation Request Received - ${reservation.booking_ref} | Eclat`,
    html: orderEmailShell('Request Received', body),
  })

  // Admin notification
  await sendMail({
    to: getAdminEmail(),
    subject: `New Reservation (Pending) - ${reservation.booking_ref}`,
    html: orderEmailShell(
      'New Table Reservation - Awaiting Approval',
      `<p style="color:#a8a8a0;font-family:sans-serif;font-size:14px;">
        ${reservation.customer_name} - party of ${reservation.party_size}<br/>
        ${formatDate(reservation.date)} at ${formatTime(reservation.time_slot)}<br/><br/>
        <a href="${SITE_URL}/admin/reservations" style="color:#c9a84c;">Review in admin panel</a>
      </p>`
    ),
  })

  return { ok: true as const }
}

export async function sendReservationConfirmationEmail(
  reservation: ReservationEmailFields
) {
  const to = reservation.customer_email?.trim()
  if (!to) throw new Error('This reservation has no guest email address.')

  const body = `
    <p style="color:#a8a8a0;font-family:sans-serif;font-size:14px;line-height:1.6;">
      Dear ${reservation.customer_name}, your table at Eclat is now <strong style="color:#c9a84c;">confirmed</strong>. We look forward to welcoming you.
    </p>
    ${reservationDetailsHtml(reservation)}
    <p style="color:#a8a8a0;font-family:sans-serif;font-size:12px;margin-top:16px;">
      Add this reservation to your calendar from the confirmation page.
    </p>`

  await sendMail({
    to,
    subject: `Reservation Confirmed - ${reservation.booking_ref} | Eclat`,
    html: orderEmailShell('Reservation Confirmed', body),
  })

  return { ok: true as const }
}

export async function sendReservationReminderEmail(
  reservation: ReservationEmailFields,
  type: '24h' | '1h'
) {
  if (!reservation.customer_email) return { ok: false as const, skipped: true }

  const title = type === '24h' ? 'Reminder - Tomorrow at Eclat' : 'Reminder - See You Soon'
  const intro =
    type === '24h'
      ? 'This is a friendly reminder of your reservation tomorrow.'
      : 'Your table will be ready in about one hour. We are preparing for your arrival.'

  await sendMail({
    to: reservation.customer_email,
    subject: `${type === '24h' ? 'Tomorrow' : 'Today'} - ${reservation.booking_ref} | Eclat`,
    html: orderEmailShell(
      title,
      `<p style="color:#a8a8a0;font-family:sans-serif;font-size:14px;line-height:1.6;">Dear ${reservation.customer_name}, ${intro}</p>${reservationDetailsHtml(reservation)}`
    ),
  })

  return { ok: true as const }
}

export async function sendReservationCancelledEmail(
  reservation: Pick<ReservationBooking, 'booking_ref' | 'customer_name' | 'customer_email'>
) {
  if (!reservation.customer_email) return { ok: false as const, skipped: true }

  await sendMail({
    to: reservation.customer_email,
    subject: `Reservation Cancelled - ${reservation.booking_ref} | Eclat`,
    html: orderEmailShell(
      'Reservation Cancelled',
      `<p style="color:#a8a8a0;font-family:sans-serif;font-size:14px;line-height:1.6;">
        Dear ${reservation.customer_name}, your reservation <strong style="color:#c9a84c;">${reservation.booking_ref}</strong> has been cancelled as requested. Your time slot is now available for other guests.
      </p>
      <p style="margin:24px 0 0;">
        <a href="${SITE_URL}/reservations" style="color:#c9a84c;">Book again</a>
      </p>`
    ),
  })

  return { ok: true as const }
}