# 🌩️ Cloudflare R2 Kurulum Rehberi

## 📋 Genel Bakış

Bu rehber, Game Store uygulaması için Cloudflare R2 dosya depolama sistemini kurmanızı sağlar.

**Avantajlar:**
- ✅ 10 GB ücretsiz depolama
- ✅ **Sınırsız indirme** (egress ücretsiz!)
- ✅ Firebase Storage'dan çok daha cömert
- ✅ S3 uyumlu API

---

## 🚀 Adım 1: Cloudflare Hesabı

1. [dash.cloudflare.com](https://dash.cloudflare.com/sign-up) adresine gidin
2. Email ve şifre ile kayıt olun
3. Email doğrulaması yapın

---

## 🪣 Adım 2: R2 Bucket Oluşturma

1. Cloudflare Dashboard'a giriş yapın
2. Sol menüden **R2 Object Storage** seçin
3. **Create bucket** tıklayın
4. Bucket adı girin: `gamestore-files`
5. Location: **Automatic** seçin
6. **Create bucket** tıklayın

---

## 🔑 Adım 3: API Token Oluşturma

1. R2 sayfasında **Manage R2 API Tokens** tıklayın
2. **Create API token** tıklayın
3. Token name: `gamestore-upload`
4. Permissions: **Object Read & Write** seçin
5. Specify bucket: `gamestore-files` seçin
6. **Create API Token** tıklayın
7. **ÖNEMLİ:** Gösterilen bilgileri kaydedin:
   - Access Key ID
   - Secret Access Key

---

## 🌐 Adım 4: Public Access (Custom Domain veya R2.dev)

### Seçenek A: R2.dev Subdomain (Kolay)
1. Bucket ayarlarına gidin
2. **Settings** sekmesi
3. **R2.dev subdomain** bölümünde **Allow Access** tıklayın
4. URL'nizi not edin: `https://pub-xxxxx.r2.dev`

### Seçenek B: Custom Domain (İleri Seviye)
1. Bucket ayarlarında **Custom Domains** seçin
2. Domain ekleyin (Cloudflare'de DNS'i yönetilen bir domain gerekir)

---

## ⚙️ Adım 5: Vercel Environment Variables

Vercel projenize şu environment variables ekleyin:

| Variable | Değer | Açıklama |
|----------|-------|----------|
| `R2_ACCOUNT_ID` | `xxxxxxxx` | Cloudflare Account ID (Dashboard URL'de görünür) |
| `R2_ACCESS_KEY_ID` | `xxxxxxxx` | API Token'dan aldığınız Access Key |
| `R2_SECRET_ACCESS_KEY` | `xxxxxxxx` | API Token'dan aldığınız Secret Key |
| `R2_BUCKET_NAME` | `gamestore-files` | Oluşturduğunuz bucket adı |
| `R2_PUBLIC_URL` | `https://pub-xxxxx.r2.dev` | Public erişim URL'si |

### Vercel'de Ekleme:
1. [vercel.com](https://vercel.com) → Projeniz
2. **Settings** → **Environment Variables**
3. Yukarıdaki değişkenleri ekleyin
4. **Save** tıklayın
5. Projeyi yeniden deploy edin

---

## 🔍 Account ID Nasıl Bulunur?

1. Cloudflare Dashboard'a gidin
2. URL'ye bakın: `https://dash.cloudflare.com/XXXXXXXX/...`
3. XXXXXXXX kısmı Account ID'nizdir
4. Veya: Sağ üstte profil → **Account Home** → URL'de görünür

---

## ✅ Test Etme

Kurulum tamamlandıktan sonra:

1. Game Store uygulamasını açın
2. Admin paneline gidin
3. Oyun/Hile ekle → APK Yükle butonuna tıklayın
4. Bir dosya seçin
5. Yükleme tamamlanmalı ve URL alınmalı

---

## 🛠️ Sorun Giderme

### "R2 credentials not configured" hatası
- Vercel'de environment variables doğru eklendiğinden emin olun
- Projeyi yeniden deploy edin

### "Access Denied" hatası
- API Token'ın doğru bucket'a erişimi olduğundan emin olun
- Token permissions: Object Read & Write olmalı

### Dosya yükleniyor ama URL çalışmıyor
- R2.dev subdomain aktif mi kontrol edin
- R2_PUBLIC_URL doğru mu kontrol edin

---

## 📊 Limitler

| Özellik | Free Tier |
|---------|-----------|
| Depolama | 10 GB/ay |
| Class A ops (write) | 1 milyon/ay |
| Class B ops (read) | 10 milyon/ay |
| **Egress (indirme)** | **Sınırsız!** |

---

## 📞 Destek

Sorun yaşarsanız:
- Cloudflare Docs: https://developers.cloudflare.com/r2/
- Discord/Telegram grubumuz

