-- Transaction ID / reference for EasyPaisa & JazzCash payments
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_reference text;
