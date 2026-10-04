let map;
let markers = [];
let infoWindow;

// 地図の初期化
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 35.681236, lng: 139.767125 },
    zoom: 5,
    mapTypeId: 'roadmap', // 見慣れたGoogle Maps
    mapTypeControl: false,
    streetViewControl: false
  });
  infoWindow = new google.maps.InfoWindow();

  // 初回表示
  populatePrefectures(facilitiesData);
  renderData(facilitiesData);
}

const listContainer = document.getElementById('listContainer');
const prefFilter = document.getElementById('prefFilter');
const genreFilter = document.getElementById('genreFilter');

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
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  data.forEach((item) => {
    // 1. リスト要素の作成
    const card = document.createElement('div');
    card.className = 'facility-card';
    card.innerHTML = `
      <img src="${item.imageUrl || 'https://picsum.photos/100/100?random=' + Math.random()}" alt="${item.name}" class="facility-card-image">
      <div class="facility-card-content">
        <span class="badge ${
          item.genre === '交通機関' ? 'badge-transport' : 
          item.genre === '駐車場' ? 'badge-parking' : 'badge-leisure'
        }">${item.genre}</span>
        <h3>${item.name}</h3>
        <p>📍 ${item.address}</p>
        <p>💰 ${item.discount}</p>
        <a href="${item.url}" target="_blank">🔗 公式サイトを見る</a>
      </div>
    `;

    // 取得失敗して東京駅に重なっているピンを見えるように少しだけ散らす
    let lat = item.lat;
    let lng = item.lng;
    if (lat === 35.681236 && lng === 139.767125) {
      lat += (Math.random() - 0.5) * 0.1;
      lng += (Math.random() - 0.5) * 0.1;
    }

    // ピンの色をジャンルごとに変える
    let pinIcon = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'; // 観光・レジャー施設は「赤」
    if (item.genre === '交通機関') {
      pinIcon = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'; // 交通機関は「青」
    } else if (item.genre === '駐車場') {
      pinIcon = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'; // 駐車場は「緑」
    }

    // 2. マップにピンを立てる
    const marker = new google.maps.Marker({
      position: { lat: lat, lng: lng },
      map: map,
      title: item.name,
      icon: pinIcon
    });
    
    // ピンのクリックイベント
    marker.addListener('click', () => {
      infoWindow.setContent(`<b>${item.name}</b><br>${item.discount}`);
      infoWindow.open(map, marker);
    });

    markers.push(marker);

    // カードクリックで地図を移動し、ポップアップを開く
    card.addEventListener('click', () => {
      map.setZoom(14);
      map.setCenter(marker.getPosition());
      new google.maps.event.trigger(marker, 'click');
    });

    listContainer.appendChild(card);
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

// 画面読み込み時に地図を初期化
window.onload = initMap;
