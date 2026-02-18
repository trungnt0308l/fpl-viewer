// FPL Squad Preview Extension - Content Script
// This script injects a sidebar into the FPL website

(function() {
  'use strict';

  // Config
  const API = 'https://fantasy.premierleague.com';
  const PROXIES = [
    url => {
      const path = new URL(url).pathname;
      return `https://fpl-proxy.tuantrung.workers.dev${path}`;
    },
  ];
  let proxyIndex = 0;

  // State
  let bootstrapData = null;
  let managerData = null;
  let picksData = {};
  let nextGWs = [];
  let historyData = null;
  let sidebarOpen = false;

  // Badge CDN
  const BADGE_CDN = 'https://pub-9618cf27a5ef43f6acbd0099b778414b.r2.dev';
  const logoCache = {};

  function getTeamLogoURL(teamCode) {
    if (!logoCache[teamCode]) {
      logoCache[teamCode] = `${BADGE_CDN}/badges/t${teamCode}.png`;
    }
    return logoCache[teamCode];
  }

  // Fetch helper
  async function apiFetch(url) {
    let lastErr;
    for (let i = 0; i < PROXIES.length; i++) {
      const idx = (proxyIndex + i) % PROXIES.length;
      try {
        const res = await fetch(PROXIES[idx](url), { signal: AbortSignal.timeout(12000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        proxyIndex = idx;
        return data;
      } catch(e) { lastErr = e; }
    }
    throw new Error(`All proxies failed. Last: ${lastErr?.message}`);
  }

  // Get manager ID from FPL website
  function getManagerIdFromPage() {
    // Try to extract from URL first
    const urlMatch = window.location.href.match(/entry\/(\d+)/);
    if (urlMatch) return urlMatch[1];

    // Try to get from localStorage (FPL stores user data there)
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.player) return String(parsed.player);
      }
    } catch(e) {}

    return null;
  }

  // Create sidebar HTML
  function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'fpl-preview-sidebar';
    sidebar.innerHTML = `
      <div class="fpl-sidebar-header">
        <h2>5 Gameweek Preview</h2>
        <button class="fpl-sidebar-close" id="fpl-sidebar-close">×</button>
      </div>
      <div class="fpl-sidebar-content" id="fpl-sidebar-content">
        <div class="fpl-loading">
          <div class="fpl-spinner"></div>
          <p>Loading preview...</p>
        </div>
      </div>
    `;
    document.body.appendChild(sidebar);

    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'fpl-preview-toggle';
    toggleBtn.innerHTML = '⚽<span>Preview</span>';
    toggleBtn.title = 'Show 5 Gameweek Preview';
    document.body.appendChild(toggleBtn);

    // Event listeners
    toggleBtn.addEventListener('click', () => toggleSidebar());
    document.getElementById('fpl-sidebar-close').addEventListener('click', () => closeSidebar());

    // Close on overlay click
    sidebar.addEventListener('click', (e) => {
      if (e.target === sidebar) closeSidebar();
    });

    return sidebar;
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('fpl-preview-sidebar');
    const toggleBtn = document.getElementById('fpl-preview-toggle');

    if (sidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  function openSidebar() {
    const sidebar = document.getElementById('fpl-preview-sidebar');
    const toggleBtn = document.getElementById('fpl-preview-toggle');

    sidebar.classList.add('open');
    toggleBtn.classList.add('active');
    sidebarOpen = true;

    // Load data if not already loaded
    if (!bootstrapData) {
      loadTeamData();
    }
  }

  function closeSidebar() {
    const sidebar = document.getElementById('fpl-preview-sidebar');
    const toggleBtn = document.getElementById('fpl-preview-toggle');

    sidebar.classList.remove('open');
    toggleBtn.classList.remove('active');
    sidebarOpen = false;
  }

  // Load team data
  async function loadTeamData() {
    const contentEl = document.getElementById('fpl-sidebar-content');

    try {
      const managerId = getManagerIdFromPage();
      if (!managerId) {
        contentEl.innerHTML = `
          <div class="fpl-error">
            <p>Could not detect your FPL ID. Please navigate to your team page.</p>
          </div>
        `;
        return;
      }

      // Show loading
      contentEl.innerHTML = `
        <div class="fpl-loading">
          <div class="fpl-spinner"></div>
          <p>Loading your team...</p>
        </div>
      `;

      // 1. Bootstrap
      if (!bootstrapData) {
        bootstrapData = await apiFetch(`${API}/bootstrap-static/`);
      }

      // 2. Next GWs
      const events = bootstrapData.events;
      let startGW = events.find(e => e.is_next);
      if (!startGW) startGW = events.find(e => !e.finished) || events[events.length - 1];
      const startIdx = events.indexOf(startGW);
      nextGWs = events.slice(startIdx, startIdx + 5).filter(Boolean);
      if (nextGWs.length === 0) nextGWs = [startGW];

      // 3. Manager info
      managerData = await apiFetch(`${API}/entry/${managerId}/`);

      // 4. Manager history
      historyData = await apiFetch(`${API}/entry/${managerId}/history/`);

      // 5. Picks
      const currentGW = events.find(e => e.is_current);
      const latestFinished = events.filter(e => e.finished).pop();
      const picksGW = currentGW || latestFinished || events[0];
      picksData = await apiFetch(`${API}/entry/${managerId}/event/${picksGW.id}/picks/`);

      // 6. Fixtures
      bootstrapData._fixtures = await apiFetch(`${API}/fixtures/`);

      // Populate logo cache
      bootstrapData.teams.forEach(t => getTeamLogoURL(t.code));

      // Render
      renderPreview();

    } catch(err) {
      contentEl.innerHTML = `
        <div class="fpl-error">
          <p>Failed to load team data.</p>
          <p class="error-detail">${err.message}</p>
          <button onclick="window.location.reload()">Retry</button>
        </div>
      `;
      console.error('FPL Preview Extension Error:', err);
    }
  }

  // Compute squad stats
  function getSquadStats() {
    const picks = picksData.picks || [];
    const players = bootstrapData.elements;
    let startersEP = 0;

    picks.forEach(pick => {
      const pl = players.find(p => p.id === pick.element);
      if (!pl) return;
      if (pick.position <= 11) {
        const ep = parseFloat(pl.ep_next) || 0;
        startersEP += pick.is_captain ? ep * 2 : ep;
      }
    });

    return { startersEP };
  }

  // Compute GW expected points
  function computeGWExpectedPoints(gw, picks, players, fixtures) {
    const isNext = nextGWs.length > 0 && gw.id === nextGWs[0].id;
    const gwFix = fixtures.filter(f => f.event === gw.id);
    let total = 0;
    picks.forEach(pick => {
      if (pick.position > 11) return;
      const pl = players.find(p => p.id === pick.element);
      if (!pl) return;
      let ep = 0;
      if (isNext) {
        ep = parseFloat(pl.ep_next) || 0;
      } else {
        const ppg = parseFloat(pl.points_per_game) || 0;
        const pf = gwFix.filter(f => f.team_h === pl.team || f.team_a === pl.team);
        pf.forEach(f => {
          const diff = f.team_h === pl.team ? f.team_h_difficulty : f.team_a_difficulty;
          ep += ppg * (6 - diff) / 3;
        });
      }
      total += pick.is_captain ? ep * 2 : ep;
    });
    return total;
  }

  // Render preview
  function renderPreview() {
    const contentEl = document.getElementById('fpl-sidebar-content');
    const picks = picksData.picks || [];
    const players = bootstrapData.elements;
    const teams = bootstrapData.teams;
    const fixtures = bootstrapData._fixtures || [];

    let html = '';

    // Manager info
    const m = managerData;
    const stats = getSquadStats();

    html += `
      <div class="fpl-manager-info">
        <div class="fpl-manager-name">${esc(m.player_first_name)} ${esc(m.player_last_name)}</div>
        <div class="fpl-manager-team">${esc(m.name)}</div>
        <div class="fpl-manager-stats">
          <span>Rank: <b>${(m.summary_overall_rank||0).toLocaleString()}</b></span>
          <span>Points: <b>${m.summary_overall_points||0}</b></span>
          <span>EP: <b>${stats.startersEP.toFixed(1)}</b></span>
        </div>
      </div>
    `;

    // GW tabs
    html += '<div class="fpl-gw-tabs">';
    nextGWs.forEach((gw, i) => {
      html += `<button class="fpl-gw-tab ${i === 0 ? 'active' : ''}" data-gw="${i}">GW${gw.id}</button>`;
    });
    html += '</div>';

    // GW slides container
    html += '<div class="fpl-gw-container">';

    nextGWs.forEach((gw, gwIndex) => {
      const gwFix = fixtures.filter(f => f.event === gw.id);
      const gwEP = computeGWExpectedPoints(gw, picks, players, fixtures);
      const dl = gw.deadline_time ? new Date(gw.deadline_time) : null;
      const dlStr = dl ? dl.toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '';

      html += `<div class="fpl-gw-slide ${gwIndex === 0 ? 'active' : ''}" data-gw="${gwIndex}">`;
      html += `
        <div class="fpl-gw-info">
          <div class="fpl-gw-title">Gameweek ${gw.id}</div>
          <div class="fpl-gw-deadline">${dlStr}</div>
          <div class="fpl-gw-ep">Expected: ${gwEP.toFixed(1)} pts</div>
        </div>
      `;

      // Squad
      const starters = picks.filter(p => p.position <= 11);
      const bench = picks.filter(p => p.position > 11);

      const posMap = {1:'GKP',2:'DEF',3:'MID',4:'FWD'};
      const posOrder = ['GKP','DEF','MID','FWD'];
      const grouped = {};
      posOrder.forEach(p => grouped[p] = []);
      starters.forEach(pick => {
        const pl = players.find(p => p.id === pick.element);
        if (pl) grouped[posMap[pl.element_type]||'MID'].push({pick,player:pl});
      });

      html += '<div class="fpl-squad">';
      posOrder.forEach(pos => {
        if (grouped[pos].length === 0) return;
        html += `<div class="fpl-pos-section">`;
        grouped[pos].forEach(({pick,player}) => {
          html += renderPlayerCard(player, pick, gwFix, teams);
        });
        html += '</div>';
      });

      // Bench
      html += '<div class="fpl-bench-divider">BENCH</div>';
      html += '<div class="fpl-bench-section">';
      bench.forEach(pick => {
        const pl = players.find(p => p.id === pick.element);
        if (pl) html += renderPlayerCard(pl, pick, gwFix, teams);
      });
      html += '</div>';
      html += '</div>'; // end squad

      html += '</div>'; // end slide
    });

    html += '</div>'; // end container

    contentEl.innerHTML = html;

    // Add tab click handlers
    document.querySelectorAll('.fpl-gw-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const gwIndex = parseInt(tab.dataset.gw);
        switchToGW(gwIndex);
      });
    });
  }

  // Switch to a specific GW
  function switchToGW(gwIndex) {
    // Update tabs
    document.querySelectorAll('.fpl-gw-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === gwIndex);
    });

    // Update slides
    document.querySelectorAll('.fpl-gw-slide').forEach((slide, i) => {
      slide.classList.toggle('active', i === gwIndex);
    });
  }

  // Render player card
  function renderPlayerCard(player, pick, gwFix, teams) {
    const teamObj = teams.find(t => t.id === player.team);
    const teamShort = teamObj ? teamObj.short_name : '???';
    const teamCode = teamObj ? teamObj.code : 0;
    const posClass = {1:'gk',2:'def',3:'mid',4:'fwd'}[player.element_type] || 'mid';

    const cached = logoCache[teamCode];
    const inner = cached
      ? `<img src="${cached}" crossorigin="anonymous" alt="${esc(teamShort)}" loading="lazy">`
      : `<span class="fallback-text">${esc(teamShort)}</span>`;

    // Fixture
    let fixHtml = '';
    const pf = gwFix.filter(f => f.team_h === player.team || f.team_a === player.team);
    pf.forEach(f => {
      const home = f.team_h === player.team;
      const opp = teams.find(t => t.id === (home ? f.team_a : f.team_h));
      const name = opp ? opp.short_name : '???';
      const diff = home ? f.team_h_difficulty : f.team_a_difficulty;
      const loc = home ? '(H)' : '(a)';
      const cls = diff <= 2 ? 'fix-easy' : diff >= 4 ? 'fix-hard' : 'fix-mid';
      fixHtml += `<span class="${cls}">${name}${loc}</span> `;
    });
    if (!fixHtml) fixHtml = '<span class="fix-none">—</span>';

    // Captain/VC
    let badge = '';
    if (pick.is_captain) badge = '<div class="captain-badge">C</div>';
    else if (pick.is_vice_captain) badge = '<div class="vice-badge">V</div>';

    // Status dot
    let statusDot = '';
    if (player.status === 'i') statusDot = '<div class="status-dot injured"></div>';
    else if (player.status === 'd') statusDot = '<div class="status-dot doubt"></div>';
    else if (player.status === 's') statusDot = '<div class="status-dot suspended"></div>';

    // Form dot
    const form = parseFloat(player.form) || 0;
    let formDot = '';
    if (!statusDot) {
      const formCls = form >= 6 ? 'hot' : form >= 3 ? 'warm' : 'cold';
      formDot = `<div class="form-dot ${formCls}"></div>`;
    }

    return `
      <div class="fpl-player-card">
        ${badge}
        <div class="fpl-player-badge ${posClass}">${inner}${statusDot || formDot}</div>
        <div class="fpl-player-name">${esc(player.web_name)}</div>
        <div class="fpl-player-fixture">${fixHtml}</div>
      </div>
    `;
  }

  // Escape HTML
  function esc(s) {
    return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  }

  // Initialize extension
  function init() {
    // Check if we're on the FPL website
    if (!window.location.href.includes('fantasy.premierleague.com')) return;

    // Create sidebar
    createSidebar();

    console.log('FPL Squad Preview Extension loaded');
  }

  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
