/* Génère la barre de navigation commune + le métronome global à partir
   d'une source unique. Chaque page pose <div id="site-nav-root" data-page="..."></div>
   puis charge ce script juste après — pas de build, marche en ouvrant les
   fichiers directement (contrairement à fetch(), bloqué en file://). */

(function () {
  const NAV_LINKS = [
    { id: 'echauffements', href: 'echauffements.html', label: 'Échauffements' },
    { id: 'theorie', href: 'theorie.html', label: 'Théorie' },
    { id: 'journal', href: 'journal.html', label: 'Journal' },
    {
      id: 'gammes',
      href: 'gammes.html',
      label: 'Gammes',
      dropdown: [
        { id: 'gammes', href: 'gammes.html', label: 'Toutes les gammes' },
        { id: 'pentatonique', href: 'pentatonique-mineure.html', label: 'Pentatonique mineure' },
        { id: 'do-majeur', href: 'do-majeur.html', label: 'Do majeur' },
      ],
    },
    { id: 'accords', href: 'chord_progressions.html', label: 'Accords' },
    { id: 'partitions', href: 'partitions.html', label: 'Partitions' },
  ];

  function renderLink(item, current) {
    const active = item.id === current ? ' class="active"' : '';
    return `<a href="${item.href}"${active}>${item.label}</a>`;
  }

  function renderDropdown(item, current) {
    const isActive = item.dropdown.some((sub) => sub.id === current);
    const items = item.dropdown.map((sub) => renderLink(sub, current)).join('');
    return `<div class="site-nav-dropdown${isActive ? ' active' : ''}">
      <a href="${item.href}">${item.label}</a>
      <div class="site-nav-dropdown-menu">${items}</div>
    </div>`;
  }

  function renderNav() {
    const root = document.getElementById('site-nav-root');
    if (!root) return;
    const current = root.dataset.page || '';

    const links = NAV_LINKS.map((item) =>
      item.dropdown ? renderDropdown(item, current) : renderLink(item, current)
    ).join('');

    const brandActive = current === 'accueil' ? ' active' : '';

    root.outerHTML = `<nav class="site-nav">
      <div class="site-nav-inner">
        <a class="site-nav-brand${brandActive}" href="index.html">Guitare</a>
        <div class="site-nav-links">${links}</div>
        <button type="button" id="nav-metro-toggle" class="site-nav-metro" aria-label="Ouvrir le métronome" aria-expanded="false">
          <span class="site-nav-metro-dot" id="nav-metro-dot"></span>
          Métro
        </button>
      </div>
    </nav>`;
  }

  function renderMetroPanel() {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="nav-metro-panel" class="site-nav-metro-panel">
        <div class="site-nav-metro-panel-header">
          <span class="site-nav-metro-panel-label">Métronome</span>
          <span class="site-nav-metro-panel-tempo" id="nav-metro-tempo-value">60</span>
          <span class="site-nav-metro-panel-bpm">bpm</span>
        </div>
        <div class="site-nav-metro-panel-controls">
          <button type="button" class="site-nav-metro-btn" id="nav-metro-down" aria-label="Diminuer le tempo">−</button>
          <input type="range" id="nav-metro-slider" min="40" max="200" value="60" class="site-nav-metro-slider">
          <button type="button" class="site-nav-metro-btn" id="nav-metro-up" aria-label="Augmenter le tempo">+</button>
          <button type="button" class="site-nav-metro-play" id="nav-metro-play" aria-label="Démarrer">
            <span class="site-nav-metro-icon-play"></span>
            <span class="site-nav-metro-icon-stop"></span>
          </button>
        </div>
      </div>`);
  }

  function initMetronome() {
    let audioCtx = null;
    let isPlaying = false;
    let tempo = 60;
    let timerId = null;
    let beatCount = 0;
    let panelOpen = false;

    const toggleBtn = document.getElementById('nav-metro-toggle');
    const navDot = document.getElementById('nav-metro-dot');
    const panel = document.getElementById('nav-metro-panel');
    const playBtn = document.getElementById('nav-metro-play');
    const tempoValue = document.getElementById('nav-metro-tempo-value');
    const tempoSlider = document.getElementById('nav-metro-slider');

    if (!toggleBtn || !panel) return;

    function playClick(strong) {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = strong ? 1000 : 750;
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    }

    function pulse() {
      navDot.classList.remove('pulse');
      void navDot.offsetWidth;
      navDot.classList.add('pulse');
    }

    function tick() {
      playClick(beatCount % 4 === 0);
      pulse();
      beatCount++;
    }

    function scheduleTimer() {
      clearInterval(timerId);
      timerId = setInterval(tick, 60000 / tempo);
    }

    function start() {
      if (isPlaying) return;
      isPlaying = true;
      beatCount = 0;
      tick();
      scheduleTimer();
      playBtn.classList.add('playing');
      playBtn.setAttribute('aria-label', 'Arrêter');
      toggleBtn.classList.add('running');
    }

    function stop() {
      isPlaying = false;
      clearInterval(timerId);
      playBtn.classList.remove('playing');
      playBtn.setAttribute('aria-label', 'Démarrer');
      toggleBtn.classList.remove('running');
    }

    function setTempo(value) {
      tempo = Math.min(200, Math.max(40, value));
      tempoValue.textContent = tempo;
      tempoSlider.value = tempo;
      if (isPlaying) scheduleTimer();
    }

    function positionPanel() {
      const rect = toggleBtn.getBoundingClientRect();
      panel.style.top = rect.bottom + 8 + 'px';
      panel.style.right = window.innerWidth - rect.right + 'px';
    }

    function openPanel() {
      positionPanel();
      panel.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      panelOpen = true;
    }

    function closePanel() {
      panel.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      panelOpen = false;
    }

    toggleBtn.addEventListener('click', () => {
      panelOpen ? closePanel() : openPanel();
    });

    document.addEventListener('click', (e) => {
      if (!panelOpen) return;
      if (panel.contains(e.target) || toggleBtn.contains(e.target)) return;
      closePanel();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panelOpen) closePanel();
    });

    window.addEventListener('resize', () => {
      if (panelOpen) positionPanel();
    });

    playBtn.addEventListener('click', () => (isPlaying ? stop() : start()));
    document.getElementById('nav-metro-down').addEventListener('click', () => setTempo(tempo - 5));
    document.getElementById('nav-metro-up').addEventListener('click', () => setTempo(tempo + 5));
    tempoSlider.addEventListener('input', (e) => setTempo(parseInt(e.target.value, 10)));
  }

  renderNav();
  renderMetroPanel();
  initMetronome();
})();
