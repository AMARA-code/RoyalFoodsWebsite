-- Phase 4: Table reservations — slots + cancellation tokens
-- Run in Supabase SQL Editor if not already applied.

-- Time slots (admin-managed max covers per slot)
CREATE TABLE IF NOT EXISTS reservation_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot TEXT NOT NULL UNIQUE,
  label TEXT,
  max_covers INTEGER NOT NULL DEFAULT 24,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default dinner/lunch slots
INSERT INTO reservation_slots (time_slot, label, max_covers, sort_order) VALUES
  ('12:00', 'Lunch — 12:00 PM', 24, 1),
  ('12:30', '12:30 PM', 24, 2),
  ('13:00', '1:00 PM', 24, 3),
  ('13:30', '1:30 PM', 24, 4),
  ('18:00', 'Dinner — 6:00 PM', 30, 5),
  ('18:30', '6:30 PM', 30, 6),
  ('19:00', '7:00 PM', 30, 7),
  ('19:30', '7:30 PM', 30, 8),
  ('20:00', '8:00 PM', 30, 9),
  ('20:30', '8:30 PM', 30, 10),
  ('21:00', '9:00 PM', 24, 11)
ON CONFLICT (time_slot) DO NOTHING;

-- Cancellation link + reminder tracking on reservations
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS cancel_token UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN NOT NULL DEFAULT false;

-- RLS: public read slots, public insert reservations (API uses service role as fallback)
ALTER TABLE reservation_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active slots"
  ON reservation_slots FOR SELECT
  USING (is_active = true);

-- Realtime for live slot availability
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
