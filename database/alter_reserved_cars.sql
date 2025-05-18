ALTER TABLE reserved_cars
ADD COLUMN payment_status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending' AFTER status,
ADD COLUMN payment_reference VARCHAR(100) NULL AFTER payment_status,
ADD COLUMN payment_amount DECIMAL(10,2) NULL AFTER payment_reference;
