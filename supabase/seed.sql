-- Seed data for Clinic AI Automation prototype

-- Patients (20 records)
INSERT INTO patients (name, email, phone, date_of_birth, gender, address, medical_history) VALUES
('Aditya Pratama', 'aditya.p@email.com', '081234567801', '1990-03-15', 'male', 'Jl. Sudirman No. 10, Jakarta', 'Hypertension, mild asthma'),
('Siti Nurhaliza', 'siti.n@email.com', '081234567802', '1985-07-22', 'female', 'Jl. Thamrin No. 25, Jakarta', 'Diabetes type 2'),
('Budi Santoso', 'budi.s@email.com', '081234567803', '1978-11-08', 'male', 'Jl. Gatot Subroto No. 5, Jakarta', 'High cholesterol'),
('Dewi Lestari', 'dewi.l@email.com', '081234567804', '1995-01-30', 'female', 'Jl. Kuningan No. 12, Jakarta', 'None'),
('Rizky Maulana', 'rizky.m@email.com', '081234567805', '2000-06-18', 'male', 'Jl. Kemang No. 8, Jakarta', 'Allergic rhinitis'),
('Ayu Wulandari', 'ayu.w@email.com', '081234567806', '1992-09-05', 'female', 'Jl. Cikini No. 3, Jakarta', 'Migraine'),
('Hendra Wijaya', 'hendra.w@email.com', '081234567807', '1988-12-14', 'male', 'Jl. Blok M No. 7, Jakarta', 'Gastritis'),
('Ratna Dewi', 'ratna.d@email.com', '081234567808', '1975-04-20', 'female', 'Jl. Senayan No. 15, Jakarta', 'Osteoarthritis'),
('Dimas Ardiansyah', 'dimas.a@email.com', '081234567809', '1998-08-11', 'male', 'Jl. Pondok Indah No. 2, Jakarta', 'None'),
('Nina Karlina', 'nina.k@email.com', '081234567810', '1993-02-28', 'female', 'Jl. Kelapa Gading No. 9, Jakarta', 'Thyroid disorder'),
('Andre Wijaya', 'andre.w@email.com', '081234567811', '1983-05-17', 'male', 'Jl. PIK No. 6, Jakarta', 'Lower back pain'),
('Fitriani', 'fitriani@email.com', '081234567812', '1991-10-03', 'female', 'Jl. Tebet No. 4, Jakarta', 'Anemia'),
('Rudi Hartono', 'rudi.h@email.com', '081234567813', '1970-07-25', 'male', 'Jl. Rawamangun No. 11, Jakarta', 'Hypertension, diabetes'),
('Mega Sari', 'mega.s@email.com', '081234567814', '1997-11-19', 'female', 'Jl. Depok No. 1, Jakarta', 'None'),
('Tono Setiawan', 'tono.s@email.com', '081234567815', '1986-01-07', 'male', 'Jl. Bekasi No. 13, Jakarta', 'GERD'),
('Lina Marlia', 'lina.m@email.com', '081234567816', '1994-06-22', 'female', 'Jl. Bogor No. 16, Jakarta', 'Eczema'),
('Agus Hermawan', 'agus.h@email.com', '081234567817', '1981-09-30', 'male', 'Jl. Tangerang No. 14, Jakarta', 'Sinusitis'),
('Putri Amelia', 'putri.a@email.com', '081234567818', '1999-03-12', 'female', 'Jl. BSD No. 17, Jakarta', 'None'),
('Doni Prasetyo', 'doni.p@email.com', '081234567819', '1989-12-01', 'male', 'Jl. Serpong No. 18, Jakarta', 'Insomnia'),
('Citra Ayu', 'citra.a@email.com', '081234567820', '2001-08-09', 'female', 'Jl. Alam Sutera No. 19, Jakarta', 'None');

-- Staff (10 records - 6 doctors, 4 nurses)
INSERT INTO staff (name, email, phone, role, specialization, license_number) VALUES
('Dr. Ahmad Fauzi', 'ahmad.f@clinic.id', '08119876501', 'doctor', 'General Medicine', 'LIC-2020-001'),
('Dr. Ratna Sari', 'ratna.s@clinic.id', '08119876502', 'doctor', 'Pediatrics', 'LIC-2019-045'),
('Dr. Bambang Wibowo', 'bambang.w@clinic.id', '08119876503', 'doctor', 'Cardiology', 'LIC-2018-023'),
('Dr. Sari Indah', 'sari.i@clinic.id', '08119876504', 'doctor', 'Dermatology', 'LIC-2021-067'),
('Dr. Hendra Gunawan', 'hendra.g@clinic.id', '08119876505', 'doctor', 'Orthopedics', 'LIC-2017-034'),
('Dr. Dian Purnama', 'dian.p@clinic.id', '08119876506', 'doctor', 'Internal Medicine', 'LIC-2022-012'),
('Ns. Rina Marlina', 'rina.m@clinic.id', '08119876507', 'nurse', 'General Nursing', 'LIC-2020-089'),
('Ns. Budi Hartono', 'budi.h@clinic.id', '08119876508', 'nurse', 'Emergency Nursing', 'LIC-2019-056'),
('Ns. Siska Putri', 'siska.p@clinic.id', '08119876509', 'nurse', 'Pediatric Nursing', 'LIC-2021-078'),
('Ns. Agus Salim', 'agus.s@clinic.id', '08119876510', 'nurse', 'General Nursing', 'LIC-2022-034');

-- Schedules (50 slots over 2 weeks)
DO $$
DECLARE
  staff_ids UUID[];
  patient_ids UUID[];
  s_id UUID;
  p_id UUID;
  d DATE;
  t TIME;
  i INT;
BEGIN
  SELECT array_agg(id) INTO staff_ids FROM staff;
  SELECT array_agg(id) INTO patient_ids FROM patients;
  
  FOR i IN 0..49 LOOP
    d := CURRENT_DATE + (i % 14);
    
    -- Skip weekends
    IF EXTRACT(DOW FROM d) IN (0, 6) THEN
      CONTINUE;
    END IF;
    
    s_id := staff_ids[1 + (i % array_length(staff_ids, 1))];
    
    t := '08:00'::TIME + ((i % 8) * INTERVAL '1 hour');
    
    INSERT INTO schedules (staff_id, patient_id, date, start_time, end_time, status, type, notes)
    VALUES (
      s_id,
      CASE WHEN i % 3 = 0 THEN patient_ids[1 + (i % array_length(patient_ids, 1))] ELSE NULL END,
      d,
      t,
      t + INTERVAL '1 hour',
      CASE WHEN i % 3 = 0 THEN 'booked' ELSE 'available' END,
      CASE WHEN i % 4 = 0 THEN 'procedure' WHEN i % 4 = 1 THEN 'follow_up' ELSE 'consultation' END,
      CASE WHEN i % 3 = 0 THEN 'Regular checkup' ELSE NULL END
    );
  END LOOP;
END $$;

-- Bookings (for the booked schedule slots)
INSERT INTO bookings (patient_id, schedule_id, status, reason)
SELECT 
  s.patient_id,
  s.id,
  'confirmed',
  'Scheduled appointment'
FROM schedules s
WHERE s.patient_id IS NOT NULL AND s.status = 'booked';

-- Payments (for bookings)
INSERT INTO payments (booking_id, patient_id, amount, status, payment_method, invoice_number)
SELECT 
  b.id,
  b.patient_id,
  150000 + (random() * 500000)::DECIMAL(12,2),
  CASE WHEN random() > 0.3 THEN 'paid' ELSE 'pending' END,
  CASE WHEN random() > 0.5 THEN 'bank_transfer' ELSE 'cash' END,
  'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(row_number() OVER ()::TEXT, 3, '0')
FROM bookings b;

-- Notifications (sample admin notifications)
INSERT INTO notifications (recipient_type, type, title, message, is_read)
VALUES 
('admin', 'summary', 'Daily Summary Ready', 'Clinic daily operational summary for today is available.', false),
('admin', 'action_required', 'Pending Approval: Dr. Ahmad Schedule', '3 schedule changes pending approval for Dr. Ahmad Fauzi.', false),
('admin', 'general', 'System Update', 'Scheduled maintenance tonight at 11 PM.', true);
