'use client'

import { motion } from 'framer-motion'
import CheckoutWizard from '@/components/public/order/CheckoutWizard'

export default function OrderPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <section
        className="relative overflow-hidden"
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingTop: '48px',
          paddingBottom: '48px',
        }}
      >
        <div className="container-eclat text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-label text-[var(--accent-gold)] mb-3"
          >
            Online Ordering
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-display"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Checkout
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '14px' }}
          >
            Secure delivery · EasyPaisa · JazzCash · Cash on Delivery
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            style={{ marginTop: '16px', fontSize: '13px' }}
          >
            <a href="/order/my-orders" className="text-label hover:text-[var(--accent-gold)] transition-colors" style={{ color: 'var(--text-muted)' }}>
              Already ordered? View my orders →
            </a>
          </motion.p>
        </div>
      </section>

      <section className="section-py">
        <div className="container-eclat">
          <CheckoutWizard />
        </div>
      </section>
    </div>
  )
}
