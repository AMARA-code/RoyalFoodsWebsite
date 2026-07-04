import type { Order, OrderStatus, PaymentMethod } from '@/types/database'

export const FULFILLMENT_STATUSES: OrderStatus[] = [
  'pending',
  'payment_pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
]

export function isDigitalPayment(method: PaymentMethod) {
  return method === 'easypaisa' || method === 'jazzcash'
}

export function canAdminChangeStatus(order: Pick<Order, 'status'>) {
  return order.status !== 'delivered' && order.status !== 'cancelled'
}

export function shouldCountInRevenue(order: Pick<Order, 'payment_verified'>) {
  return order.payment_verified
}

export async function applyCustomerRevenue(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  order: Pick<Order, 'customer_id' | 'total_amount' | 'payment_verified'>,
  wasVerified: boolean
) {
  if (!order.customer_id || wasVerified || !order.payment_verified) return

  const { data: customer } = await db
    .from('customers')
    .select('total_spent')
    .eq('id', order.customer_id)
    .maybeSingle()

  if (!customer) return

  await db
    .from('customers')
    .update({
      total_spent: (customer.total_spent ?? 0) + order.total_amount,
    })
    .eq('id', order.customer_id)
}
