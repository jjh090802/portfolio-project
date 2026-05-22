(function () {
  'use strict';

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initContributionGraph();
  initEmailCopy();
  loadGitHubStats();
  initStatsSlider();
  initCustomCursor();
  initPreloader();
  initPageTransition();
  initLocalClock();

  async function initContributionGraph() {
    const el = document.getElementById('github-calendar');
    if (!el) return;

    const COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
    const CELL = 12, GAP = 3, SIZE = CELL + GAP;
    const LABEL_OFFSET = 20;

    try {
      const res = await fetch(
        'https://github-contributions-api.jogruber.de/v4/jjh090802?y=last',
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error('Network response was not ok');
      const { contributions } = await res.json();

      const weeks = [];
      let week = Array(7).fill(null);
      contributions.forEach(c => {
        const dow = new Date(c.date + 'T12:00:00').getDay();
        week[dow] = c;
        if (dow === 6) { weeks.push(week); week = Array(7).fill(null); }
      });
      if (week.some(Boolean)) weeks.push(week);

      let monthLabels = '';
      let lastMonth = -1;
      const W = weeks.length * SIZE, H = 7 * SIZE + LABEL_OFFSET;
      const rects = weeks.flatMap((w, wi) =>
        w.map((d, di) => {
          if (!d) return '';
          const dateObj = new Date(d.date + 'T12:00:00');
          const month = dateObj.getMonth();
          if (month !== lastMonth) {
            const monthName = dateObj.toLocaleString('en-US', { month: 'short' });
            monthLabels += `<text x="${wi * SIZE}" y="12" fill="var(--text-muted)" font-size="10" font-family="'Poppins', 'Noto Sans KR', sans-serif" font-weight="500">${monthName}</text>`;
            lastMonth = month;
          }
          return `<rect x="${wi*SIZE}" y="${di*SIZE + LABEL_OFFSET}" width="${CELL}" height="${CELL}" rx="2" fill="${COLORS[d.level === 0 ? 0 : 5 - d.level]}">
            <title>${d.count}개 기여 · ${d.date}</title>
          </rect>`;
        })
      ).join('');

      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;" role="img" aria-label="지난 1년간 GitHub 기여도 그래프">
        ${monthLabels}
        ${rects}
      </svg>`;
      el.scrollLeft = el.scrollWidth;
    } catch (e) {
      el.innerHTML = '<p style="color:var(--text-muted);font-size:12px;padding:8px 0;">잔디 불러오기 실패</p>';
    }
  }

  function initEmailCopy() {
    const copyBtn = document.getElementById('copy-email');
    const toast = document.getElementById('toast');
    if (!copyBtn || !toast) return;

    let toastTimeout;
    copyBtn.addEventListener('click', () => {
      const email = copyBtn.getAttribute('data-email') || '';
      const showToast = () => {
        clearTimeout(toastTimeout);
        toast.classList.add('show');
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showToast).catch(() => fallbackCopy(email, showToast));
      } else {
        fallbackCopy(email, showToast);
      }
    });
  }

  function fallbackCopy(text, onSuccess) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); onSuccess(); }
    catch (e) { /* swallow */ }
    finally { document.body.removeChild(ta); }
  }

  async function loadGitHubStats() {
    const LANG_COLORS = {
      JavaScript: '#f1e05a', TypeScript: '#2b7489', Python: '#3572A5',
      HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', 'C++': '#f34b7d',
      C: '#555555', Go: '#00ADD8', Rust: '#dea584', PHP: '#4F5D95',
      Ruby: '#701516', Swift: '#ffac45', Kotlin: '#F18E33', Vue: '#41b883',
    };
    const langEl = document.getElementById('gh-langs');

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch('https://api.github.com/users/jjh090802'),
        fetch('https://api.github.com/users/jjh090802/repos?per_page=100'),
      ]);
      const user = await userRes.json();
      const repos = await reposRes.json();
      if (!userRes.ok) throw new Error(user.message || 'User API error');
      if (!reposRes.ok || !Array.isArray(repos)) throw new Error(repos.message || 'Repos API error');

      const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
      setText('gh-repos', user.public_repos ?? '—');
      setText('gh-stars', totalStars);
      setText('gh-followers', user.followers ?? '—');
      setText('gh-following', user.following ?? '—');

      const langMap = {};
      repos.forEach(r => { if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1; });
      const sorted = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const total = sorted.reduce((s, [, c]) => s + c, 0);

      if (langEl) {
        langEl.innerHTML = sorted.map(([lang, count]) => {
          const pct = ((count / total) * 100).toFixed(1);
          const color = LANG_COLORS[lang] || '#94a3b8';
          return `
            <div class="lang-item">
              <div class="lang-label"><span class="lang-dot" style="background:${color}"></span><span>${escapeHtml(lang)}</span></div>
              <span class="lang-pct">${pct}%</span>
            </div>
            <div class="lang-bar-bg"><div class="lang-bar-fill" style="width:${pct}%;background:${color}"></div></div>`;
        }).join('');
      }
    } catch (e) {
      const isRateLimit = (e.message || '').toLowerCase().includes('rate limit');
      if (langEl) {
        langEl.innerHTML = `<p class="lang-empty">${isRateLimit ? 'API 한도 초과 (1시간 후 재시도)' : '불러오기 실패'}</p>`;
      }
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initStatsSlider() {
    const statsSlider = document.getElementById('stats-slider');
    const statsDots = document.querySelectorAll('#stats-dots > *');
    if (!statsSlider || !statsDots.length) return;

    statsDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const card = statsSlider.querySelector('.stat-card');
        if (!card) return;
        const cardWidth = card.offsetWidth + 10;
        const index = parseInt(dot.dataset.index, 10) || 0;
        statsSlider.scrollTo({ left: cardWidth * index * 2, behavior: 'smooth' });
      });
    });

    statsSlider.addEventListener('scroll', () => {
      const card = statsSlider.querySelector('.stat-card');
      if (!card) return;
      const cardWidth = card.offsetWidth + 10;
      const index = Math.round(statsSlider.scrollLeft / (cardWidth * 2));
      statsDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }, { passive: true });
  }

  function initCustomCursor() {
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || reducedMotion) return;

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true');
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    document.body.classList.add('cursor-active');

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;
    let visible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      if (!visible) {
        visible = true;
        document.body.classList.add('cursor-visible');
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      visible = false;
      document.body.classList.remove('cursor-visible');
    });
    window.addEventListener('mouseenter', () => {
      visible = true;
      document.body.classList.add('cursor-visible');
    });

    function animate() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  function initPreloader() {
    const html = document.documentElement;
    if (!html.classList.contains('preloading')) return;

    const preloader = document.getElementById('preloader');
    const typedEl = document.getElementById('pl-typed');
    if (!preloader || !typedEl) {
      html.classList.remove('preloading');
      return;
    }

    const fullText = 'Jeon Jae Hyun';
    let i = 0;

    setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        typedEl.textContent = fullText.slice(0, i);
        if (i >= fullText.length) {
          clearInterval(interval);
          setTimeout(leave, 450);
        }
      }, 55);
    }, 700);

    function leave() {
      preloader.classList.add('is-leaving');
      const wrap = document.querySelector('.dashboard-wrapper');
      setTimeout(() => {
        html.classList.remove('preloading');
        if (wrap) {
          wrap.classList.add('is-entering');
          wrap.addEventListener('animationend', () => wrap.classList.remove('is-entering'), { once: true });
        }
        preloader.remove();
        try { sessionStorage.setItem('jh-preload-seen', '1'); } catch (e) { /* ignore */ }
      }, 450);
    }
  }

  function initLocalClock() {
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    if (!timeEl || !dateEl) return;

    const tz = 'Asia/Seoul';
    const timeFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const dateFmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, weekday: 'short', month: 'short', day: 'numeric'
    });

    function tick() {
      const now = new Date();
      timeEl.textContent = timeFmt.format(now);
      dateEl.textContent = dateFmt.format(now);
    }
    tick();
    const delay = 1000 - (Date.now() % 1000);
    setTimeout(() => { tick(); setInterval(tick, 1000); }, delay);
  }

  function initPageTransition() {
    const html = document.documentElement;
    const overlay = document.getElementById('page-transition');
    if (!overlay) return;

    if (html.classList.contains('pt-enter')) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => html.classList.remove('pt-enter'));
      });
    }

    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('a[data-page-link]').forEach(link => {
      link.addEventListener('click', function (e) {
        if (reduced) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const href = this.getAttribute('href');
        if (!href || href.startsWith('#') || /^(https?:)?\/\//.test(href)) return;
        e.preventDefault();
        overlay.classList.add('is-active');
        setTimeout(() => { window.location.href = href; }, 450);
      });
    });
  }
})();
