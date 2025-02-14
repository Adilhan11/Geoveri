const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'antalya_air_quality',
    password: '063242',  // Kurulum sırasında belirlediğiniz şifreyi buraya yazın
    port: 5432,
});

// Antalya'nın sınırları
const ANTALYA_BOUNDS = {
    minLat: 36.8,
    maxLat: 37.0,
    minLng: 30.6,
    maxLng: 30.9
};

// Rastgele koordinat üreten fonksiyon
function generateRandomCoordinate() {
    const lat = ANTALYA_BOUNDS.minLat + (Math.random() * (ANTALYA_BOUNDS.maxLat - ANTALYA_BOUNDS.minLat));
    const lng = ANTALYA_BOUNDS.minLng + (Math.random() * (ANTALYA_BOUNDS.maxLng - ANTALYA_BOUNDS.minLng));
    return [lat, lng];
}

// Gerçek otel verileri
const hotels = [
    { name: "Rixos Downtown Antalya", rating: 5, address: "Sakıp Sabancı Bulvarı, Muratpaşa" },
    { name: "Akra Hotel", rating: 5, address: "Lara Caddesi, Muratpaşa" },
    { name: "Crowne Plaza Antalya", rating: 5, address: "Gürsu Mahallesi, Konyaaltı" },
    { name: "Porto Bello Hotel Resort & Spa", rating: 5, address: "Lara Turizm Merkezi" },
    { name: "Ramada Plaza by Wyndham Antalya", rating: 5, address: "Gençlik Mahallesi, Muratpaşa" },
    { name: "Delphin Imperial Hotel", rating: 5, address: "Lara Turizm Merkezi" },
    { name: "Royal Wings Hotel", rating: 5, address: "Lara Turizm Merkezi" },
    { name: "Royal Holiday Palace", rating: 5, address: "Lara Turizm Merkezi" },
    { name: "Limak Lara De Luxe Hotel", rating: 5, address: "Lara Turizm Merkezi" },
    { name: "IC Hotels Green Palace", rating: 5, address: "Kundu Turizm Merkezi" },
    { name: "Titanic Beach Lara", rating: 5, address: "Lara Turizm Merkezi" },
    { name: "Barut Lara Resort & Spa", rating: 5, address: "Lara Turizm Merkezi" },
    { name: "Royal Seginus Hotel", rating: 5, address: "Lara Turizm Merkezi" },
    { name: "Sherwood Exclusive Lara", rating: 5, address: "Lara Turizm Merkezi" },
    { name: "Concorde De Luxe Resort", rating: 5, address: "Lara Turizm Merkezi" },
    { name: "Hotel Su & Aqualand", rating: 5, address: "Konyaaltı Sahili" },
    { name: "The Marmara Antalya", rating: 5, address: "Sirinyali Mahallesi" },
    { name: "Sealife Family Resort Hotel", rating: 4, address: "Konyaaltı Sahili" },
    { name: "Özkaymak Falez Hotel", rating: 4, address: "Fener Mahallesi" },
    { name: "Antalya Hotel Resort & Spa", rating: 4, address: "Lara Caddesi" },
    { name: "Divan Antalya", rating: 4, address: "Atatürk Caddesi, Muratpaşa" },
    { name: "Best Western Plus Khan Hotel", rating: 4, address: "Kazım Özalp Caddesi" },
    { name: "Holiday Inn Antalya Lara", rating: 4, address: "Lara Turizm Merkezi" },
    { name: "Harrington Park Resort", rating: 4, address: "Lara Turizm Merkezi" },
    { name: "Club Hotel Falcon", rating: 4, address: "Lara Caddesi" },
    { name: "Lara World Hotel", rating: 4, address: "Lara Turizm Merkezi" },
    { name: "Antalya Özkavak Hotel", rating: 4, address: "Muratpaşa" },
    { name: "Lara Diamond Hotel", rating: 4, address: "Lara Turizm Merkezi" },
    { name: "Kervansaray Lara Hotel", rating: 4, address: "Lara Turizm Merkezi" },
    { name: "Lara Hadrianus Hotel", rating: 4, address: "Lara Turizm Merkezi" },
    { name: "Lara Beach Otel", rating: 4, address: "Lara Turizm Merkezi" },
    { name: "Konyaaltı Hera Hotel", rating: 3, address: "Konyaaltı Sahili" },
    { name: "Ersoy Aga Otel", rating: 3, address: "Muratpaşa" },
    { name: "Kaleiçi Marina Boutique Hotel", rating: 3, address: "Kaleiçi" },
    { name: "Argos Hotel", rating: 3, address: "Kaleiçi" },
    { name: "White Garden Hotel", rating: 3, address: "Kaleiçi" },
    { name: "Mediterra Art Hotel", rating: 3, address: "Kaleiçi" },
    { name: "Delight Deluxe Boutique Hotel", rating: 3, address: "Kaleiçi" },
    { name: "Tuvana Hotel", rating: 3, address: "Kaleiçi" },
    { name: "Alp Paşa Hotel", rating: 3, address: "Kaleiçi" },
    { name: "Kaleici Lodge Hotel", rating: 3, address: "Kaleiçi" },
    { name: "Patron Hotel", rating: 3, address: "Muratpaşa" },
    { name: "Urcu Hotel", rating: 3, address: "Muratpaşa" },
    { name: "Antroyal Hotel", rating: 3, address: "Muratpaşa" },
    { name: "Karyatit Otel", rating: 3, address: "Kaleiçi" },
    { name: "Mavi Deniz Otel", rating: 3, address: "Konyaaltı" },
    { name: "Atalla Hotel", rating: 3, address: "Kaleiçi" },
    { name: "Bacchus Pension", rating: 3, address: "Kaleiçi" },
    { name: "Kaleici Inn Hotel", rating: 3, address: "Kaleiçi" },
    { name: "Oscar Boutique Hotel", rating: 3, address: "Kaleiçi" },
    { name: "Aspen Hotel", rating: 3, address: "Kaleiçi" }
];

// Her otele koordinat ata (sınırlar içinde)
hotels.forEach(hotel => {
    // Bölgeye göre koordinat aralığı belirle
    let lat, lng;
    
    if (hotel.address.includes("Lara")) {
        // Lara bölgesi
        lat = 36.85 + (Math.random() * 0.05);
        lng = 30.85 + (Math.random() * 0.05);
    } else if (hotel.address.includes("Konyaaltı")) {
        // Konyaaltı bölgesi
        lat = 36.85 + (Math.random() * 0.05);
        lng = 30.65 + (Math.random() * 0.05);
    } else if (hotel.address.includes("Kaleiçi")) {
        // Kaleiçi bölgesi
        lat = 36.88 + (Math.random() * 0.02);
        lng = 30.70 + (Math.random() * 0.02);
    } else {
        // Diğer bölgeler (Muratpaşa, merkez)
        lat = 36.85 + (Math.random() * 0.1);
        lng = 30.70 + (Math.random() * 0.1);
    }
    
    
    hotel.latitude = lat;
    hotel.longitude = lng;
});

// Hava kalitesi renk skalası
function getColorForPollutionLevel(level) {
    if (level <= 100) return '#90EE90';  // İyi - Açık yeşil
    if (level <= 200) return '#FFB6C1';  // Orta - Açık pembe
    return '#DDA0DD';                    // Kötü - Açık mor
}

async function generateData() {
    try {
        // Önce mevcut verileri temizle
        await pool.query('TRUNCATE TABLE hotels, air_quality_points RESTART IDENTITY');

        // Otelleri ekle
        for (const hotel of hotels) {
            await pool.query(
                'INSERT INTO hotels (name, latitude, longitude, rating, address) VALUES ($1, $2, $3, $4, $5)',
                [hotel.name, hotel.latitude, hotel.longitude, hotel.rating, hotel.address]
            );
        }

        // Hava kalitesi noktalarını ekle (200 nokta)
        for (let i = 0; i < 200; i++) {
            const [lat, lng] = generateRandomCoordinate();
            const pollutionLevel = Math.floor(Math.random() * 300);
            const color = getColorForPollutionLevel(pollutionLevel);

            await pool.query(
                'INSERT INTO air_quality_points (latitude, longitude, pollution_level, color) VALUES ($1, $2, $3, $4)',
                [lat, lng, pollutionLevel, color]
            );
        }

        console.log('Veriler başarıyla oluşturuldu!');
    } catch (err) {
        console.error('Veri oluşturma hatası:', err);
    } finally {
        await pool.end();
    }
}

generateData(); 