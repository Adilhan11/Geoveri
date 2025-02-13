// Antalya'nın merkez koordinatları ve sınırları
const ANTALYA_BOUNDS = {
    minLat: 36.8,
    maxLat: 37.0,
    minLng: 30.6,
    maxLng: 30.9
};

const ANTALYA_CENTER = [
    (ANTALYA_BOUNDS.minLat + ANTALYA_BOUNDS.maxLat) / 2,
    (ANTALYA_BOUNDS.minLng + ANTALYA_BOUNDS.maxLng) / 2
];

// Harita altlıkları
const basemaps = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }),
    "Uydu Görüntüsü": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
    }),
    "Koyu Tema": L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        attribution: '© CartoDB'
    })
};

// Haritayı oluştur
const map = L.map('map', {
    center: ANTALYA_CENTER,
    zoom: 12,
    zoomControl: false,
    layers: [basemaps["OpenStreetMap"]], // Varsayılan altlık
    maxBounds: [
        [ANTALYA_BOUNDS.minLat - 0.1, ANTALYA_BOUNDS.minLng - 0.1],
        [ANTALYA_BOUNDS.maxLat + 0.1, ANTALYA_BOUNDS.maxLng + 0.1]
    ]
});

// Harita kontrollerini sağ üste ekle
L.control.zoom({
    position: 'topright'
}).addTo(map);

// Altlık seçiciyi sağ üste ekle
L.control.layers(basemaps, null, {
    position: 'topright'
}).addTo(map);

// Harita sınırlarına göre görünümü ayarla
map.fitBounds([
    [ANTALYA_BOUNDS.minLat, ANTALYA_BOUNDS.minLng],
    [ANTALYA_BOUNDS.maxLat, ANTALYA_BOUNDS.maxLng]
]);

// Katman grupları
const hotelLayer = L.layerGroup();
const airQualityLayer = L.layerGroup();

// Verileri API'den al ve haritaya ekle
async function loadData() {
    try {
        // Otelleri yükle
        const hotelsResponse = await fetch('/api/hotels');
        const hotels = await hotelsResponse.json();

        // Hava kalitesi verilerini yükle
        const airQualityResponse = await fetch('/api/air-quality');
        const airQualityPoints = await airQualityResponse.json();

        // Otelleri haritaya ekle
        hotels.forEach(hotel => {
            const markerHtml = `<div class="hotel-marker ${hotel.rating === 5 ? 'five-star' : hotel.rating === 4 ? 'four-star' : 'three-star'}">${'⭐'.repeat(hotel.rating)}</div>`;
            const marker = L.marker([hotel.latitude, hotel.longitude], {
                icon: L.divIcon({
                    className: 'hotel-marker-container',
                    html: markerHtml,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                })
            });

            marker.bindPopup(`
                <div class="hotel-popup">
                    <b>${hotel.name}</b>
                    <p class="rating">${'⭐'.repeat(hotel.rating)}</p>
                    <p class="address">${hotel.address}</p>
                </div>
            `);

            hotelLayer.addLayer(marker);
        });

        // Hava kalitesi noktalarını haritaya ekle
        airQualityPoints.forEach(point => {
            const circle = L.circle([point.latitude, point.longitude], {
                color: point.color,
                fillColor: point.color,
                fillOpacity: 0.6,
                radius: 250,
                weight: 1
            });

            circle.bindPopup(`
                <div class="air-quality-popup">
                    <b>Hava Kalitesi</b>
                    <p>Seviye: ${point.pollution_level}</p>
                    <p>Durum: ${getAirQualityText(point.pollution_level)}</p>
                </div>
            `);

            airQualityLayer.addLayer(circle);
        });
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        showNotification('Veriler yüklenirken bir hata oluştu!');
    }
}

// Sayfa yüklendiğinde verileri yükle
loadData();

// Katman kontrol butonları
document.getElementById('showHotels').addEventListener('click', function() {
    this.classList.toggle('active');
    if (map.hasLayer(hotelLayer)) {
        map.removeLayer(hotelLayer);
    } else {
        map.addLayer(hotelLayer);
    }
});

document.getElementById('showAirQuality').addEventListener('click', function() {
    this.classList.toggle('active');
    if (map.hasLayer(airQualityLayer)) {
        map.removeLayer(airQualityLayer);
    } else {
        map.addLayer(airQualityLayer);
    }
});

// Tıklanan konumu takip etmek için değişken
let selectedLocation = null;
let locationMarker = null;
let selectedHotelMarker = null;

// Harita tıklama olayını dinle
map.on('click', function(e) {
    if (locationMarker) {
        map.removeLayer(locationMarker);
    }
    selectedLocation = [e.latlng.lat, e.latlng.lng];
    locationMarker = L.marker(selectedLocation).addTo(map);
});

// En uygun oteli bulan fonksiyon
async function findBestHotel(currentLocation, radius) {
    try {
        const response = await fetch(`/api/best-hotel?lat=${currentLocation[0]}&lng=${currentLocation[1]}&radius=${radius}`);
        return await response.json();
    } catch (error) {
        console.error('En iyi otel arama hatası:', error);
        showNotification('Otel aranırken bir hata oluştu!');
        return null;
    }
}

// En uygun oteli bulma butonu olayı
document.getElementById('findBestHotel').addEventListener('click', async function() {
    if (!selectedLocation) {
        showNotification('Lütfen haritada bir konum seçin!');
        return;
    }

    if (!map.hasLayer(hotelLayer)) {
        showNotification('Önce otelleri görüntülemelisiniz!');
        return;
    }

    const radius = parseFloat(document.getElementById('radius').value);
    const bestHotel = await findBestHotel(selectedLocation, radius);

    if (bestHotel) {
        if (selectedHotelMarker) {
            map.removeLayer(selectedHotelMarker);
        }

        selectedHotelMarker = L.marker([bestHotel.latitude, bestHotel.longitude], {
            icon: L.divIcon({
                className: 'best-hotel-marker',
                html: '🏆',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map);

        selectedHotelMarker.bindPopup(`
            <div class="hotel-popup">
                <b>${bestHotel.name}</b>
                <p class="rating">${'⭐'.repeat(bestHotel.rating)}</p>
                <p class="address">${bestHotel.address}</p>
                <p class="best-choice">✨ En İyi Seçim ✨</p>
            </div>
        `).openPopup();

        map.setView([bestHotel.latitude, bestHotel.longitude], 14);
    } else {
        showNotification(`Seçilen konumun ${radius} km çevresinde uygun otel bulunamadı.`);
    }
});

// Yardımcı fonksiyonlar
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function getAirQualityText(level) {
    if (level <= 100) return 'İyi';
    if (level <= 200) return 'Orta';
    return 'Kötü';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }, 100);
} 