  // GitHub Calendar Initialization
  GitHubCalendar("#github-calendar", "jjh090802", { responsive: true });

  // ── Cursor Logic ──
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effects
  document.querySelectorAll('a, .skill-item, .award-item, .project-item, .stat-card, .grass-card, .hero-scroll, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '14px'; cursor.style.height = '14px';
      ring.style.width = '52px'; ring.style.height = '52px'; ring.style.borderColor = 'var(--accent)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '8px'; cursor.style.height = '8px';
      ring.style.width = '36px'; ring.style.height = '36px'; ring.style.borderColor = 'rgba(200,245,66,0.4)';
    });
  });

  // Blend mode toggle for white background images
  document.querySelectorAll('.stat-card img, #github-calendar').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('no-blend'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('no-blend'));
  });

  // Scroll Reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), 100);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => io.observe(el));

  // Smooth Scroll
  document.getElementById('scroll-btn').addEventListener('click', () => {
    document.getElementById('skills').scrollIntoView({ behavior: 'smooth' });
  });

  // Modal Logic
  const modal = document.getElementById('project-modal');
  const mTitle = document.getElementById('modal-title');
  const mDesc = document.getElementById('modal-desc');
  const mYear = document.getElementById('modal-year');
  const mTags = document.getElementById('modal-tags');

  document.querySelectorAll('.project-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      mTitle.innerText = item.getAttribute('data-title');
      mDesc.innerText = item.getAttribute('data-desc');
      mYear.innerText = item.getAttribute('data-year');
      
      mTags.innerHTML = '';
      item.getAttribute('data-tags').split(',').forEach(t => {
        const span = document.createElement('span');
        span.className = 'tag'; span.innerText = t.trim();
        mTags.appendChild(span);
      });
      modal.classList.add('active');
    });
  });

  document.getElementById('modal-close').addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Email Copy & Toast
  const copyBtn = document.getElementById('copy-email');
  const toast = document.getElementById('toast');
  copyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(copyBtn.getAttribute('data-email')).then(() => {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    });
  });