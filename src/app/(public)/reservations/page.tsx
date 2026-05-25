'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import ReservationForm from '@/components/public/reservations/ReservationForm'

export default function ReservationsPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <section className="relative overflow-hidden" style={{ minHeight: '320px' }}>
        <Image
          src="/images/redd-francisco-o1sdskce8ie-unsplash.jpg"
          alt="Éclat dining ambiance"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.92) 100%)',
          }}
        />
        <div className="relative z-10 container-eclat flex flex-col items-center justify-center text-center py-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-label text-[var(--accent-gold)] mb-3"
          >
            Table Reservations
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-display"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Reserve Your Evening
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-lg mt-4"
            style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}
          >
            Select your date and time — availability updates in real time as tables are booked.
          </motion.p>
        </div>
      </section>

      <section className="section-py">
        <div className="container-eclat">
          <ReservationForm />
        </div>
      </section>
    </div>
  )
}
