# Setup Email Notifikasi — Resend + temaniyoga.com

Panduan setup email transaksional untuk Temanyoga menggunakan [Resend](https://resend.com).

## Ringkasan arsitektur

```
Order / status change / payment proof
        ↓
sendEmailToCustomer()  ← src/lib/email.ts
        ↓
Resend API (RESEND_API_KEY)
        ↓
Pelanggan (from: notifikasi@temaniyoga.com)
```

Notifikasi aktif jika **keduanya** terpenuhi:
1. Env `RESEND_API_KEY` diset
2. Admin → Pengaturan → Email → toggle **Aktif**

---

## Langkah 1 — API Key Resend

1. Login [resend.com](https://resend.com)
2. **API Keys** → Create API Key (permission: **Sending access**)
3. Set di environment:

```env
RESEND_API_KEY=re_xxxxxxxx
```

**Railway:** App service → Variables → tambah `RESEND_API_KEY` → redeploy.

**Lokal:** salin ke `.env` (jangan commit).

---

## Langkah 2 — Verifikasi domain temaniyoga.com

Domain `temaniyoga.com` sudah didaftarkan di akun Resend (region: `ap-northeast-1`).

Buka **Resend Dashboard → Domains → temaniyoga.com** dan tambahkan record DNS berikut di registrar domain Anda (Cloudflare, Niagahoster, dll):

| Tipe | Host / Name | Value | Priority |
|------|-------------|-------|----------|
| **TXT** | `resend._domainkey` | *(salin dari dashboard Resend — unik per domain)* | — |
| **TXT** | `send` | `v=spf1 include:amazonses.com ~all` | — |
| **MX** | `send` | `feedback-smtp.ap-northeast-1.amazonses.com` | `10` |

> Nilai DKIM **berbeda per domain**. Selalu ambil dari dashboard Resend, jangan copy dari dokumen lain.

Setelah DNS propagate (5 menit – 48 jam), klik **Verify** di Resend. Status harus **Verified** sebelum email produksi bisa terkirim.

### Troubleshooting DNS

- Pastikan host `send` = subdomain `send.temaniyoga.com`, bukan root `@`
- Hapus record SPF lama yang konflik di root domain
- Domain lama `ditemaniyoga.com` di Resend masih **failed** — abaikan atau hapus jika tidak dipakai

---

## Langkah 3 — Konfigurasi aplikasi

Default pengirim (bisa diubah di Admin):

| Setting | Default |
|---------|---------|
| From | `D'TEMAN YOGA <notifikasi@temaniyoga.com>` |
| Reply-To | `cs@temaniyoga.com` |

Seed database (opsional, idempotent):

```bash
npm run db:seed
```

---

## Langkah 4 — Tes dari Admin

1. Login admin → **Pengaturan → tab Email**
2. Isi alamat email Anda di **Kirim Email Tes**
3. Klik **Kirim Tes**

- **Berhasil** → Resend + DNS OK
- **Gagal "domain not verified"** → selesaikan Langkah 2 dulu
- **Gagal "API key"** → cek `RESEND_API_KEY` di env

4. Jika tes OK, aktifkan toggle **Aktifkan Notifikasi Email** → **Simpan**

---

## Langkah 5 — Resend MCP (Cursor)

Untuk manage domain/email via AI di Cursor, tambahkan MCP server Resend:

**Cursor Settings → MCP → Add new global MCP server:**

```json
{
  "mcpServers": {
    "resend": {
      "command": "npx",
      "args": ["-y", "resend-mcp"],
      "env": {
        "RESEND_API_KEY": "re_xxxxxxxxx",
        "SENDER_EMAIL_ADDRESS": "notifikasi@temaniyoga.com"
      }
    }
  }
}
```

Ganti `re_xxxxxxxxx` dengan API key Anda.

Dokumentasi MCP: [resend.com/docs/mcp-server](https://resend.com/docs/mcp-server)

Contoh perintah ke agent setelah MCP aktif:
- "List domains Resend saya"
- "Verify domain temaniyoga.com"
- "Send test email to admin@temanyoga.com"

---

## Event email yang dikirim otomatis

| Event | Trigger |
|-------|---------|
| Pesanan dibuat | `POST /api/orders` |
| Bukti bayar diterima | `POST /api/orders/.../payment-proof` |
| Bukti bayar disetujui/ditolak | Admin payment proof |
| Status order berubah | Admin order status |

Template HTML: `src/lib/email-templates.ts`  
Preview: Admin → Pengaturan → Email → Preview Template

---

## Checklist produksi

- [ ] `RESEND_API_KEY` di Railway
- [ ] DNS temaniyoga.com verified di Resend
- [ ] Record **DMARC** ditambahkan (lihat bawah)
- [ ] Email tes dari admin berhasil
- [ ] Toggle email enabled ON
- [ ] `site_url` di pengaturan = `https://temaniyoga.com` (untuk link di email)

---

## Deliverability — apakah masuk inbox?

**Tidak ada yang bisa menjamin 100% inbox** (Gmail bisa taruh di Primary, Promotions, atau Spam). Tapi setup berikut memaksimalkan peluang:

### Sudah OK di project ini

| Faktor | Status |
|--------|--------|
| Domain verified (SPF + DKIM via Resend) | ✅ (tes sudah masuk) |
| Email transaksional (bukan promosi) | ✅ |
| HTML + plain text multipart | ✅ |
| Reply-To valid (`cs@temaniyoga.com`) | ✅ pastikan inbox-nya ada |
| Subjek jelas + kode pesanan | ✅ format `[D'TEMAN YOGA] ... — ORD-xxx` |
| Tanpa gambar-only / link-only | ✅ |
| Footer identitas + alasan email | ✅ |

### Wajib tambah di DNS (disarankan)

Record **DMARC** di root domain `temaniyoga.com`:

| Tipe | Host | Value |
|------|------|-------|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:cs@temaniyoga.com` |

Setelah 2–4 minggu tanpa masalah, ubah `p=none` → `p=quarantine` lalu `p=reject`.

### Tes deliverability manual

1. Kirim email tes ke **Gmail** + **Yahoo/Outlook** pribadi
2. Cek header email (Show original) → `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`
3. Resend Dashboard → **Emails** → pastikan status `delivered`, bukan `bounced`
4. Minta pelanggan pertama kali cek folder Spam — jika ada, mark "Not spam"

### Yang bisa turunkan reputasi (hindari)

- Kirim ke email invalid / typo
- Subjek clickbait / FULL CAPS / terlalu banyak emoji
- Volume tiba-tiba besar dari domain baru
- `reply-to` atau `from` domain berbeda tanpa alignment
