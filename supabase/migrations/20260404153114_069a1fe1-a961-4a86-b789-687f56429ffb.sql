
-- Add constraint to limit order abuse
ALTER TABLE public.orders ADD CONSTRAINT check_customer_name_length CHECK (char_length(customer_name) <= 100);
ALTER TABLE public.orders ADD CONSTRAINT check_customer_phone_length CHECK (char_length(customer_phone) <= 20);
ALTER TABLE public.orders ADD CONSTRAINT check_notes_length CHECK (char_length(notes) <= 500);
ALTER TABLE public.order_items ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0 AND quantity <= 100);
