'use client'

import Link from 'next/link'
import Logo from '@/components/brand/Logo'
import { usePublicSettings } from '@/hooks/usePublicSettings'
import { ROYAL_FOODS } from '@/lib/constants'

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
    </svg>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  const { settings } = usePublicSettings()
  const phone = settings.contact.phone || ROYAL_FOODS.phone
  const address = settings.contact.address || ROYAL_FOODS.address
  const hoursNote = settings.hours.note || ROYAL_FOODS.hours

  return (
    <footer className="bg-[#D62828] text-white mt-8" aria-label="Site footer">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size={48} showText={false} href={null} className="mb-3" />
            <p className="text-white font-bold text-lg">Royal Foods</p>
            <p className="text-sm text-white/85 leading-relaxed mt-2">{address}</p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">Contact</h4>
            <div className="space-y-1.5 text-sm text-white/90">
              <a href={`tel:${phone}`} className="block hover:text-white">{phone}</a>
              {ROYAL_FOODS.phoneAlt.map((p) => (
                <a key={p} href={`tel:${p}`} className="block hover:text-white">{p}</a>
              ))}
              <a
                href={`https://wa.me/${ROYAL_FOODS.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-white"
              >
                WhatsApp Available
              </a>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">Our Timings</h4>
            <p className="text-sm text-white/90">Monday – Sunday</p>
            <p className="text-sm text-white/90">{hoursNote}</p>
            <p className="text-xs text-white/70 mt-2">{ROYAL_FOODS.rating}★ ({ROYAL_FOODS.reviews} reviews)</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-white/90">
              <Link href="/terms" className="hover:text-white hover:underline">Terms & Conditions</Link>
              <Link href="/privacy" className="hover:text-white hover:underline">Privacy Policy</Link>
              <Link href="/sitemap" className="hover:text-white hover:underline">Sitemap</Link>
            </div>
            <a
              href={ROYAL_FOODS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Royal Foods on Facebook"
              className="inline-flex items-center gap-2 mt-4 text-sm text-white/90 hover:text-white hover:underline"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <FacebookIcon />
              </span>
              Royal Foods Rajanpur
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/25">
        <p className="text-center text-xs text-white/70 py-4">
          © {year} Royal Foods. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
