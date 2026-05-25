import nodemailer from 'nodemailer'
import type { Order, OrderStatus, PaymentMethod } from '@/types/database'
import { formatDate, formatTime, getOrderStatusConfig } from '@/lib/utils'
import type { ReservationBooking } from '@/types/index'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'

// ── Gmail transporter ──────────────────────────────────────────────────────────
// Set these in .env.local:
//   GMAIL_USER=khuram.naeem00@gmail.com
//   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   (Gmail App Password, not login password)
//   ADMIN_EMAIL=khuram.naeem00@gmail.com
//   NEXT_PUBLIC_SITE_URL=http://localhost:3000

const GMAIL_USER = process.env.GMAIL_USER ?? ''
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD ?? ''
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'khuram.naeem00@gmail.com'
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
  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"Eclat Restaurant" <${GMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  })
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`
}

function orderEmailShell(title: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;color:#f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#161616;border:1px solid rgba(201,168,76,0.2);">
    <tr>
      <td style="padding:32px 28px;border-bottom:1px solid rgba(201,168,76,0.15);">
        <p style="margin:0;font-size:28px;letter-spacing:0.15em;color:#c9a84c;">Eclat</p>
        <p style="margin:4px 0 0;font-size:11px;letter-spacing:0.25em;color:#a8a8a0;font-family:sans-serif;text-transform:uppercase;">Fine Dining</p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;color:#f5f5f0;">${title}</h1>
        ${body}
      </td>
    </tr>
    <tr>
      <td style="padding:20px 28px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#666;font-family:sans-serif;">
        2026 Eclat Restaurant. This is an automated message.
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
    to: ADMIN_EMAIL,
    subject: `New Order (Pending) - ${order.order_ref}`,
    html: orderEmailShell(
      'New Online Order',
      `<p style="color:#a8a8a0;font-family:sans-serif;font-size:14px;">
        ${order.customer_name} — ${order.customer_phone}<br/>
        ${paymentLabel} — ${formatAmount(order.total_amount)}<br/><br/>
        <a href="${SITE_URL}/admin/orders" style="color:#c9a84c;">Review in admin panel</a>
        · <a href="${trackUrl}" style="color:#c9a84c;">View order</a>
      </p>`
    ),
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
  if (!order.customer_email?.trim()) return { ok: false as const, skipped: true }

  const trackUrl = `${SITE_URL}/order/${order.id}`
  const paymentLabel = PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod]

  const body = `
    <p style="color:#a8a8a0;font-family:sans-serif;font-size:14px;line-height:1.6;">
      Dear ${order.customer_name}, great news — your order <strong style="color:#c9a84c;">${order.order_ref}</strong> is confirmed and will be prepared for delivery.
    </p>
    <table style="width:100%;margin:20px 0;font-family:sans-serif;font-size:13px;color:#a8a8a0;">
      <tr><td style="padding:6px 0;">Reference</td><td style="text-align:right;color:#c9a84c;">${order.order_ref}</td></tr>
      <tr><td style="padding:6px 0;">Payment</td><td style="text-align:right;">${paymentLabel}</td></tr>
      <tr><td style="padding:6px 0;">Total</td><td style="text-align:right;color:#f5f5f0;">${formatAmount(order.total_amount)}</td></tr>
      <tr><td style="padding:6px 0;">Delivery</td><td style="text-align:right;">${order.delivery_address}</td></tr>
    </table>
    <p style="color:#a8a8a0;font-family:sans-serif;font-size:13px;">
      Track live updates (preparing, on the way, delivered) on your order page — we will not send further emails for status changes.
    </p>
    <p style="margin:24px 0 0;">
      <a href="${trackUrl}" style="display:inline-block;padding:12px 24px;background:#8b0000;color:#fff;text-decoration:none;font-family:sans-serif;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;">Track Your Order</a>
    </p>`

  await sendMail({
    to: order.customer_email.trim(),
    subject: `Order Confirmed - ${order.order_ref} | Eclat`,
    html: orderEmailShell('Your Order is Confirmed', body),
  })

  return { ok: true as const }
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
    to: order.customer_email,
    subject: `Order Update - ${label} | ${order.order_ref}`,
    html: orderEmailShell('Order Status Updated', body),
  })

  return { ok: true as const }
}

export async function sendPaymentReceivedEmail(
  order: Pick<Order, 'order_ref' | 'customer_name' | 'customer_email' | 'id'>
) {
  if (!order.customer_email) return { ok: false as const, skipped: true }

  const body = `
    <p style="color:#a8a8a0;font-family:sans-serif;font-size:14px;line-height:1.6;">
      Dear ${order.customer_name}, we have verified your payment for order <strong style="color:#c9a84c;">${order.order_ref}</strong>.
      Your order is now confirmed and being prepared.
    </p>
    <p style="margin:24px 0 0;">
      <a href="${SITE_URL}/order/${order.id}" style="display:inline-block;padding:12px 24px;background:#c9a84c;color:#0a0a0a;text-decoration:none;font-family:sans-serif;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;">Track Order</a>
    </p>`

  await sendMail({
    to: order.customer_email,
    subject: `Payment Confirmed - ${order.order_ref} | Eclat`,
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

  // Admin notification always goes to ADMIN_EMAIL (your Gmail)
  await sendMail({
    to: ADMIN_EMAIL,
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