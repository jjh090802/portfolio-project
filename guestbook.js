import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, doc, updateDoc, increment,
  query, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCicwsChtH5Sg4bWpSOv18hrnB_vX5Qckw",
  authDomain: "jjh-portfolio-122b9.firebaseapp.com",
  projectId: "jjh-portfolio-122b9",
  storageBucket: "jjh-portfolio-122b9.firebasestorage.app",
  messagingSenderId: "730552295240",
  appId: "1:730552295240:web:adf210c586fa113c0a5d7d",
  measurementId: "G-304R9N29XN",
};

const form = document.getElementById('guestbook-form');
const submitBtn = document.getElementById('gb-submit');
const statusEl = document.getElementById('gb-status');
const listEl = document.getElementById('gb-list');
const totalEl = document.getElementById('gb-total');
const countNumEl = document.getElementById('gb-count-num');
const toast = document.getElementById('toast');
const messageInput = form.elements.message;
const nameInput = form.elements.name;

const openBtn = document.getElementById('gb-open-modal');
const modal = document.getElementById('gb-modal');
const modalBackdrop = document.getElementById('gb-modal-backdrop');
const modalClose = document.getElementById('gb-modal-close');

let db = null;
const LIKED_STORAGE_KEY = 'gb-liked-ids';
function getLikedIds() {
  try { return new Set(JSON.parse(localStorage.getItem(LIKED_STORAGE_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveLikedIds(set) {
  localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify([...set]));
}

openBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

function openModal() {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('gb-modal-open');
  setTimeout(() => nameInput.focus(), 150);
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('gb-modal-open');
  openBtn.focus();
}

messageInput.addEventListener('input', () => {
  countNumEl.textContent = messageInput.value.length;
});

const isConfigured = !firebaseConfig.apiKey.startsWith('여기에');

if (!isConfigured) {
  setStatus('Firebase 설정이 비어있습니다. guestbook.js의 firebaseConfig 값을 채워주세요.', 'error');
  submitBtn.disabled = true;
  listEl.innerHTML = '';
  const li = document.createElement('li');
  li.className = 'gb-empty';
  li.textContent = 'Firebase 설정 후 메시지가 표시됩니다.';
  listEl.appendChild(li);
  totalEl.textContent = '0';
} else {
  initFirebase();
}

async function initFirebase() {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    const auth = getAuth(app);
    await signInAnonymously(auth);

    const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snap) => {
      renderList(snap.docs);
    }, (err) => {
      console.error(err);
      setStatus('목록을 불러오지 못했습니다. 보안 규칙과 네트워크를 확인해주세요.', 'error');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const message = messageInput.value.trim();
      if (!name || !message) return;
      if (name.length > 30 || message.length > 500) {
        setStatus('이름은 30자, 메시지는 500자 이내로 작성해주세요.', 'error');
        return;
      }
      submitBtn.disabled = true;
      setStatus('등록 중...', '');
      try {
        await addDoc(collection(db, 'guestbook'), {
          name, message, likes: 0, createdAt: serverTimestamp(),
        });
        form.reset();
        countNumEl.textContent = '0';
        setStatus('', 'success');
        closeModal();
        showToast();
      } catch (err) {
        console.error(err);
        setStatus('등록에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
      } finally {
        submitBtn.disabled = false;
      }
    });
  } catch (err) {
    console.error(err);
    setStatus('Firebase 초기화에 실패했습니다. 설정값을 확인해주세요.', 'error');
    submitBtn.disabled = true;
  }
}

function renderList(docs) {
  listEl.innerHTML = '';
  totalEl.textContent = docs.length;
  if (docs.length === 0) {
    const li = document.createElement('li');
    li.className = 'gb-empty';
    li.textContent = '아직 메시지가 없습니다. 첫 메시지를 남겨주세요.';
    listEl.appendChild(li);
    return;
  }
  const likedIds = getLikedIds();
  docs.forEach((d, index) => {
    const data = d.data();
    const li = document.createElement('li');
    li.className = 'gb-item';
    if (index < 16) li.style.animationDelay = `${index * 35}ms`;

    const msg = document.createElement('p');
    msg.className = 'gb-item-msg';
    msg.textContent = data.message || '';
    li.appendChild(msg);

    const footer = document.createElement('div');
    footer.className = 'gb-item-footer';

    const avatar = document.createElement('div');
    avatar.className = 'gb-item-avatar';
    avatar.textContent = getInitials(data.name);
    footer.appendChild(avatar);

    const meta = document.createElement('div');
    meta.className = 'gb-item-meta';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'gb-item-name';
    nameSpan.textContent = data.name || '익명';
    meta.appendChild(nameSpan);

    const timeSpan = document.createElement('span');
    timeSpan.className = 'gb-item-time';
    timeSpan.textContent = formatTime(data.createdAt);
    meta.appendChild(timeSpan);

    footer.appendChild(meta);

    const likeBtn = document.createElement('button');
    likeBtn.type = 'button';
    likeBtn.className = 'gb-like';
    if (likedIds.has(d.id)) likeBtn.classList.add('liked');
    likeBtn.setAttribute('aria-label', '좋아요');
    likeBtn.innerHTML = `
      <svg class="gb-like-icon" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      <span class="gb-like-count">${data.likes || 0}</span>
    `;
    const countEl = likeBtn.querySelector('.gb-like-count');
    likeBtn.addEventListener('click', () => toggleLike(d.id, likeBtn, countEl));

    footer.appendChild(likeBtn);
    li.appendChild(footer);
    listEl.appendChild(li);
  });
}

async function toggleLike(docId, btn, countEl) {
  if (!db || btn.dataset.busy === '1') return;
  btn.dataset.busy = '1';
  const liked = getLikedIds();
  const wasLiked = liked.has(docId);
  const currentCount = parseInt(countEl.textContent, 10) || 0;
  const newCount = Math.max(0, wasLiked ? currentCount - 1 : currentCount + 1);

  countEl.textContent = newCount;
  btn.classList.toggle('liked', !wasLiked);
  btn.classList.remove('pop');
  void btn.offsetWidth;
  btn.classList.add('pop');

  if (wasLiked) liked.delete(docId); else liked.add(docId);
  saveLikedIds(liked);

  try {
    await updateDoc(doc(db, 'guestbook', docId), {
      likes: increment(wasLiked ? -1 : 1),
    });
  } catch (err) {
    console.error('like failed', err);
    countEl.textContent = currentCount;
    btn.classList.toggle('liked', wasLiked);
    if (wasLiked) liked.add(docId); else liked.delete(docId);
    saveLikedIds(liked);
  } finally {
    btn.dataset.busy = '';
  }
}

function getInitials(name) {
  if (!name) return '?';
  const trimmed = name.trim();
  if (!trimmed) return '?';
  if (/[ㄱ-힝]/.test(trimmed)) return trimmed.charAt(0);
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatTime(ts) {
  if (!ts || typeof ts.toDate !== 'function') return '방금';
  const d = ts.toDate();
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.classList.remove('error', 'success');
  if (kind) statusEl.classList.add(kind);
}

let toastTimer;
function showToast() {
  clearTimeout(toastTimer);
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}
