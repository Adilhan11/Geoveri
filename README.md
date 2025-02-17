# 🌍 Antalya Hava Kalitesi ve Otel Haritası

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v13+-blue.svg)

</div>

## 📋 İçerik Tablosu
- [Proje Hakkında](#-proje-hakkında)
- [Özellikler](#-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Başlangıç](#-başlangıç)
  - [Ön Gereksinimler](#ön-gereksinimler)
  - [Kurulum](#kurulum)
- [Kullanım](#-kullanım)
- [Hava Kalitesi Göstergeleri](#-hava-kalitesi-göstergeleri)
- [API Dökümantasyonu](#-api-dökümantasyonu)

## 🎯 Proje Hakkında

Bu proje, Antalya'daki hava kalitesi verilerini gerçek zamanlı olarak harita üzerinde görselleştiren ve kullanıcılara konuma dayalı akıllı otel önerileri sunan interaktif bir web uygulamasıdır. Turistler ve yerel halk için hava kalitesi bilinci oluşturmayı ve konforlu konaklama seçenekleri sunmayı hedeflemektedir.

## ✨ Özellikler

- 🗺️ Antalya'nın detaylı interaktif haritası
- 📍 Gerçek zamanlı hava kalitesi göstergeleri
- 🏨 Akıllı otel öneri sistemi
- 📏 Özelleştirilebilir arama yarıçapı (0.5 km - 10 km)
- 📱 Mobil uyumlu tasarım
- 🔄 Otomatik veri güncelleme
- 📊 Detaylı hava kalitesi istatistikleri

## 🛠 Teknoloji Yığını

- **Frontend**:
  - HTML5 & CSS3
  - JavaScript (ES6+)
  - Leaflet.js (Harita görselleştirme)
  
- **Backend**:
  - Node.js
  - Express.js
  - PostgreSQL
  
- **Araçlar & Kütüphaneler**:
  - node-fetch
  - pg (PostgreSQL client)

## 🚀 Başlangıç

### Ön Gereksinimler

- Node.js 
- PostgreSQL 
- npm 

### Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/kullaniciadi/antalya-air-quality.git
cd antalya-air-quality
```

2. PostgreSQL'i kurun ve veritabanını oluşturun:
```bash
psql -U postgres -f database/schema.sql
```

3. Bağımlılıkları yükleyin:
```bash
npm install
```

4. Veritabanı yapılandırmasını düzenleyin:
   `server.js` ve `generate_data.js` dosyalarındaki PostgreSQL bağlantı bilgilerini güncelleyin:
```javascript
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'antalya_air_quality',
    password: 'your_password',
    port: 5432,
});
```

5. Örnek verileri oluşturun:
```bash
node generate_data.js
```

6. Uygulamayı başlatın:
```bash
npm start
```

7. Tarayıcınızda `http://localhost:3000` adresini açın

## 💡 Kullanım

1. **Konum Seçimi**
   - Harita üzerinde istediğiniz konumu tıklayın
   - Arama yarıçapını kaydırıcı ile ayarlayın

2. **Otel Arama**
   - "En Uygun Oteli Bul" butonuna tıklayın
   - Sistem, hava kalitesi ve mesafe faktörlerini değerlendirerek en uygun oteli gösterecektir

3. **Hava Kalitesi Görüntüleme**
   - Harita üzerindeki renkli noktalar hava kalitesi seviyelerini gösterir
   - Noktalara tıklayarak detaylı bilgi alabilirsiniz

## 🌈 Hava Kalitesi Göstergeleri

| Renk | Seviye | AQI Değeri | Sağlık Etkisi |
|------|---------|------------|----------------|
| 🟢 | İyi | 0-50 | Hava kalitesi tatmin edici |
| 🟡 | Orta | 51-100 | Hassas gruplar için orta düzey risk |
| 🔴 | Hassas | 101-150 |  Herkes için sağlıksız |

## 📚 API Dökümantasyonu

### Endpoints

- `GET /api/air-quality`
  - Tüm hava kalitesi ölçüm noktalarını döndürür
  
- `GET /api/hotels`
  - Tüm otel listesini döndürür
  
- `POST /api/find-hotel`
  - Verilen konum ve yarıçapa göre en uygun oteli bulur
