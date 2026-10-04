// 地図の初期化（東京を中心にする）
const map = L.map('map').setView([35.681236, 139.767125], 5);

// Google Mapsのタイルを使用（見慣れたデザイン）
L.tileLayer('https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
  attribution: '&copy; <a href="https://developers.google.com/maps/documentation">Google Maps</a>'
}).addTo(map);

const listContainer = document.getElementById('listContainer');
const prefFilter = document.getElementById('prefFilter');
const genreFilter = document.getElementById('genreFilter');

let markers = [];

// データから都道府県のプルダウンを自動作成する関数
function populatePrefectures(data) {
  const prefs = [...new Set(data.map(item => item.pref))].filter(Boolean);
  prefFilter.innerHTML = '<option value="all">すべて</option>';
  prefs.forEach(pref => {
    const option = document.createElement('option');
    option.value = pref;
    option.textContent = pref;
    prefFilter.appendChild(option);
  });
}

// データを画面に表示する関数
function renderData(data) {
  // リストをクリア
  listContainer.innerHTML = '';
  
  // マップのピンをクリア
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  data.forEach((item) => {
    // 1. リスト要素の作成
    const card = document.createElement('div');
    card.className = 'facility-card';
    card.innerHTML = `
      <img src="${item.imageUrl || 'https://picsum.photos/100/100?random=' + Math.random()}" alt="${item.name}" class="facility-card-image">
      <div class="facility-card-content">
        <span class="badge">${item.genre}</span>
        <h3>${item.name}</h3>
        <p>📍 ${item.address}</p>
        <p>💰 ${item.discount}</p>
        <a href="${item.url}" target="_blank">🔗 公式サイトを見る</a>
      </div>
    `;

    // カードクリックで地図を移動
    card.addEventListener('click', () => {
      map.setView([item.lat, item.lng], 14);
      marker.openPopup();
    });

    listContainer.appendChild(card);

    // 取得失敗して東京駅に重なっているピンを見えるように少しだけ散らす
    let lat = item.lat;
    let lng = item.lng;
    if (lat === 35.681236 && lng === 139.767125) {
      lat += (Math.random() - 0.5) * 0.1;
      lng += (Math.random() - 0.5) * 0.1;
    }

    // 2. マップにピンを立てる
    const marker = L.marker([lat, lng]).addTo(map)
      .bindPopup(`<b>${item.name}</b><br>${item.discount}`);
    markers.push(marker);
  });
}

// 絞り込み機能
function filterData() {
  const pref = prefFilter.value;
  const genre = genreFilter.value;

  const filtered = facilitiesData.filter(item => {
    const matchPref = (pref === 'all') || (item.pref === pref);
    const matchGenre = (genre === 'all') || (item.genre === genre);
    return matchPref && matchGenre;
  });

  renderData(filtered);
}

// イベントリスナーの登録
prefFilter.addEventListener('change', filterData);
genreFilter.addEventListener('change', filterData);

// 初回表示
populatePrefectures(facilitiesData);
renderData(facilitiesData);
