'use client'

import RoyalFoodsCheckout from '@/components/public/order/RoyalFoodsCheckout'

export default function OrderPage() {
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-6">
      <div className="container-eclat">
        <RoyalFoodsCheckout />
      </div>
    </div>
  )
}
