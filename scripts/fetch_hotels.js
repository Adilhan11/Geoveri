const fetch = require('node-fetch');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'antalya_air_quality',
    password: '063242',
    port: 5432,
});

// Antalya sınırları
const ANTALYA_BOUNDS = {
    minLat: 36.8,
    maxLat: 37.0,
    minLng: 30.6,
    maxLng: 30.9
};

async function fetchHotels() {
    try {
        // Genişletilmiş Overpass API sorgusu
        const query = `
        [out:json][timeout:50];
        area["name"="Antalya"]["admin_level"="4"]->.searchArea;
        (
          // Oteller
          way["tourism"="hotel"](area.searchArea);
          node["tourism"="hotel"](area.searchArea);
          way["building"="hotel"](area.searchArea);
          node["building"="hotel"](area.searchArea);
          
          // Resort ve tatil köyleri
          way["tourism"="resort"](area.searchArea);
          node["tourism"="resort"](area.searchArea);
          
          // Apart oteller
          way["tourism"="apartment"](area.searchArea);
          node["tourism"="apartment"](area.searchArea);
          
          // Butik oteller
          way["tourism"="guest_house"](area.searchArea);
          node["tourism"="guest_house"](area.searchArea);
        );
        out body;
        >;
        out skel qt;`;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });

        const data = await response.json();
        
        // Otel verilerini işle
        const hotels = [];
        const nodes = new Map();
        
        // Önce tüm node'ları maple
        data.elements.forEach(element => {
            if (element.type === 'node') {
                nodes.set(element.id, element);
            }
        });

        // Otelleri işle
        data.elements.forEach(element => {
            if (element.tags && (
                element.tags.tourism === 'hotel' || 
                element.tags.building === 'hotel' ||
                element.tags.tourism === 'resort' ||
                element.tags.tourism === 'apartment' ||
                element.tags.tourism === 'guest_house'
            )) {
                let lat, lon;
                
                if (element.type === 'node') {
                    lat = element.lat;
                    lon = element.lon;
                } else if (element.type === 'way' && element.nodes && element.nodes.length > 0) {
                    // Way için merkez noktayı hesapla
                    const centerNode = nodes.get(element.nodes[0]);
                    if (centerNode) {
                        lat = centerNode.lat;
                        lon = centerNode.lon;
                    }
                }

                // Koordinatlar sınırlar içindeyse ekle
                if (lat && lon &&
                    lat >= ANTALYA_BOUNDS.minLat && lat <= ANTALYA_BOUNDS.maxLat &&
                    lon >= ANTALYA_BOUNDS.minLng && lon <= ANTALYA_BOUNDS.maxLng) {
                    
                    const name = element.tags.name || element.tags['name:en'] || 'Unnamed Hotel';
                    
                    // Yıldız sayısını belirle
                    let stars;
                    if (element.tags.stars) {
                        stars = parseInt(element.tags.stars);
                    } else {
                        // Tesis tipine ve diğer özelliklere göre yıldız belirle
                        if (element.tags.tourism === 'resort' || 
                            element.tags.name?.toLowerCase().includes('resort') ||
                            element.tags.name?.toLowerCase().includes('deluxe') ||
                            element.tags.name?.toLowerCase().includes('premium') ||
                            element.tags.name?.toLowerCase().includes('luxury')) {
                            stars = Math.random() < 0.7 ? 5 : 4; // %70 ihtimalle 5 yıldız
                        } else if (element.tags.tourism === 'hotel' || 
                                   element.tags.building === 'hotel') {
                            // Normal oteller için dengeli dağılım
                            const rand = Math.random();
                            if (rand < 0.2) stars = 5;      // %20 ihtimalle 5 yıldız
                            else if (rand < 0.5) stars = 4;  // %30 ihtimalle 4 yıldız
                            else if (rand < 0.8) stars = 3;  // %30 ihtimalle 3 yıldız
                            else stars = 2;                  // %20 ihtimalle 2 yıldız
                        } else if (element.tags.tourism === 'apartment' ||
                                   element.tags.name?.toLowerCase().includes('apart')) {
                            stars = Math.random() < 0.7 ? 3 : 2; // %70 ihtimalle 3 yıldız
                        } else if (element.tags.tourism === 'guest_house' ||
                                   element.tags.tourism === 'hostel' ||
                                   element.tags.name?.toLowerCase().includes('pension') ||
                                   element.tags.name?.toLowerCase().includes('pansiyon')) {
                            stars = Math.random() < 0.3 ? 3 : 2; // %30 ihtimalle 3 yıldız
                        } else {
                            // Diğer durumlar için varsayılan dağılım
                            const rand = Math.random();
                            if (rand < 0.1) stars = 5;      // %10 ihtimalle 5 yıldız
                            else if (rand < 0.3) stars = 4;  // %20 ihtimalle 4 yıldız
                            else if (rand < 0.7) stars = 3;  // %40 ihtimalle 3 yıldız
                            else stars = 2;                  // %30 ihtimalle 2 yıldız
                        }
                    }
                    
                    // Yıldız sayısını 2-5 arasında sınırla
                    stars = Math.max(2, Math.min(5, stars));
                    
                    // Adres bilgisini birleştir
                    let address = element.tags['addr:street'];
                    if (element.tags['addr:housenumber']) {
                        address = `${address} No:${element.tags['addr:housenumber']}`;
                    }
                    if (!address) {
                        address = element.tags.address || 'Antalya';
                    }
                    
                    hotels.push({
                        name: name,
                        latitude: lat,
                        longitude: lon,
                        rating: stars,
                        address: address
                    });
                }
            }
        });

        // Benzersiz otelleri seç (aynı koordinatlardaki tekrarları kaldır)
        const uniqueHotels = hotels.reduce((acc, current) => {
            const key = `${current.latitude},${current.longitude}`;
            if (!acc.has(key)) {
                acc.set(key, current);
            }
            return acc;
        }, new Map());

        // Otelleri yıldız sayılarına göre grupla
        const hotelsByRating = Array.from(uniqueHotels.values()).reduce((acc, hotel) => {
            if (!acc[hotel.rating]) {
                acc[hotel.rating] = [];
            }
            acc[hotel.rating].push(hotel);
            return acc;
        }, {});

        // Her yıldız seviyesinden dengeli sayıda otel seç
        const targetCounts = {
            5: 20, // 5 yıldızlı oteller için hedef sayı
            4: 30, // 4 yıldızlı oteller için hedef sayı
            3: 30, // 3 yıldızlı oteller için hedef sayı
            2: 20  // 2 yıldızlı oteller için hedef sayı
        };

        const selectedHotels = [];
        Object.entries(targetCounts).forEach(([rating, targetCount]) => {
            const hotelsOfRating = hotelsByRating[rating] || [];
            // Her kategoriden rastgele otel seç
            const shuffled = hotelsOfRating.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, targetCount);
            selectedHotels.push(...selected);
        });

        // Eğer 100 otele ulaşamadıysak, eksik kalan kısmı diğer otellerden rastgele seç
        if (selectedHotels.length < 100) {
            const remaining = Array.from(uniqueHotels.values())
                .filter(hotel => !selectedHotels.includes(hotel))
                .sort(() => 0.5 - Math.random())
                .slice(0, 100 - selectedHotels.length);
            selectedHotels.push(...remaining);
        }

        // Veritabanını temizle ve yeni otelleri ekle
        await pool.query('TRUNCATE TABLE hotels RESTART IDENTITY');

        // Otelleri ekle (geometri sütunu trigger ile otomatik doldurulacak)
        for (const hotel of selectedHotels) {
            await pool.query(
                'INSERT INTO hotels (name, latitude, longitude, rating, address) VALUES ($1, $2, $3, $4, $5)',
                [hotel.name, hotel.latitude, hotel.longitude, hotel.rating, hotel.address]
            );
        }

        console.log(`${selectedHotels.length} otel başarıyla eklendi!`);

        // Hava kalitesi noktalarını ekle
        await pool.query('TRUNCATE TABLE air_quality_points RESTART IDENTITY');

        // Her bölge için 200 rastgele nokta oluştur
        for (let i = 0; i < 200; i++) {
            const lat = ANTALYA_BOUNDS.minLat + (Math.random() * (ANTALYA_BOUNDS.maxLat - ANTALYA_BOUNDS.minLat));
            const lng = ANTALYA_BOUNDS.minLng + (Math.random() * (ANTALYA_BOUNDS.maxLng - ANTALYA_BOUNDS.minLng));
            const pollutionLevel = Math.floor(Math.random() * 300);
            
            // Kirlilik seviyesine göre renk belirle
            let color;
            if (pollutionLevel <= 100) {
                color = '#90EE90';  // İyi - Açık yeşil
            } else if (pollutionLevel <= 200) {
                color = '#FFB6C1';  // Orta - Açık pembe
            } else {
                color = '#DDA0DD';  // Kötü - Açık mor
            }

            await pool.query(
                'INSERT INTO air_quality_points (latitude, longitude, pollution_level, color) VALUES ($1, $2, $3, $4)',
                [lat, lng, pollutionLevel, color]
            );
        }

        console.log('200 hava kalitesi noktası başarıyla eklendi!');

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await pool.end();
    }
}
fetchHotels(); 