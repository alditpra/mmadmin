# Merdeka Mobil Admin Dashboard

Admin dashboard untuk mengelola data mobil, testimonials, dan settings yang tersimpan di Google Sheets.

## Fitur

- 🔐 Login dengan Google OAuth (email whitelist)
- 🚗 CRUD Mobil (tambah, edit, hapus, toggle status)
- ⭐ CRUD Testimonials (dengan preview YouTube)
- ⚙️ Edit Settings (termasuk promo banner)
- 🌙 Light/Dark mode
- 📱 Responsive design

## Setup

### 1. Google Cloud Console

1. Buat project di [Google Cloud Console](https://console.cloud.google.com/)
2. Enable APIs:
   - Google Sheets API

3. Buat OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: 
     - `http://localhost:4321/api/auth/callback` (dev)
     - `https://your-domain.vercel.app/api/auth/callback` (prod)

4. **Pastikan user yang login punya akses Editor ke spreadsheet**

### 2. Environment Variables

Copy `.env.example` ke `.env` dan isi:

```
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
SPREADSHEET_ID=xxx
ADMIN_EMAILS=email1@gmail.com,email2@gmail.com
JWT_SECRET=random_string
SITE_URL=http://localhost:4321
```

### 3. Development

```bash
npm install
npm run dev
```

### 4. Deploy ke Vercel

1. Push ke GitHub
2. Import project ke Vercel
3. Set environment variables (gunakan production SITE_URL)
4. Deploy

## Struktur Spreadsheet

### Sheet: cars
id, status, brand, model, year, price, mileage, transmission, fuel, color, bpkb, description, features, image1-5, video_url, featured, badge, sold_date, date_added

### Sheet: settings
key, value (whatsapp_number, business_name, promo_active, dll)

### Sheet: testimonials
id, type, media, name, car, quote, rating
