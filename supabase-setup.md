# Supabase Storage Setup untuk Foto Profil

## Langkah 1: Buat Storage Bucket

1. Login ke Supabase Dashboard
2. Pilih project Anda
3. Navigasi ke **Storage** di sidebar
4. Klik **Create a new bucket**
5. Isi konfigurasi bucket:
   - **Name**: `profile-photos`
   - **Public bucket**: Aktifkan/Centang (agar foto bisa diakses public)
   - Klik **Create bucket**

## Langkah 2: Set Storage Policies

1. Di Storage bucket `profile-photos`, klik **Policies**
2. Tambahkan policy berikut:

### Policy 1: SELECT (Read)
\`\`\`sql
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');
\`\`\`

### Policy 2: INSERT (Upload)
\`\`\`sql
CREATE POLICY "Allow authenticated users to upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' AND
  auth.role() = 'authenticated'
);
\`\`\`

### Policy 3: DELETE (Delete)
\`\`\`sql
CREATE POLICY "Allow users to delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' AND
  auth.role() = 'authenticated'
);
\`\`\`

## Langkah 3: Verifikasi Database

Pastikan tabel `users` memiliki kolom:
- `photo_url` (TEXT) - untuk menyimpan URL foto dari Supabase Storage
- `bio` (TEXT) - untuk menyimpan bio user

Jalankan SQL di Supabase SQL Editor:
\`\`\`sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'no bio';
\`\`\`

## Langkah 4: Test Upload

1. Login ke aplikasi
2. Buka Profile → Edit Profil
3. Klik Upload untuk upload foto (max 512KB, JPG/PNG/WebP)
4. Foto akan otomatis tersimpan di Supabase Storage

## Troubleshooting

- Jika upload gagal, pastikan environment variables sudah benar:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- Jika foto tidak tampil, pastikan bucket `profile-photos` sudah public
- Pastikan CORS policy sudah dikonfigurasi di Supabase (biasanya default sudah benar)
