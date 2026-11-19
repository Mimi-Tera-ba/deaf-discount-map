/**
 * ミミノバ公式（miminoba.jp）完全クローン 共通ヘッダー＆フッター 自動生成スクリプト
 * 本体サイト（WordPress x-t9テーマ）のフォント・配色・画像仕様を100%忠実に再現します。
 */

(function () {
  'use strict';

  // 1. 公式ナビゲーション項目（本体メニューと完全一致）
  const OFFICIAL_NAV_ITEMS = [
    { label: 'HOME', url: 'https://miminoba.jp/' },
    { label: 'ミミノバとは', url: 'https://miminoba.jp/about' },
    { label: 'ブログ', url: 'https://miminoba.jp/blog' },
    { label: 'お問い合わせ', url: 'https://miminoba.jp/contact' },
    { label: 'プライバシーポリシー', url: 'https://miminoba.jp/privacy-policy' }
  ];

  // 2. ミミノバ Webツール・ポータル連携（読者の回遊用サブナビ）
  const WEB_TOOLS = [
    { label: '耳のトリセツ作成', url: 'https://miminoba.jp/manual/' },
    { label: '手帳・障害者割引マップ', url: 'https://miminoba.jp/map/' },
    { label: '全国サインストアマップ', url: 'https://miminoba.jp/sign-map/' },
    { label: '補聴器・人工内耳助成金ナビ', url: 'https://miminoba.jp/subsidy/' },
    { label: '仕事・就労サポート', url: 'https://miminoba.jp/home/work' },
    { label: '子ども・家族サポート', url: 'https://miminoba.jp/kids' }
  ];

  // 3. ヘッダーHTMLの生成
  function createHeaderHTML() {
    const pcNavItemsHTML = OFFICIAL_NAV_ITEMS.map(item => `
      <li>
        <a href="${item.url}" class="mmnb-pc-nav-link">${item.label}</a>
      </li>
    `).join('');

    const mobileNavItemsHTML = OFFICIAL_NAV_ITEMS.map(item => `
      <li>
        <a href="${item.url}">${item.label}</a>
      </li>
    `).join('');

    return `
      <header class="mmnb-official-header" id="mmnbOfficialHeader">
        <div class="mmnb-official-header-inner">
          <!-- 左側：公式ロゴ ＋ タイトル ＋ タグライン（本体完全準拠） -->
          <a href="https://miminoba.jp/" class="mmnb-site-branding" title="ミミノバ -miminoba-">
            <img src="https://miminoba.jp/wp-content/uploads/2023/12/cropped-image.jpg" 
                 alt="ミミノバ -miminoba-" 
                 class="mmnb-site-logo-img" 
                 width="60" height="60"
                 decoding="async"
                 onerror="this.onerror=null; this.src='https://miminoba.jp/wp-content/uploads/2023/12/image.png';">
            <div class="mmnb-site-title-box">
              <h1 class="mmnb-site-title">ミミノバ　-miminoba-</h1>
              <p class="mmnb-site-tagline">聞こえない、聞こえにくい人のためのライフスタイルメディア</p>
            </div>
          </a>

          <!-- 右側：PC用公式メニュー（5項目） -->
          <nav aria-label="メインナビゲーション">
            <ul class="mmnb-pc-nav">
              ${pcNavItemsHTML}
            </ul>
          </nav>

          <!-- スマホ用ハンバーガー開閉ボタン -->
          <button type="button" class="mmnb-mobile-toggle" id="mmnbMobileToggle" aria-label="メニューを開閉する" aria-expanded="false">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 7.5h16v2H4z"></path>
              <path d="M4 14.5h16v2H4z"></path>
            </svg>
          </button>
        </div>

        <!-- スマホ用ドロップダウンメニュー -->
        <div class="mmnb-mobile-dropdown" id="mmnbMobileDropdown">
          <ul class="mmnb-mobile-dropdown-list">
            ${mobileNavItemsHTML}
          </ul>
        </div>
      </header>
    `;
  }

  // 4. フッターHTMLの生成
  function createFooterHTML() {
    const footerNavItemsHTML = OFFICIAL_NAV_ITEMS.map(item => `
      <li>
        <a href="${item.url}">${item.label}</a>
      </li>
    `).join('');

    const webToolLinksHTML = WEB_TOOLS.map(item => `
      <a href="${item.url}" class="mmnb-tool-btn">
        ${item.label}
      </a>
    `).join('');

    return `
      <footer class="mmnb-official-footer" id="mmnbOfficialFooter">
        <div class="mmnb-official-footer-inner">
          <!-- 中央：公式ロゴ画像（image.png: 幅181px） -->
          <div class="mmnb-footer-center-logo">
            <a href="https://miminoba.jp/" title="ミミノバ">
              <img src="https://miminoba.jp/wp-content/uploads/2023/12/image.png" 
                   alt="ミミノバ" 
                   width="181" height="auto"
                   loading="lazy"
                   decoding="async">
            </a>
          </div>

          <!-- 中段：SNS（左） ＆ 3×2 ツールボタン（右）の横並び配置 -->
          <div class="mmnb-footer-middle-wrap">
            <!-- 左側：公式SNS（note ＆ X） -->
            <div class="mmnb-footer-sns-col">
              <a href="https://note.com/miminoba_33" target="_blank" rel="noopener noreferrer" class="mmnb-footer-note-link" title="ミミノバ 公式note">
                <img src="https://miminoba.jp/wp-content/uploads/2023/09/logo-4-1024x386.png" 
                     alt="note" 
                     width="145" height="auto"
                     loading="lazy"
                     decoding="async">
              </a>
              <a href="https://x.com/Miminoba33" target="_blank" rel="noopener noreferrer" class="mmnb-footer-x-link" title="ミミノバ 公式X">
                <img src="https://miminoba.jp/wp-content/uploads/2023/09/logo-black-1002x1024.png" 
                     alt="X (旧Twitter)" 
                     width="42" height="auto"
                     loading="lazy"
                     decoding="async">
              </a>
            </div>

            <!-- 仕切り線（PC時） -->
            <div class="mmnb-footer-divider"></div>

            <!-- 右側：3×2 ツールボタングリッド -->
            <div class="mmnb-footer-tools-col">
              <div class="mmnb-footer-tools-title">
                ✦ ミミノバ Webツール ＆ ポータル
              </div>
              <div class="mmnb-footer-tools-grid">
                ${webToolLinksHTML}
              </div>
            </div>
          </div>

          <!-- フッターナビゲーションライン -->
          <div class="mmnb-footer-nav-line">
            <ul class="mmnb-footer-nav-list">
              ${footerNavItemsHTML}
            </ul>
          </div>

          <!-- コピーライト -->
          <p class="mmnb-footer-copyright-text">
            Copyright (C) ミミノバ(MIMINOBA) All Rights Reserved.
          </p>
        </div>
      </footer>
    `;
  }

  // 5. DOMへの自動挿入＆イベント設定
  function initMiminobaNav() {
    // ヘッダー挿入
    const customHeaderContainer = document.getElementById('miminoba-header');
    if (customHeaderContainer) {
      customHeaderContainer.innerHTML = createHeaderHTML();
    } else {
      const headerDiv = document.createElement('div');
      headerDiv.innerHTML = createHeaderHTML();
      document.body.insertBefore(headerDiv.firstElementChild, document.body.firstChild);
    }

    // フッター挿入
    const customFooterContainer = document.getElementById('miminoba-footer');
    if (customFooterContainer) {
      customFooterContainer.innerHTML = createFooterHTML();
    } else {
      const footerDiv = document.createElement('div');
      footerDiv.innerHTML = createFooterHTML();
      document.body.appendChild(footerDiv.firstElementChild);
    }

    // スマホ用ハンバーガーメニューの開閉動作
    const toggleBtn = document.getElementById('mmnbMobileToggle');
    const dropdown = document.getElementById('mmnbMobileDropdown');

    if (toggleBtn && dropdown) {
      toggleBtn.addEventListener('click', function () {
        const isOpen = dropdown.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
  }

  // DOMContentLoadedを待って実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMiminobaNav);
  } else {
    initMiminobaNav();
  }
})();
