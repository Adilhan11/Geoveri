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
- [Veri Hazırlama ve İşleme Süreci](#-veri-hazırlama-ve-işleme-süreci)
  - [QGIS ve IDW Analizi](#qgis-ve-idw-analizi)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

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

## 🗺️ Veri Hazırlama ve İşleme Süreci

### QGIS ve IDW Analizi

Projemizde hava kalitesi verilerinin görselleştirilmesi için aşağıdaki adımlar izlenmiştir:

1. **IDW (Inverse Distance Weighting) Analizi**
   - QGIS'te hava kalitesi ölçüm noktaları için IDW interpolasyon yöntemi kullanıldı
   - Bu yöntem, ölçüm noktaları arasındaki boşlukları tahminleyerek sürekli bir yüzey oluşturdu
   - Yakın noktaların uzak noktalara göre daha fazla ağırlığa sahip olduğu bir hesaplama yapıldı

2. **Raster Görüntü İşleme**
   - IDW analizi sonucunda elde edilen raster görüntüler işlendi
   - Farklı zoom seviyeleri için optimize edildi
   - Raster veriler, web haritası için uygun formatta tile'lara bölündü

3. **Tile Üretimi**
   - Raster görüntüler farklı zoom seviyeleri (z8-z16) için tile'lara ayrıldı
   - Her zoom seviyesi için uygun çözünürlükte görüntüler oluşturuldu
   - Tile'lar {z}/{x}/{y} formatında organize edildi

4. **Veri Optimizasyonu**
   - Tile boyutları web performansı için optimize edildi
   - Gereksiz detay seviyelerinden kaçınıldı
   - Veri boyutu ve görsel kalite arasında optimum denge sağlandı

Bu işlem sonucunda elde edilen tile'lar, web uygulamasında Leaflet.js kullanılarak sorunsuz bir şekilde görüntülenmektedir.

## 📱 Uygulama Ekran Görüntüleri

### Giriş Ekranı
![Login ](https://github.com/user-attachments/assets/d3579f53-d273-4304-9502-34c96a6b0644)

### Raster Ekran
![ChatBot](https://github.com/user-attachments/assets/da8f59c9-fb3c-44c8-89ae-d46144100d0e)

### Diğer Harita Ekranları
![Map Interface](https://github.com/user-attachments/assets/7db207b9-fe3f-4410-9fdb-89b6ec19413c)
![Map Interface](https://github.com/user-attachments/assets/acb0231d-6422-4daf-9cdf-9a7296cfba01)

### Veritabanı Görünümü
![VeriTabanı]()
