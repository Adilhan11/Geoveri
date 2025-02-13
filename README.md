# Antalya Hava Kalitesi ve Otel Haritası

Bu proje, Antalya'daki hava kirliliği seviyelerini harita üzerinde görselleştiren ve kullanıcılara bulundukları konuma göre en uygun oteli öneren bir web uygulamasıdır.

## Özellikler

- Antalya'daki hava kirliliği seviyelerini harita üzerinde renkli noktalarla gösterir
- Şehirdeki otellerin konumlarını harita üzerinde işaretler
- Kullanıcının seçtiği konuma ve yarıçapa göre en uygun oteli bulur
- Hava kalitesi ve mesafe faktörlerini göz önünde bulundurarak otel önerir

## Teknolojiler

- Frontend: HTML, CSS, JavaScript, Leaflet.js
- Backend: Node.js, Express.js
- Veritabanı: PostgreSQL

## Kurulum

1. PostgreSQL'i yükleyin ve çalıştırın

2. Veritabanını oluşturun:
```bash
psql -U postgres -f database/schema.sql
```

3. Gerekli Node.js paketlerini yükleyin:
```bash
npm install
```

4. Veritabanı bağlantı bilgilerini güncelleyin:
   - `server.js` ve `generate_data.js` dosyalarındaki PostgreSQL bağlantı bilgilerini kendi sisteminize göre düzenleyin.

5. Örnek verileri oluşturun:
```bash
node generate_data.js
```

6. Uygulamayı başlatın:
```bash
npm start
```

7. Tarayıcınızda `http://localhost:3000` adresine gidin

## Kullanım

1. Harita üzerinde istediğiniz bir konumu tıklayın
2. Arama yarıçapını ayarlayın (0.5 km - 10 km arası)
3. "En Uygun Oteli Bul" butonuna tıklayın
4. Sistem, seçilen konum çevresindeki en uygun oteli bulup gösterecektir

## Hava Kalitesi Seviyeleri

- 🟢 İyi (0-50)
- 🟡 Orta (51-100)
- 🟠 Hassas (101-150)
- 🔴 Sağlıksız (151-200)
- 🟣 Çok Sağlıksız (201+)
