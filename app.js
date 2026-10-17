let map;
let markers = [];
let infoWindow;

// 地図の初期化
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 35.681236, lng: 139.767125 }, // 東京駅を起点
    zoom: 11, // 関東・都内周辺がほどよく見渡せる快適な縮尺
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
const keywordFilter = document.getElementById('keywordFilter');
const facilityCount = document.getElementById('facilityCount');
const currentLocationBtn = document.getElementById('currentLocationBtn');

// JIS規格 全国47都道府県コード順リスト（01北海道〜47沖縄県）
const PREFECTURE_ORDER = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// データから都道府県のプルダウンをJIS都道府県コード順に作成する関数
function populatePrefectures(data) {
  const existingPrefs = new Set(data.map(item => item.pref).filter(Boolean));
  // 登録データに存在する都道府県をJISコード順（北から南）で整列
  const prefs = PREFECTURE_ORDER.filter(pref => existingPrefs.has(pref));

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
  // 件数バッジの更新
  if (facilityCount) {
    facilityCount.textContent = `${data.length.toLocaleString()}件`;
  }

  // リストをクリア
  listContainer.innerHTML = '';
  
  // マップのピンをクリア
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  if (data.length === 0) {
    listContainer.innerHTML = '<p style="padding: 1.5rem; text-align: center; color: var(--text-sub); font-size: 0.9rem;">該当する施設が見つかりませんでした。<br>検索条件を変えてお試しください。</p>';
    return;
  }

  data.forEach((item) => {
    // 1. リスト要素の作成
    const card = document.createElement('div');
    card.className = 'facility-card';
    const disclaimer = (item.genre === '交通機関' || item.genre === '駐車場') 
      ? '<span style="font-size:0.8em; color:#ef4444; display:block; margin-top:4px;">※実際の運行・利用時間とは異なる場合があります</span>' 
      : '';

    card.innerHTML = `
      <div class="facility-card-content">
        <span class="badge ${
          item.genre === '交通機関' ? 'badge-transport' : 
          item.genre === '駐車場' ? 'badge-parking' : 'badge-leisure'
        }">${item.genre}</span>
        <h3>${item.name}</h3>
        <p>📍 ${item.address}</p>
        <p>⏰ <strong>営業時間:</strong><br><span style="font-size:0.85em; color:var(--text-sub); display:inline-block; margin-top:2px;">${item.hours || '情報なし'}</span>${disclaimer}</p>
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
      infoWindow.setContent(`<div style="max-height: 200px; overflow-y: auto;"><b>${item.name}</b><br><br>⏰ <b>営業時間:</b><br><span style="font-size:0.9em;">${item.hours || '情報なし'}</span>${disclaimer}<br><br>💰 ${item.discount}<br><br><a href="${item.url}" target="_blank">🔗 公式サイトを見る</a></div>`);
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
  const keyword = keywordFilter.value.toLowerCase().trim();

  const filtered = facilitiesData.filter(item => {
    const matchPref = (pref === 'all') || (item.pref === pref);
    const matchGenre = (genre === 'all') || (item.genre === genre);
    
    // 施設名または住所にキーワードが含まれるか（大文字小文字区別なし）
    const matchKeyword = !keyword || (item.name.toLowerCase().includes(keyword) || item.address.toLowerCase().includes(keyword));
    
    return matchPref && matchGenre && matchKeyword;
  });

  renderData(filtered);

  // 地図の自動連動（都道府県・検索ワードに応じた自動ジャンプ & 最適ズーム）
  if (filtered.length > 0) {
    if (pref !== 'all' || keyword.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filtered.forEach(item => {
        bounds.extend(new google.maps.LatLng(item.lat, item.lng));
      });
      map.fitBounds(bounds);

      // ピンが1件など狭い範囲で過剰にズームアップしすぎないよう上限(14)を設ける
      const zoomListener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 14) {
          map.setZoom(14);
        }
        google.maps.event.removeListener(zoomListener);
      });
    } else if (pref === 'all' && !keyword) {
      // 「すべて」に戻した場合は初期の東京駅周辺(zoom 11)へスムーズに戻る
      map.panTo({ lat: 35.681236, lng: 139.767125 });
      map.setZoom(11);
    }
  }
}

// イベントリスナーの登録
prefFilter.addEventListener('change', filterData);
genreFilter.addEventListener('change', filterData);
keywordFilter.addEventListener('input', filterData);

// 現在地表示ボタンの処理
if (currentLocationBtn) {
  currentLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('お使いのブラウザは現在地取得に対応していません。');
      return;
    }
    
    currentLocationBtn.textContent = '⏳ 取得中...';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        map.setCenter({ lat: userLat, lng: userLng });
        map.setZoom(13); // 周辺がよく見える縮尺
        currentLocationBtn.textContent = '🎯 現在地を表示';
      },
      (error) => {
        console.warn('Geolocation error:', error);
        alert('現在地を取得できませんでした。ブラウザの位置情報許可をご確認ください。');
        currentLocationBtn.textContent = '🎯 現在地を表示';
      },
      { timeout: 8000 }
    );
  });
}

// Cookie同意バナーの制御
function initCookieConsent() {
  const cookieBanner = document.getElementById('cookieBanner');
  const acceptCookieBtn = document.getElementById('acceptCookieBtn');
  const CONSENT_KEY = 'deaf_map_cookie_consent_accepted';

  if (!cookieBanner || !acceptCookieBtn) return;

  // すでに同意済みでない場合のみ表示
  if (!localStorage.getItem(CONSENT_KEY)) {
    cookieBanner.style.display = 'block';
  }

  acceptCookieBtn.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    cookieBanner.style.display = 'none';
  });
}

// 画面読み込み時に初期化
window.onload = () => {
  initMap();
  initCookieConsent();
};
