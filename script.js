const BACKEND_URL = "https://leaflet-be.vercel.app"; 
// nanti diganti setelah deploy backend

const map = L.map('map').setView([-6.9, 107.6], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let selected = null;
let tempMarker = null;

map.on('click', (e) => {
  selected = e.latlng;
  document.getElementById("coord").value =
    `${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)}`;

  if (tempMarker) map.removeLayer(tempMarker);
  tempMarker = L.marker(selected).addTo(map);
});

async function loadCafes() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/cafes`);
    const data = await res.json();

    data.forEach(cafe => {
      L.marker([cafe.latitude, cafe.longitude])
      .addTo(map)
      .bindPopup(
        `<b>${cafe.name}</b><br>
         Rating: ${cafe.rating ?? '-'} <br>
         ${cafe.description ?? ''}`
      );
    });
  } catch {
    alert("Gagal memuat data cafe dari backend");
  }
}

loadCafes();

document.getElementById("form-cafe").addEventListener("submit", async e => {
  e.preventDefault();

  if (!selected) {
    alert("Klik dulu titik di peta");
    return;
  }

  const payload = {
    name: document.getElementById("nama").value,
    rating: Number(document.getElementById("rating").value),
    description: document.getElementById("deskripsi").value,
    latitude: selected.lat,
    longitude: selected.lng
  };

  const res = await fetch(`${BACKEND_URL}/api/cafes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (res.ok) {
    L.marker([data.latitude, data.longitude])
      .addTo(map)
      .bindPopup(`<b>${data.name}</b><br>Rating: ${data.rating}<br>${data.description}`);

    e.target.reset();
    document.getElementById("coord").value = "";
    selected = null;
    if (tempMarker) map.removeLayer(tempMarker);
  } else {
    alert("Gagal menyimpan cafe");
  }
});
