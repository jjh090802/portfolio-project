(function () {
  'use strict';

  const TOGGLE_BTN = document.getElementById('chatbot-toggle');
  const CLOSE_BTN = document.getElementById('chatbot-close');
  const ROOT = document.getElementById('chatbot');
  const WINDOW_EL = document.getElementById('chatbot-window');
  const MESSAGES = document.getElementById('chatbot-messages');
  const FORM = document.getElementById('chatbot-form');
  const INPUT = document.getElementById('chatbot-input');
  const SUGGESTIONS_EL = document.getElementById('chatbot-suggestions');

  if (!TOGGLE_BTN || !CLOSE_BTN || !ROOT || !WINDOW_EL || !MESSAGES || !FORM || !INPUT || !SUGGESTIONS_EL) {
    return;
  }

  // 전재현 본인 정보 (말투: 정중하고 간결, 자신감 있되 겸손)
  const KNOWLEDGE = [
    {
      keywords: ['안녕', '하이', 'hello', 'hi', '반가워', '반갑'],
      reply: '안녕하세요! 저는 <strong>전재현</strong>을 대신해 답변드리는 JH Bot이에요. 이력, 프로젝트, 기술 스택 등 무엇이든 편하게 물어봐 주세요 :)'
    },
    {
      keywords: ['자기소개', '소개', '누구', '본인', '너는', '당신은', '어떤 사람'],
      reply: '저는 <strong>대구 영남공업고등학교 스마트소프트웨어과</strong>에 재학 중인 풀스택 개발자 전재현입니다. 프론트엔드와 백엔드를 모두 다루며, UI/UX 설계부터 기능 구현까지 사용자 중심의 완성도 있는 웹을 만드는 데 집중하고 있어요.'
    },
    {
      keywords: ['프로젝트', '작업물', '만든', '만들었', '포트폴리오 프로젝트', '대표작', 'works'],
      reply: '대표 프로젝트는 두 가지입니다.<br><br><strong>1. 달빛연합 해커톤 — 융합상 수상작</strong><br>시각장애인을 위한 웨어러블 보조 디바이스를 팀 프로젝트로 만들었어요. 바디캠 형태로 착용하면 AI가 주변 사물을 인식하고, 초음파 센서로 거리까지 측정해 사용자에게 알려주는 구조입니다.<br><br><strong>2. 인터랙티브 개인 포트폴리오</strong><br>지금 보고 계신 이 사이트로, Vanilla JS만으로 커스텀 커서·인터랙션·GitHub API 연동까지 직접 구현했습니다.'
    },
    {
      keywords: ['힘들', '어려웠', '어려운', '도전', '챌린지', '고생', '힘든'],
      reply: '가장 힘들었던 건 <strong>달빛연합 해커톤</strong>이었어요. 시각장애인을 보조하는 바디캠형 웨어러블 디바이스를 만드는 프로젝트였는데, AI 객체 인식 모델과 초음파 거리 센서를 한정된 시간 안에 통합하고, 실제 사람이 착용해서 동작하게 만드는 게 큰 도전이었습니다. 결과적으로 융합상을 수상하면서 <strong>"하드웨어와 소프트웨어가 동시에 굴러갈 때의 의사결정"</strong>을 배운 값진 경험이 됐어요.'
    },
    {
      keywords: ['달빛연합', '달빛', '해커톤에서', '해커톤 뭐', '해커톤에 뭐', '해커톤때', '해커톤 때', '뭐했', '뭐 했', '무엇을 했', '뭐 만들', '뭘 했', '시각장애', '바디캠', '웨어러블', '융합상', '객체 인식', '초음파'],
      reply: '<strong>달빛연합 해커톤 (2025, 융합상 수상)</strong>에서는 시각장애인을 위한 <strong>바디캠형 웨어러블 보조 디바이스</strong>를 팀 프로젝트로 만들었어요.<br><br>핵심 아이디어는 "눈을 대신해 주는 카메라"였습니다. 사용자가 바디캠을 착용하면,<br><br>• <strong>AI 객체 인식</strong>으로 주변 사물(사람, 장애물, 표지판 등)을 실시간 감지하고<br>• <strong>초음파 센서</strong>로 그 사물까지의 거리를 측정해서<br>• 음성으로 <em>"전방 2m에 사람이 있어요"</em> 처럼 사용자에게 알려주는 구조예요.<br><br>제가 맡은 부분은 <strong>라즈베리파이 기반의 소프트웨어 구현</strong>이었어요. 카메라·초음파 센서 입력을 라즈베리파이에서 받아 처리하고, 객체 인식 결과와 거리 데이터를 음성 출력까지 이어주는 흐름을 직접 다뤘습니다. 하드웨어와 소프트웨어가 동시에 굴러가는 환경에서 <strong>"한정된 시간 안에 어디까지 완성도를 끌어올릴지"</strong> 판단하는 감각을 많이 배운 프로젝트였어요.'
    },
    {
      keywords: ['학교', '다니', '재학', '고등학교', '학과', '전공'],
      reply: '<strong>영남공업고등학교 스마트소프트웨어과</strong>에 재학 중입니다 (2026 - 현재). 소프트웨어 전반을 다루는 학과에서 실무에 가까운 개발 경험을 쌓고 있어요.'
    },
    {
      keywords: ['기술', '스택', '언어', '사용하는', '뭘 써', '뭘 쓰', '주로 쓰', 'skill', 'tech'],
      reply: '주로 사용하는 기술은 다음과 같아요.<br><br>• <strong>프론트엔드</strong>: HTML, CSS, JavaScript (Vanilla)<br>• <strong>백엔드/언어</strong>: Python, C<br>• <strong>도구</strong>: VS Code, Git/GitHub, Figma, Notion<br><br>특히 Vanilla JS로 프레임워크 없이 인터랙션을 구현하는 걸 좋아합니다.'
    },
    {
      keywords: ['수상', '상', '경력', '성과', '받은', '대회', '경기대회', '해커톤', '메달'],
      reply: '지금까지 받은 주요 성과예요.<br><br>🏅 <strong>지방기능경기대회 동메달</strong> · 웹 디자인 및 개발 부문 (2025)<br>💡 <strong>달빛연합 해커톤 융합상</strong> · 시각장애 보조 웨어러블 디바이스 팀 프로젝트 (2025)'
    },
    {
      keywords: ['연락', '이메일', '메일', 'email', '컨택', 'contact', '문의'],
      reply: '편하게 <strong>j01092014477@gmail.com</strong> 으로 연락 주세요. 위 정보 위젯의 이메일을 클릭하면 자동으로 복사됩니다 :)'
    },
    {
      keywords: ['인스타', 'sns', '소셜', 'instagram', '팔로우'],
      reply: '인스타그램 <strong>@jeonjaehyeon85</strong> 으로 오시면 일상과 작업물을 함께 보실 수 있어요.'
    },
    {
      keywords: ['github', '깃허브', '깃헙', '저장소', '레포'],
      reply: 'GitHub은 <strong>github.com/jjh090802</strong> 이에요. 위 GitHub Stats 위젯에서 잔디와 사용 언어 비율도 실시간으로 보실 수 있습니다.'
    },
    {
      keywords: ['지역', '어디', '사는', '거주', 'location', '대구'],
      reply: '대구광역시에 살고 있어요.'
    },
    {
      keywords: ['목표', '꿈', '미래', '하고싶', '하고 싶', '계획', '비전'],
      reply: '단기적으로는 <strong>사용자가 한 번 더 보고 싶은 인터페이스</strong>를 만드는 개발자가 되는 거예요. 장기적으로는 디자인 감각과 엔지니어링을 모두 갖춘 프로덕트 메이커로 성장해서, 제 손으로 처음부터 끝까지 만든 서비스로 사람들의 일상을 조금이라도 바꾸고 싶습니다.'
    },
    {
      keywords: ['강점', '장점', '잘하는', '특기', '자랑'],
      reply: '제 강점은 <strong>"디자인 감각이 있는 개발자"</strong>라는 점이에요. Figma로 직접 UI를 설계하고, 그걸 CSS와 JS로 픽셀 단위까지 옮기는 과정 전체를 혼자 책임질 수 있습니다. 그래서 디자이너-개발자 간 손실 없이 결과물을 만들 수 있어요.'
    },
    {
      keywords: ['약점', '단점', '부족', '못하는'],
      reply: '아직 <strong>대규모 백엔드 아키텍처</strong> 경험이 부족하다고 느껴요. 그래서 요즘은 단순 API 호출을 넘어, 데이터 모델링과 서버 설계를 의식적으로 학습하고 있습니다.'
    },
    {
      keywords: ['취미', '관심사', '좋아하는', '좋아함'],
      reply: '새로운 인터랙션이나 마이크로 애니메이션을 분석하는 걸 좋아해요. Awwwards나 Dribbble을 자주 보면서 "이건 어떻게 구현했을까?"를 뜯어보고 직접 따라 만들어보는 게 취미예요.'
    },
    {
      keywords: ['나이', '몇살', '몇 살', '학년'],
      reply: '고등학생 개발자입니다 (영남공업고 스마트소프트웨어과 재학 중).'
    },
    {
      keywords: ['이름', 'name', '본명'],
      reply: '제 이름은 <strong>전재현 (Jeon Jae Hyun)</strong> 입니다.'
    },
    {
      keywords: ['고마', '감사', '땡큐', 'thank', 'thanks'],
      reply: '저야말로 관심 가져 주셔서 감사합니다 🙇 더 궁금한 점 있으시면 언제든 물어봐 주세요!'
    },
    {
      keywords: ['잘가', '바이', '안녕히', 'bye', '잘 가'],
      reply: '와 주셔서 감사합니다! 좋은 하루 보내세요 :)'
    },

    // ---- 각 위젯의 역할 설명 ----
    {
      keywords: ['프로필 위젯', '프로필위젯', 'profile 위젯', '큰 카드', '왼쪽 큰'],
      reply: '<strong>Profile 위젯</strong>은 페이지 좌측 상단의 가장 큰 카드예요. 이름과 한 줄 자기소개로 "이 포트폴리오의 주인이 누구인지"를 가장 먼저 보여주는 역할을 합니다.'
    },
    {
      keywords: ['status 위젯', '스튜던트 뎁', '스튜던트', 'student dev', '상태 위젯', '뱃지'],
      reply: '<strong>Status 위젯</strong>은 제 현재 상태(Student Dev, 스마트소프트웨어과 재학)를 작은 뱃지처럼 보여줘요. 우측 상단의 깜빡이는 파란 점은 "활동 중"을 의미합니다.'
    },
    {
      keywords: ['info 위젯', '정보 위젯', '인포 위젯'],
      reply: '<strong>Info 위젯</strong>은 위치, 이메일, 인스타그램 같은 기본 연락처를 모아둔 카드예요. 이메일을 클릭하면 자동으로 클립보드에 복사됩니다.'
    },
    {
      keywords: ['stats 위젯', '스탯', '깃허브 스탯', 'github stats', '스탯 위젯', 'stats 위젯'],
      reply: '<strong>GitHub Stats 위젯</strong>은 GitHub API로 실시간 데이터를 불러와요. 공개 저장소 수, 받은 별 개수, 팔로워/팔로잉을 한 번에 확인할 수 있게 해주는 역할입니다.'
    },
    {
      keywords: ['selected works', 'works 위젯', '대표작 위젯', '프로젝트 위젯', '셀렉티드'],
      reply: '<strong>Selected Works 위젯</strong>은 자신 있게 보여드릴 수 있는 대표 프로젝트만 큐레이션해서 담아둔 영역이에요. 각 카드의 ↗ 버튼을 누르면 해당 GitHub 저장소로 이동합니다.'
    },
    {
      keywords: ['타임라인', 'timeline', 'background', '이력 위젯', '학력 위젯', 'awards 위젯', '백그라운드'],
      reply: '<strong>Background & Awards 위젯</strong>은 학력과 수상 이력을 시간순으로 정리한 타임라인이에요. 제가 어떤 길을 걸어왔는지 짧게 훑어볼 수 있게 해주는 역할입니다.'
    },
    {
      keywords: ['잔디', 'contribution graph', '컨트리뷰션', '기여도', '잔디밭', '잔디 위젯'],
      reply: '<strong>Contribution Graph 위젯</strong>은 지난 1년간 GitHub 일일 기여 활동을 잔디 형태로 시각화한 거예요. 꾸준한 개발 활동을 데이터로 보여주는 역할을 합니다.'
    },
    {
      keywords: ['top skills', '스킬 위젯', '언어 비율', '랭귀지 위젯', 'skills 위젯'],
      reply: '<strong>Top Skills 위젯</strong>은 제 GitHub 저장소들을 분석해 가장 많이 쓰는 상위 5개 언어를 비율 그래프로 보여줘요. "어떤 언어를 주로 다루는가"를 데이터 기반으로 알려주는 역할입니다.'
    },
    {
      keywords: ['gears', 'tools 위젯', '툴 위젯', '도구 위젯', '기어', '장비'],
      reply: '<strong>Gears & Tools 위젯</strong>은 평소 작업에 사용하는 언어와 도구(HTML, CSS, JavaScript, Python, C, VS Code, Git/GitHub, Notion 등)를 한 눈에 보여주는 카드예요.'
    },
    {
      keywords: ['방문록', 'guestbook', '게스트북', '방문록 위젯'],
      reply: '<strong>Guestbook 위젯</strong>은 방문해 주신 분들이 짧은 메시지를 남길 수 있는 공간이에요. "방문록 남기기" 버튼을 누르면 작성 페이지로 이동합니다.'
    },
    {
      keywords: ['위젯', 'widget', '카드들', '레이아웃', '대시보드', '구성', '벤토'],
      reply: '이 페이지는 <strong>벤토(bento) 그리드</strong> 레이아웃이라, 각 영역이 독립된 위젯으로 구성돼 있어요.<br><br>• <strong>Profile / Status / Info</strong> — 기본 소개와 연락처<br>• <strong>GitHub Stats / Top Skills / Contribution Graph</strong> — GitHub API 실시간 데이터<br>• <strong>Selected Works / Background & Awards</strong> — 대표 프로젝트와 이력<br>• <strong>Gears & Tools / Guestbook</strong> — 사용 도구와 방문록<br><br>특정 위젯 이름을 말씀해 주시면 더 자세히 설명드릴게요!'
    }
  ];

  const SUGGESTED_QUESTIONS = [
    '자기소개 해주세요',
    '가장 힘들었던 프로젝트는?',
    '달빛연합 해커톤에서 뭐했어요?',
    '사용하는 기술 스택은?',
    '이 위젯들은 뭐예요?',
    '수상 경력 알려주세요',
    '강점이 뭔가요?',
    '연락은 어떻게?'
  ];

  const FALLBACK = '음, 그 부분은 제가 미리 답변을 준비해 두지 못했어요 🥲<br>대신 <strong>j01092014477@gmail.com</strong> 으로 직접 연락주시면 자세히 답변드릴게요. 아래 추천 질문을 눌러보셔도 좋아요!';

  function normalize(text) {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function findReply(userText) {
    const text = normalize(userText);
    if (!text) return null;

    let bestScore = 0;
    let bestReply = null;
    for (const item of KNOWLEDGE) {
      let score = 0;
      for (const kw of item.keywords) {
        if (text.includes(kw.toLowerCase())) {
          score += kw.length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestReply = item.reply;
      }
    }
    return bestReply;
  }

  function appendMessage(html, type) {
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.innerHTML = html;
    MESSAGES.appendChild(div);
    MESSAGES.scrollTop = MESSAGES.scrollHeight;
    return div;
  }

  function appendTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    MESSAGES.appendChild(div);
    MESSAGES.scrollTop = MESSAGES.scrollHeight;
    return div;
  }

  let suggestionIndex = Math.floor(Math.random() * SUGGESTED_QUESTIONS.length);
  let suggestionTimer = null;

  function renderSuggestions() {
    SUGGESTIONS_EL.innerHTML = '';

    const label = document.createElement('span');
    label.className = 'suggestion-label';
    label.textContent = '💡 이렇게 물어보세요';
    SUGGESTIONS_EL.appendChild(label);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'suggestion-chip';
    btn.innerHTML = `<span class="suggestion-text">${escapeHtml(SUGGESTED_QUESTIONS[suggestionIndex])}</span><span class="suggestion-arrow" aria-hidden="true">↗</span>`;
    btn.addEventListener('click', () => {
      const txt = btn.querySelector('.suggestion-text');
      INPUT.value = txt ? txt.textContent : '';
      handleSubmit();
    });
    SUGGESTIONS_EL.appendChild(btn);
  }

  function rotateSuggestion() {
    const btn = SUGGESTIONS_EL.querySelector('.suggestion-chip');
    if (!btn) return;
    btn.classList.add('is-swapping');
    setTimeout(() => {
      suggestionIndex = (suggestionIndex + 1) % SUGGESTED_QUESTIONS.length;
      const txt = btn.querySelector('.suggestion-text');
      if (txt) txt.textContent = SUGGESTED_QUESTIONS[suggestionIndex];
      btn.classList.remove('is-swapping');
    }, 220);
  }

  function startSuggestionRotation() {
    if (suggestionTimer) return;
    suggestionTimer = setInterval(rotateSuggestion, 3500);
  }

  function stopSuggestionRotation() {
    if (!suggestionTimer) return;
    clearInterval(suggestionTimer);
    suggestionTimer = null;
  }

  function handleSubmit() {
    const raw = INPUT.value.trim();
    if (!raw) return;
    INPUT.value = '';
    appendMessage(escapeHtml(raw), 'user');

    const typing = appendTyping();
    const reply = findReply(raw) || FALLBACK;

    const delay = 500 + Math.min(800, reply.length * 6);
    setTimeout(() => {
      typing.remove();
      appendMessage(reply, 'bot');
    }, delay);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function openChat() {
    ROOT.classList.add('is-open');
    WINDOW_EL.setAttribute('aria-hidden', 'false');
    TOGGLE_BTN.setAttribute('aria-expanded', 'true');
    TOGGLE_BTN.setAttribute('aria-label', 'JH Bot 닫기');
    setTimeout(() => INPUT.focus(), 320);
    startSuggestionRotation();
    if (!MESSAGES.dataset.greeted) {
      MESSAGES.dataset.greeted = '1';
      setTimeout(() => {
        appendMessage('안녕하세요 👋 저는 <strong>전재현</strong>을 대신해 답변드리는 <strong>JH Bot</strong>이에요.', 'bot');
      }, 250);
      setTimeout(() => {
        appendMessage('이력, 프로젝트, 기술 스택, 연락처 등 무엇이든 편하게 물어봐 주세요. 아래 추천 질문을 눌러도 좋아요 :)', 'bot');
      }, 900);
    }
  }

  function closeChat() {
    ROOT.classList.remove('is-open');
    WINDOW_EL.setAttribute('aria-hidden', 'true');
    TOGGLE_BTN.setAttribute('aria-expanded', 'false');
    TOGGLE_BTN.setAttribute('aria-label', 'JH Bot 열기');
    stopSuggestionRotation();
  }

  TOGGLE_BTN.addEventListener('click', () => {
    if (ROOT.classList.contains('is-open')) closeChat();
    else openChat();
  });
  CLOSE_BTN.addEventListener('click', closeChat);

  FORM.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ROOT.classList.contains('is-open')) closeChat();
  });

  renderSuggestions();
})();
