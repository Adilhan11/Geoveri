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
                        // Tesis tipine göre varsayılan yıldız
                        switch(element.tags.tourism) {
                            case 'resort':
                                stars = 5; // Resort'lar genelde 5 yıldızlı
                                break;
                            case 'apartment':
                                stars = 3; // Apart oteller genelde 3 yıldızlı
                                break;
                            case 'guest_house':
                                stars = 3; // Butik oteller genelde 3 yıldızlı
                                break;
                            default:
                                stars = Math.floor(Math.random() * 3) + 3; // 3-5 arası rastgele
                        }
                    }
                    
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

        // En iyi 100 oteli seç (yıldız sayısına ve konum çeşitliliğine göre)
        const topHotels = Array.from(uniqueHotels.values())
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 100);

        // Veritabanını temizle ve yeni otelleri ekle
        await pool.query('TRUNCATE TABLE hotels RESTART IDENTITY');

        for (const hotel of topHotels) {
            await pool.query(
                'INSERT INTO hotels (name, latitude, longitude, rating, address) VALUES ($1, $2, $3, $4, $5)',
                [hotel.name, hotel.latitude, hotel.longitude, hotel.rating, hotel.address]
            );
        }

        console.log(`${topHotels.length} otel başarıyla eklendi!`);
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await pool.end();
    }
}

fetchHotels(); 