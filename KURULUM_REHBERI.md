# 🚀 TheBestML Push Notification Sunucusu Kurulum Rehberi

## 📋 Adım Adım Kurulum

### 1️⃣ Firebase Service Account Oluşturma

1. [Firebase Console](https://console.firebase.google.com) adresine git
2. Projenizi seçin (thebestml-installer)
3. Sol menüden **⚙️ Proje Ayarları** tıklayın
4. **Hizmet Hesapları** sekmesine geçin
5. **"Yeni özel anahtar oluştur"** butonuna tıklayın
6. JSON dosyası indirilecek (bu dosyayı güvenli saklayın!)

### 2️⃣ Vercel Hesabı Oluşturma

1. [vercel.com](https://vercel.com) adresine gidin
2. **"Start Deploying"** veya **"Sign Up"** tıklayın
3. **"Continue with GitHub"** seçin (en kolay yol)
4. GitHub hesabınızla giriş yapın

### 3️⃣ Push Server'ı Vercel'e Deploy Etme

#### Yöntem A: GitHub ile (Önerilen)

1. **GitHub'da yeni repo oluşturun**:
   - Repo adı: `thebestml-push-server`
   - Public veya Private

2. **push-server klasörünü GitHub'a yükleyin**:
   ```powershell
   cd "c:\Users\onurt\Desktop\Mobil Uygulama\push-server"
   git init
   git add .
   git commit -m "Initial push server"
   git remote add origin https://github.com/KULLANICI_ADINIZ/thebestml-push-server.git
   git push -u origin main
   ```

3. **Vercel'de import edin**:
   - [vercel.com/new](https://vercel.com/new) adresine gidin
   - "Import Git Repository" seçin
   - `thebestml-push-server` reposunu seçin
   - **Deploy** butonuna tıklayın

#### Yöntem B: Vercel CLI ile

```powershell
# Vercel CLI kur
npm install -g vercel

# push-server klasörüne git
cd "c:\Users\onurt\Desktop\Mobil Uygulama\push-server"

# Vercel'e giriş yap
vercel login

# Deploy et
vercel --prod
```

### 4️⃣ Environment Variables Ayarlama

1. Vercel Dashboard'da projenizi açın
2. **Settings** > **Environment Variables** gidin
3. Şu değişkenleri ekleyin:

| Değişken Adı | Değer |
|-------------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase JSON dosyasının **tüm içeriği** (tek satır) |
| `API_KEY` | Güvenlik anahtarı (örn: `thebestml_push_2024_secret123`) |

#### Firebase JSON'u tek satır yapma:
```powershell
# PowerShell'de:
$json = Get-Content "indirilen-firebase-adminsdk.json" -Raw
$json -replace '\s+', ' '
```

### 5️⃣ Uygulamada Push Server Ayarlarını Girme

1. **Admin Panel** > **💳 Ödeme Ayarları** bölümüne gidin
2. **🔔 Push Bildirim Sunucusu** kısmını bulun
3. Şu bilgileri girin:
   - **Vercel URL**: `https://your-project.vercel.app` (Vercel'in verdiği URL)
   - **API Key**: Vercel'e eklediğiniz `API_KEY` değeri
4. **💾 Kaydet** butonuna tıklayın

### 6️⃣ Test Etme

1. **Admin Panel** > **📢 Bildirim Gönder** bölümüne gidin
2. Hedef: **Tüm Kullanıcılar** veya **Belirli Kullanıcı** seçin
3. Başlık ve mesaj girin
4. **📤 Bildirim Gönder** butonuna tıklayın

Eğer her şey doğruysa:
- Uygulama açıkken: Anında popup görürsünüz
- Uygulama kapalıyken: Telefona push bildirim gelir

---

## ⚠️ Önemli Notlar

- **Firebase Spark planı** (ücretsiz) kullanıyorsanız, Cloud Functions kullanamıyorsunuz. Bu yüzden Vercel kullanıyoruz.
- **Vercel ücretsiz planı** ayda 100GB bandwidth ve günde 100 fonksiyon çağrısı sınırı var (genellikle yeterli).
- **API Key'i gizli tutun!** Bu key ile herkes bildirim gönderebilir.

## 🔧 Sorun Giderme

### "Firebase başlatılamadı" hatası
- `FIREBASE_SERVICE_ACCOUNT` değişkenini kontrol edin
- JSON'un tek satır olduğundan emin olun

### "Unauthorized" hatası
- `X-API-Key` header'ını kontrol edin
- Vercel'deki `API_KEY` ile uygulamadaki key aynı olmalı

### Bildirim gelmiyor
- FCM token'ın Firestore'da kayıtlı olduğundan emin olun
- Telefonun internete bağlı olduğunu kontrol edin
- Uygulama bildirim izninin verildiğini kontrol edin

---

## 📱 Nasıl Çalışıyor?

```
Admin Panel → Vercel API → Firebase Cloud Messaging → Kullanıcı Telefonu
      │              │                │
      │              │                └─ Push bildirim gösterir
      │              │
      │              └─ FCM token'a bildirim gönderir
      │
      └─ Bildirim isteği oluşturur
```

1. Admin panelden bildirim gönderirsiniz
2. Uygulama Vercel'deki API'ye istek atar
3. Vercel, Firebase Admin SDK ile FCM'e bildirim gönderir
4. FCM, kullanıcının telefonuna push bildirim iletir
