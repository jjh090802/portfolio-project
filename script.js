(async function () {
  const el = document.getElementById('github-calendar');
  const COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
  const CELL = 12, GAP = 3, SIZE = CELL + GAP;
  const LABEL_OFFSET = 20;
  try {
    const res = await fetch(
      'https://github-contributions-api.jogruber.de/v4/jjh090802?y=last',
      { cache: 'no-store' }
    );
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
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;max-width:100%">
      ${monthLabels}
      ${rects}
    </svg>`;
    el.scrollLeft = el.scrollWidth;
  } catch (e) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:12px;padding:8px 0;">잔디 불러오기 실패</p>';
  }
})();
const copyBtn = document.getElementById('copy-email');
const toast = document.getElementById('toast');
let toastTimeout;
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(copyBtn.getAttribute('data-email')).then(() => {
    clearTimeout(toastTimeout);
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
  });
});
async function loadGitHubStats() {
  const LANG_COLORS = {
    JavaScript: '#f1e05a', TypeScript: '#2b7489', Python: '#3572A5',
    HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', 'C++': '#f34b7d',
    C: '#555555', Go: '#00ADD8', Rust: '#dea584', PHP: '#4F5D95',
    Ruby: '#701516', Swift: '#ffac45', Kotlin: '#F18E33', Vue: '#41b883',
  };
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
    document.getElementById('gh-repos').textContent = user.public_repos ?? '—';
    document.getElementById('gh-stars').textContent = totalStars;
    document.getElementById('gh-followers').textContent = user.followers ?? '—';
    document.getElementById('gh-following').textContent = user.following ?? '—';
    const langMap = {};
    repos.forEach(r => { if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1; });
    const sorted = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const total = sorted.reduce((s, [, c]) => s + c, 0);
    document.getElementById('gh-langs').innerHTML = sorted.map(([lang, count]) => {
      const pct = ((count / total) * 100).toFixed(1);
      const color = LANG_COLORS[lang] || '#94a3b8';
      return `
        <div class="lang-item">
          <div class="lang-label"><span class="lang-dot" style="background:${color}"></span><span>${lang}</span></div>
          <span class="lang-pct">${pct}%</span>
        </div>
        <div class="lang-bar-bg"><div class="lang-bar-fill" style="width:${pct}%;background:${color}"></div></div>`;
    }).join('');
  } catch (e) {
    const isRateLimit = e.message?.includes('rate limit');
    document.getElementById('gh-langs').innerHTML = `<div style="color:var(--text-muted);font-size:12px;">${isRateLimit ? 'API 한도 초과 (1시간 후 재시도)' : '불러오기 실패'}</div>`;
  }
}
loadGitHubStats();
const statsSlider = document.getElementById('stats-slider');
const statsDots = document.querySelectorAll('#stats-dots span');
if (statsSlider && statsDots.length) {
  statsDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index);
      const cardWidth = statsSlider.querySelector('.stat-card').offsetWidth + 10;
      statsSlider.scrollTo({ left: cardWidth * index * 2, behavior: 'smooth' });
    });
  });
  statsSlider.addEventListener('scroll', () => {
    const cardWidth = statsSlider.querySelector('.stat-card').offsetWidth + 10;
    const index = Math.round(statsSlider.scrollLeft / (cardWidth * 2));
    statsDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }, { passive: true });
}