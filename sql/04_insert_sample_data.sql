-- Insert sample admin user
INSERT INTO users (nis, username, full_name, password, role, position)
VALUES 
  ('0001', 'admin', 'Admin User', 'admin123', 'admin', 'Administrator'),
  ('0002', 'siswa1', 'M. Hanan Izzaturrofan', 'password123', 'user', 'Siswa - X PPLG 1'),
  ('0003', 'siswa2', 'Budi Santoso', 'password456', 'user', 'Siswa - X PPLG 2')
ON CONFLICT DO NOTHING;

-- Insert sample transactions
INSERT INTO transactions (nis, nominal, description, type, status)
VALUES 
  ('0002', 5000.00, 'Pembayaran Kas Mingguan', 'pemasukan', 'approved'),
  ('0002', 5000.00, 'Pembayaran Kas Mingguan', 'pemasukan', 'approved'),
  ('0002', 5000.00, 'Pembayaran Kas Mingguan', 'pemasukan', 'approved'),
  ('0002', 5000.00, 'Pembayaran Kas Mingguan', 'pemasukan', 'approved'),
  ('0001', 100000.00, 'Pembelian Perlengkapan Event', 'pengeluaran', 'approved'),
  ('0001', 50000.00, 'Pembayaran Catering', 'pengeluaran', 'approved')
ON CONFLICT DO NOTHING;
