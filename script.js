
(function(){
  var intro = document.getElementById('intro');
  if(!intro) return;
  var removed = false;
  function removeIntro(){
    if(removed) return;
    removed = true;
    intro.classList.add('hide');
    setTimeout(function(){ intro.remove(); window.dispatchEvent(new Event('cfm:introDone')); }, 800);
  }
  intro.addEventListener('click', removeIntro);
  setTimeout(removeIntro, 4500);
})();

(function(){
  var title = document.querySelector('h1.title');
  if(!title) return;
  var text = title.textContent;
  title.textContent = '';
  text.split('').forEach(function(ch, i){
    var span = document.createElement('span');
    span.className = 'title-letter';
    if(ch === ' ') span.style.width = '0.3em';
    else span.textContent = ch;
    span.style.animationDelay = (i * 0.08) + 's';
    title.appendChild(span);
  });
})();

  const translations = {
    ru: {
      tab_cheats: 'Читы',
      tab_visuals: 'Визуалы',
      tab_mods: 'Моды',
      tab_respacks: 'Ресурспаки',
      tab_updates: 'Обновления',
      cheats_title: 'Читы для клиентов',
      visuals_title: 'Визуалы',
      mods_title: 'Моды',
      respacks_title: 'Ресурспаки',
      dl: 'Скачать',
      beta_note: 'release 1.0',
      disclaimer: 'Мы не несём ответственности. Все материалы скачиваются из других исходников.',
      empty_note: 'Раздел пока пуст — добавьте свои карточки по образцу выше.',
      search_ph: 'Поиск читов…',
      reg_sub: 'Придумай логин — без пароля и почты',
      reg_login_label: 'Логин',
      reg_login_ph: 'твой ник',
      reg_challenge_label: 'Подтверди, что ты не бот',
      reg_answer_ph: 'ответ',
      reg_submit: 'Зарегаться',
      profile_stat_visits: 'Визитов',
      profile_stat_days: 'Дней',
      profile_stat_last: 'Последний визит',
      profile_info_created: 'Создан',
      profile_info_last: 'Последний заход',
      profile_change: 'Сменить ник',
      profile_logout: 'Выйти',
      guest_name: 'гость',
    },
    en: {
      tab_cheats: 'Cheats',
      tab_visuals: 'Visuals',
      tab_mods: 'Mods',
      tab_respacks: 'Resource Packs',
      tab_updates: 'Updates',
      cheats_title: 'Cheats for clients',
      visuals_title: 'Visuals',
      mods_title: 'Mods',
      respacks_title: 'Resource Packs',
      dl: 'Download',
      beta_note: 'release 1.0',
      disclaimer: 'We are not responsible. All materials are downloaded from other sources.',
      empty_note: 'This section is empty — add your own cards like above.',
      search_ph: 'Search cheats…',
      reg_sub: 'Pick a login — no password, no email',
      reg_login_label: 'Login',
      reg_login_ph: 'your nickname',
      reg_challenge_label: 'Prove you are not a bot',
      reg_answer_ph: 'answer',
      reg_submit: 'Register',
      profile_stat_visits: 'Visits',
      profile_stat_days: 'Days',
      profile_stat_last: 'Last seen',
      profile_info_created: 'Created',
      profile_info_last: 'Last visit',
      profile_change: 'Change nick',
      profile_logout: 'Log out',
      guest_name: 'guest',
    }
  };
  let currentLang = 'ru';
  function applyLang(lang){
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.getElementById('langSwitch').textContent = lang === 'ru' ? 'RU / EN' : 'EN / RU';
  }
  document.getElementById('langSwitch').addEventListener('click', ()=>{
    applyLang(currentLang === 'ru' ? 'en' : 'ru');
    if(window.__refreshRegText) window.__refreshRegText();
    if(window.__refreshProfile) window.__refreshProfile();
  });
  applyLang('ru');
  window.applyLang = applyLang;



  const cards = document.querySelectorAll('.card');
  cards.forEach(card=>{
    let cur = { x:0, y:0, l:0, s:1 };
    let tgt = { x:0, y:0, l:0, s:1 };
    let running = false;
    var glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .3s ease;z-index:1;overflow:hidden;';
    var glowDot = document.createElement('div');
    glowDot.style.cssText = 'position:absolute;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(255,180,50,0.4) 0%,rgba(255,120,50,0.18) 35%,transparent 70%);transform:translate(-50%,-50%);pointer-events:none;filter:blur(25px);';
    glow.appendChild(glowDot);
    card.appendChild(glow);
    function lerp(a, b, t){ return a + (b - a) * t; }
    function animate(){
      ['x','y','l','s'].forEach(function(k){
        cur[k] = lerp(cur[k], tgt[k], 0.12);
      });
      const settled =
        Math.abs(cur.x - tgt.x) < 0.05 &&
        Math.abs(cur.y - tgt.y) < 0.05 &&
        Math.abs(cur.l - tgt.l) < 0.3 &&
        Math.abs(cur.s - tgt.s) < 0.002;
      if(settled && tgt.l === 0){
        card.style.transform = '';
        running = false;
        return;
      }
      card.style.transform = `translateY(${cur.l}px) perspective(600px) rotateX(${-cur.y}deg) rotateY(${cur.x}deg) scale(${cur.s})`;
      requestAnimationFrame(animate);
    }
    function start(){
      if(!running){ running = true; requestAnimationFrame(animate); }
    }
    card.addEventListener('click', (e)=>{
      if(e.target.closest('.dl-btn')) return;
      const wasSelected = card.classList.contains('selected');
      cards.forEach(c=>c.classList.remove('selected'));
      if(!wasSelected) card.classList.add('selected');
    });
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const x = mx / r.width;
      const y = my / r.height;
      tgt.x = (x - 0.5) * 18;
      tgt.y = (0.5 - y) * 18;
      tgt.l = -16;
      tgt.s = 1.05;
      glow.style.opacity = '1';
      glowDot.style.left = mx + 'px';
      glowDot.style.top = my + 'px';
      start();
    });
    card.addEventListener('mouseleave', ()=>{
      tgt.x = 0; tgt.y = 0; tgt.l = 0; tgt.s = 1;
      glow.style.opacity = '0';
      start();
    });
  });



  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  const OUT_MS = 220;

  (function(){
    document.querySelectorAll('.ver-filter').forEach(function(bar){
      var gridId = bar.getAttribute('data-grid');
      var grid = document.getElementById(gridId);
      if(!grid) return;
      var cards = Array.from(grid.querySelectorAll('.card'));
      bar.addEventListener('click', function(e){
        var btn = e.target.closest('.ver-btn');
        if(!btn) return;
        bar.querySelectorAll('.ver-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        var ver = btn.getAttribute('data-ver');
        cards.forEach(function(c){
          var match = ver === 'all' || c.getAttribute('data-ver') === ver;
          c.style.display = match ? '' : 'none';
        });
      });
    });
  })();

  function animateCardsOut(panel){
    const panelCards = panel.querySelectorAll('.card');
    const dirs = [
      {x:-120,y:-80,r:-25,s:0.5},
      {x:120,y:-60,r:20,s:0.6},
      {x:-80,y:100,r:30,s:0.4},
      {x:100,y:80,r:-20,s:0.5},
      {x:0,y:-120,r:15,s:0.55},
      {x:-140,y:0,r:-30,s:0.45},
      {x:140,y:20,r:25,s:0.5},
    ];
    panelCards.forEach((c, i)=>{
      const d = dirs[i % dirs.length];
      c.style.transition = 'opacity .25s ease, transform .3s cubic-bezier(.55,.06,.68,.19), filter .25s ease';
      c.style.opacity = '0';
      c.style.transform = `translateX(${d.x}px) translateY(${d.y}px) rotate(${d.r}deg) scale(${d.s})`;
      c.style.filter = 'brightness(2) blur(3px)';
    });
  }

  function animateCardsIn(panel){
    const panelCards = panel.querySelectorAll('.card');
    const inDirs = [
      {x:60,y:90,r:12},
      {x:-50,y:80,r:-15},
      {x:70,y:-70,r:18},
      {x:-80,y:-60,r:-10},
      {x:40,y:100,r:8},
      {x:-60,y:70,r:-20},
      {x:90,y:-50,r:14},
    ];
    panelCards.forEach((c, i)=>{
      const d = inDirs[i % inDirs.length];
      c.style.opacity = '0';
      c.style.transform = `translateX(${d.x}px) translateY(${d.y}px) rotate(${d.r}deg) scale(0.6)`;
      c.style.filter = 'brightness(0.2) blur(4px)';
      setTimeout(()=>{
        c.style.transition = 'opacity .55s cubic-bezier(.23,1,.32,1), transform .6s cubic-bezier(.23,1,.32,1), filter .5s ease';
        c.style.opacity = '1';
        c.style.transform = 'translateY(0) rotate(0deg) scale(1)';
        c.style.filter = '';
        setTimeout(()=>{
          c.style.transition = '';
          c.style.transform = '';
          c.style.opacity = '';
          c.style.filter = '';
        }, 650);
      }, 30 + i * 40);
    });
  }

  buttons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(btn.classList.contains('active')) return;

      const current = document.querySelector('.tab-panel.active');
      const next = document.getElementById(btn.dataset.tab);
      if(current === next) return;

      buttons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      try { localStorage.setItem('cfm_activeTab', btn.dataset.tab); } catch(e){}

      var nextRevealEls = next.querySelectorAll('.scroll-reveal');
      nextRevealEls.forEach(function(el){ el.classList.remove('visible'); });

      if(current){
        animateCardsOut(current);
        current.classList.remove('active');
        current.classList.add('leaving');
        setTimeout(()=>{
          current.classList.remove('leaving');
          next.classList.add('active');
          animateCardsIn(next);
          if(window.refreshScrollReveal) window.refreshScrollReveal();
        }, 220);
      } else {
        next.classList.add('active');
        animateCardsIn(next);
        if(window.refreshScrollReveal) window.refreshScrollReveal();
      }
    });
  });

  const initialPanel = document.querySelector('.tab-panel.active');
  if(initialPanel) animateCardsIn(initialPanel);

  const cheatsSearch = document.getElementById('cheatsSearch');
  const cheatsGrid = document.getElementById('cheatsGrid');
  const visualsGrid = document.getElementById('visualsGrid');
  const modsGrid = document.getElementById('modsGrid');
  const respacksGrid = document.getElementById('respacksGrid');
  if(cheatsSearch && cheatsGrid){
    const allSearchCards = Array.from(cheatsGrid.querySelectorAll('.card')).concat(
      visualsGrid ? Array.from(visualsGrid.querySelectorAll('.card')) : [],
      modsGrid ? Array.from(modsGrid.querySelectorAll('.card')) : [],
      respacksGrid ? Array.from(respacksGrid.querySelectorAll('.card')) : []
    );
    let noResultsEl = null;
    cheatsSearch.addEventListener('input', ()=>{
      const q = cheatsSearch.value.trim().toLowerCase();
      let visible = 0;
      allSearchCards.forEach(card=>{
        const title = card.querySelector('h3');
        const version = card.querySelector('.version-pill');
        const text = (title ? title.textContent : '') + ' ' + (version ? version.textContent : '');
        const match = !q || text.toLowerCase().includes(q);
        card.style.display = match ? '' : 'none';
        if(match) visible++;
      });
      if(!noResultsEl){
        noResultsEl = document.createElement('div');
        noResultsEl.className = 'no-results';
        noResultsEl.textContent = 'Ничего не найдено';
      }
      if(visible === 0){
        if(!noResultsEl.parentNode) cheatsGrid.appendChild(noResultsEl);
      } else if(noResultsEl.parentNode){
        noResultsEl.parentNode.removeChild(noResultsEl);
      }
    });
  }



  (function(){
    var toggle = document.getElementById('themeToggle');
    var panel = document.getElementById('themePanel');
    var closeBtn = document.getElementById('themePanelClose');
    var btns = panel.querySelectorAll('.theme-btn');
    var root = document.documentElement;

    var themeAnimTimer = null;
    function applyTheme(t, instant){
      if(instant){
        applyThemeVars(t);
        return;
      }
      document.documentElement.classList.add('theme-transition');
      clearTimeout(themeAnimTimer);
      themeAnimTimer = setTimeout(function(){
        document.documentElement.classList.remove('theme-transition');
      }, 700);
      applyThemeVars(t);
    }
    function applyThemeVars(t){
      root.style.setProperty('--bg', t.bg);
      root.style.setProperty('--card', t.card);
      root.style.setProperty('--card-border', t.border);
      root.style.setProperty('--accent', t.accent);
      root.style.setProperty('--accent-2', t.accent2);
      root.style.setProperty('--text', t.text);
      root.style.setProperty('--text-dim', t.dim);
      root.style.setProperty('--pill', t.card);
      root.style.setProperty('--glow', t.glow);
      root.style.setProperty('--glow2', t.glow2);
      document.documentElement.style.background = t.bg;
      document.body.style.background = t.bg;
      document.body.style.color = t.text;
    }

    var saved = localStorage.getItem('siteTheme');
    if(saved){
      var t = JSON.parse(saved);
      applyTheme(t, true);
      btns.forEach(function(b){
        var d = JSON.parse(b.dataset.theme);
        b.classList.toggle('active', d.accent === t.accent);
      });
    }

    toggle.addEventListener('click', function(){
      panel.classList.toggle('open');
    });
    closeBtn.addEventListener('click', function(){
      panel.classList.remove('open');
    });

    btns.forEach(function(btn){
      btn.addEventListener('click', function(){
        var t = JSON.parse(this.dataset.theme);
        applyTheme(t);
        localStorage.setItem('siteTheme', JSON.stringify(t));
        btns.forEach(function(b){ b.classList.remove('active'); });
        this.classList.add('active');
      });
    });

    var customInput = document.getElementById('customAccent');
    var customApply = document.getElementById('customApply');
    if(customApply){
      customApply.addEventListener('click', function(){
        var hex = customInput.value;
        var r = parseInt(hex.substr(1,2),16);
        var g = parseInt(hex.substr(3,2),16);
        var b = parseInt(hex.substr(5,2),16);
        var accent2r = Math.min(255,r+30);
        var accent2g = Math.min(255,g+30);
        var accent2b = Math.min(255,b+30);
        var t = {
          bg:'#050508', card:'#0c0c14',
          border:'rgba('+r+','+g+','+b+',0.08)',
          accent:hex,
          accent2:'#'+((1<<24)+(accent2r<<16)+(accent2g<<8)+accent2b).toString(16).slice(1),
          text:'#e0f0f8', dim:'#556870',
          glow:'rgba('+r+','+g+','+b+',0.04)',
          glow2:'rgba('+r+','+g+','+b+',0.01)'
        };
        applyTheme(t);
        localStorage.setItem('siteTheme', JSON.stringify(t));
        btns.forEach(function(b){ b.classList.remove('active'); });
      });
    }

    var fontBtns = panel.querySelectorAll('.theme-font-btn');
    var savedFont = localStorage.getItem('siteFont');
    if(savedFont){
      document.body.style.fontFamily = savedFont === 'inherit' ? '' : savedFont;
      fontBtns.forEach(function(b){ b.classList.toggle('active', b.dataset.font === savedFont); });
    }
    fontBtns.forEach(function(btn){
      btn.addEventListener('click', function(){
        var f = this.dataset.font;
        document.body.style.fontFamily = f === 'inherit' ? '' : f;
        localStorage.setItem('siteFont', f);
        fontBtns.forEach(function(b){ b.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  })();

  (function(){
    var ACCOUNT_KEY = 'cfm_account';
    var SEEN_KEY = 'cfm_seen_reg';

    var trigger = document.getElementById('profileTrigger');
    var overlay = document.getElementById('profileOverlay');
    var card = document.getElementById('profileCard');
    var closeBtn = document.getElementById('profileClose');
    var cardAvatar = document.getElementById('profileCardAvatar');
    var cardName = document.getElementById('profileCardName');
    var visitsEl = document.getElementById('profileVisits');
    var daysEl = document.getElementById('profileDays');
    var lastSeenEl = document.getElementById('profileLastSeen');
    var createdEl = document.getElementById('profileCreated');
    var lastVisitEl = document.getElementById('profileLastVisit');
    var uploadBtn = document.getElementById('profileUploadBtn');
    var fileInput = document.getElementById('profileFile');
    var avatar = document.getElementById('profileAvatar');
    var changeNameBtn = document.getElementById('profileChangeName');
    var logoutBtn = document.getElementById('profileLogout');

    var regOverlay = document.getElementById('regOverlay');
    var regUsername = document.getElementById('regUsername');
    var regAnswer = document.getElementById('regAnswer');
    var regChallengeQ = document.getElementById('regChallengeQ');
    var regChallengeRefresh = document.getElementById('regChallengeRefresh');
    var regError = document.getElementById('regError');
    var regSubmit = document.getElementById('regSubmit');
    var regClose = document.getElementById('regClose');
    var regTitle = document.getElementById('regTitle');

    var challengeAnswer = null;
    var editing = false;

    function getAccount(){
      try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY)) || null; } catch(e){ return null; }
    }
    function saveAccount(a){ localStorage.setItem(ACCOUNT_KEY, JSON.stringify(a)); }
    function formatDate(ts){
      if(!ts) return '—';
      var d = new Date(ts);
      return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear();
    }
    function daysBetween(a,b){ return Math.floor(Math.abs(b-a)/86400000); }
    function t(key){ return (translations[currentLang] && translations[currentLang][key]) ? translations[currentLang][key] : (translations.ru[key] || ''); }

    function renderAvatar(){
      var acc = getAccount();
      [avatar, cardAvatar].forEach(function(el){
        if(!el) return;
        if(!acc || !acc.avatar){
          el.style.backgroundImage = 'none';
          el.style.backgroundSize = '';
          el.style.backgroundPosition = '';
          el.style.backgroundRepeat = '';
          var initials = (acc && acc.username) ? acc.username.slice(0,2).toUpperCase() : '?';
          el.textContent = initials;
        } else {
          el.style.backgroundImage = "url('"+acc.avatar+"')";
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
          el.style.backgroundRepeat = 'no-repeat';
          el.textContent = '';
        }
      });
    }

    function renderProfile(){
      var acc = getAccount();
      var regOpenBtn = document.getElementById('regOpenBtn');
      if(!acc){
        if(cardName) cardName.textContent = t('guest_name');
        if(regOpenBtn) regOpenBtn.textContent = currentLang === 'ru' ? 'войти' : 'login';
        renderAvatar();
        return;
      }
      if(cardName) cardName.textContent = acc.username;
      if(regOpenBtn) regOpenBtn.textContent = currentLang === 'ru' ? 'профиль' : 'profile';
      var now = Date.now();
      if(visitsEl) visitsEl.textContent = acc.visits || 1;
      if(daysEl) daysEl.textContent = daysBetween(acc.created, now);
      if(lastSeenEl) lastSeenEl.textContent = formatDate(acc.lastVisit);
      if(createdEl) createdEl.textContent = formatDate(acc.created);
      if(lastVisitEl) lastVisitEl.textContent = formatDate(acc.lastVisit);
      renderAvatar();
    }

    function newChallenge(){
      var a = Math.floor(Math.random()*9)+1;
      var b = Math.floor(Math.random()*9)+1;
      var q, ans;
      if(Math.random() < 0.5){ q = a+' + '+b; ans = a+b; }
      else { if(a < b){ var tmp = a; a = b; b = tmp; } q = a+' − '+b; ans = a-b; }
      challengeAnswer = ans;
      if(regChallengeQ) regChallengeQ.textContent = q+' = ?';
      if(regAnswer) regAnswer.value = '';
    }

    function showErr(msg){
      if(!regError) return;
      regError.textContent = msg;
      regError.classList.add('show');
    }

    function openReg(isEdit){
      editing = !!isEdit;
      if(regError){ regError.textContent = ''; regError.classList.remove('show'); }
      newChallenge();
      if(editing){
        var a = getAccount();
        if(regUsername) regUsername.value = a ? a.username : '';
        if(regTitle) regTitle.textContent = currentLang === 'ru' ? 'Смена ника' : 'Change nick';
        if(regSubmit) regSubmit.textContent = currentLang === 'ru' ? 'Сохранить' : 'Save';
      } else {
        if(regUsername) regUsername.value = '';
        if(regTitle) regTitle.textContent = currentLang === 'ru' ? 'Регистрация' : 'Register';
        if(regSubmit) regSubmit.textContent = t('reg_submit');
      }
      if(regOverlay){
        regOverlay.hidden = false;
        requestAnimationFrame(function(){ regOverlay.classList.add('open'); });
      }
      setTimeout(function(){ if(regUsername) regUsername.focus(); }, 60);
    }
    function closeReg(){
      if(!regOverlay) return;
      regOverlay.classList.remove('open');
      setTimeout(function(){
        regOverlay.hidden = true;
        if(!getAccount()) localStorage.setItem(SEEN_KEY, '1');
      }, 400);
    }

    function submitReg(){
      var name = regUsername.value.trim();
      var ans = regAnswer.value.trim();
      if(name.length < 3){ showErr(currentLang === 'ru' ? 'Логин минимум 3 символа' : 'Nickname min 3 chars'); return; }
      if(name.length > 20){ showErr(currentLang === 'ru' ? 'Логин максимум 20 символов' : 'Nickname max 20 chars'); return; }
      if(!/^[a-zA-Zа-яА-ЯёЁ0-9_]+$/.test(name)){ showErr(currentLang === 'ru' ? 'Только буквы, цифры и _' : 'Letters, numbers and _ only'); return; }
      if(ans === '' || parseInt(ans,10) !== challengeAnswer){ showErr(currentLang === 'ru' ? 'Неверный ответ в примере' : 'Wrong answer'); return; }
      var acc = getAccount();
      var isNew = !acc;
      if(!acc) acc = { created: Date.now(), visits: 0, avatar: null, lastVisit: Date.now() };
      acc.username = name;
      if(isNew){ acc.created = Date.now(); acc.visits = 1; acc.lastVisit = Date.now(); }
      else { acc.lastVisit = Date.now(); }
      saveAccount(acc);
      localStorage.setItem(SEEN_KEY, '1');
      closeReg();
      renderProfile();
    }

    var acc = getAccount();
    if(acc){
      acc.visits = (acc.visits || 0) + 1;
      acc.lastVisit = Date.now();
      saveAccount(acc);
    }
    renderProfile();
    function maybeOpenReg(){ if(!getAccount() && !localStorage.getItem(SEEN_KEY)) openReg(false); }
    if(!acc && !localStorage.getItem(SEEN_KEY)){
      window.addEventListener('cfm:introDone', maybeOpenReg, { once: true });
    }

    function openCard(){
      card.hidden = false; overlay.hidden = false;
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ card.classList.add('open'); overlay.classList.add('open'); }); });
    }
    function closeCard(){
      card.classList.remove('open'); overlay.classList.remove('open');
      setTimeout(function(){ card.hidden = true; overlay.hidden = true; }, 400);
    }

    trigger.addEventListener('click', function(e){
      e.stopPropagation();
      if(!getAccount()){ openReg(false); return; }
      if(card.classList.contains('open')) closeCard(); else openCard();
    });
    overlay.addEventListener('click', closeCard);
    closeBtn.addEventListener('click', closeCard);
    document.addEventListener('keydown', function(e){
      if(e.key !== 'Escape') return;
      if(card.classList.contains('open')) closeCard();
      else if(regOverlay && regOverlay.classList.contains('open')) closeReg();
    });

    uploadBtn.addEventListener('click', function(){ fileInput.click(); });
    fileInput.addEventListener('change', function(){
      var file = fileInput.files && fileInput.files[0];
      if(!file) return;
      var reader = new FileReader();
      reader.onload = function(){
        var img = new Image();
        img.onload = function(){
          var size = 256;
          var canvas = document.createElement('canvas');
          canvas.width = size; canvas.height = size;
          var ctx = canvas.getContext('2d');
          var side = Math.min(img.width, img.height);
          ctx.drawImage(img, (img.width-side)/2, (img.height-side)/2, side, side, 0, 0, size, size);
          var a = getAccount();
          if(!a) return;
          a.avatar = canvas.toDataURL('image/jpeg', 0.85);
          try { saveAccount(a); } catch(e){ showErr(currentLang === 'ru' ? 'Не удалось сохранить аватарку' : 'Failed to save avatar'); return; }
          renderProfile();
          fileInput.value = '';
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

    if(changeNameBtn) changeNameBtn.addEventListener('click', function(){ closeCard(); openReg(true); });
    if(logoutBtn) logoutBtn.addEventListener('click', function(){
      localStorage.removeItem(ACCOUNT_KEY);
      localStorage.removeItem(SEEN_KEY);
      closeCard();
      renderProfile();
      openReg(false);
    });

    if(regSubmit) regSubmit.addEventListener('click', submitReg);
    if(regClose) regClose.addEventListener('click', closeReg);
    if(regChallengeRefresh) regChallengeRefresh.addEventListener('click', newChallenge);
    if(regOverlay) regOverlay.addEventListener('click', function(e){ if(e.target === regOverlay) closeReg(); });
    if(regUsername) regUsername.addEventListener('keydown', function(e){ if(e.key === 'Enter') submitReg(); });
    if(regAnswer) regAnswer.addEventListener('keydown', function(e){ if(e.key === 'Enter') submitReg(); });

    var regOpenBtn = document.getElementById('regOpenBtn');
    if(regOpenBtn) regOpenBtn.addEventListener('click', function(){
      if(getAccount()){
        openCard();
      } else {
        openReg(false);
      }
    });

    window.__refreshRegText = function(){
      if(regOverlay && regOverlay.classList.contains('open')){
        regTitle.textContent = editing ? (currentLang === 'ru' ? 'Смена ника' : 'Change nick') : (currentLang === 'ru' ? 'Регистрация' : 'Register');
        regSubmit.textContent = editing ? (currentLang === 'ru' ? 'Сохранить' : 'Save') : t('reg_submit');
      }
    };
    window.__refreshProfile = renderProfile;
  })();

(function(){
  var els = document.querySelectorAll('.card, .respack-card, .advantages-note, .cheats-note, h2.section-title, .search-box');
  els.forEach(function(el, i){ el.classList.add('scroll-reveal', 'd'+((i%4)+1)); });
  if(!('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('visible'); });
    return;
  }
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, {threshold:0.15});
  els.forEach(function(el){ obs.observe(el); });

  window.refreshScrollReveal = function(){
    var newEls = document.querySelectorAll('.tab-panel.active .scroll-reveal:not(.visible)');
    newEls.forEach(function(el){ obs.observe(el); });
  };
})();

/* ============================================
   FIREBASE: comments, download counters, requests
   ============================================ */
(function(){
  var db = null;
  try {
    if(window.__firebaseConfig && window.__firebaseConfig.apiKey &&
       window.__firebaseConfig.apiKey.indexOf('ВСТАВЬ') === -1 && window.firebase){
      firebase.initializeApp(window.__firebaseConfig);
      db = firebase.firestore();
    }
  } catch(e){ db = null; }

  function slug(el){
    var h = el.querySelector('h3');
    return (h ? h.textContent : 'card').trim().toLowerCase().replace(/[^a-z0-9а-я]+/gi,'_');
  }

  function sendTg(text){
    try {
      var t = window.__tg;
      if(!t || !t.bot || t.bot.indexOf('ВСТАВЬ') !== -1 || !t.chat || t.chat.indexOf('ВСТАВЬ') !== -1) return;
      var url = 'https://api.telegram.org/bot' + t.bot +
        '/sendMessage?chat_id=' + encodeURIComponent(t.chat) +
        '&text=' + encodeURIComponent(text);
      fetch(url, {mode:'no-cors', keepalive:true}).catch(function(){});
    } catch(e){}
  }

  var tgSvg = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M21.05 2.93 2.6 10.2c-1.24.5-1.23 1.19-.23 1.5l4.72 1.47 1.83 5.6c.22.6.11.84.75.84.5 0 .72-.23 1-.5l2.4-2.33 4.79 3.54c.88.49 1.52.24 1.74-.82L22.9 4.3c.32-1.3-.5-1.88-1.85-1.37Zm-3.1 3.6L9.2 13.3l-.35 3.63-1.7-5.2 10.8-6.8c.5-.3.96-.14.58.19Z"></path></svg>';

  function buildCard(c, docId){
    var card = document.createElement('div');
    card.className = 'card';
    if(docId) card.setAttribute('data-cardid', docId);
    if(c.ver) card.setAttribute('data-ver', c.ver);
    var h3 = document.createElement('h3');
    h3.textContent = c.title || 'Без названия';
    var footer = document.createElement('div');
    footer.className = 'card-footer';
    var pill = document.createElement('span');
    pill.className = 'version-pill';
    pill.textContent = c.ver || '';
    var dl = document.createElement('a');
    dl.className = 'dl-btn';
    dl.setAttribute('download', '');
    dl.setAttribute('data-i18n', 'dl');
    if(c.link) dl.href = c.link;
    footer.appendChild(pill);
    footer.appendChild(dl);
    if(c.tg){
      var tg = document.createElement('a');
      tg.className = 'tg-btn';
      tg.href = c.tg;
      tg.target = '_blank';
      tg.rel = 'noopener';
      tg.setAttribute('aria-label', 'Telegram');
      tg.innerHTML = tgSvg;
      footer.appendChild(tg);
    }
    var inst = document.createElement('p');
    inst.className = 'card-install';
    inst.textContent = c.install || '';
    card.appendChild(h3);
    card.appendChild(footer);
    card.appendChild(inst);
    return card;
  }

  function enhanceCard(card){
    if(card.dataset.enhanced) return;
    card.dataset.enhanced = '1';
    var id = slug(card);
    var extra = document.createElement('div');
    extra.className = 'card-extra';
    extra.innerHTML =
      '<span class="card-downloads" title="Скачиваний">⬇ <b class="dl-count">…</b></span>' +
      '<button class="comment-toggle" type="button">💬 <b class="cm-count">0</b></button>' +
      '<div class="comment-panel">' +
        '<div class="comment-list"></div>' +
        '<div class="comment-form">' +
          '<input class="comment-input" maxlength="280" placeholder="Написать…">' +
          '<button class="comment-send" type="button">➤</button>' +
        '</div>' +
      '</div>';
    card.appendChild(extra);

    var panel = extra.querySelector('.comment-panel');
    var list = extra.querySelector('.comment-list');
    var input = extra.querySelector('.comment-input');
    var send = extra.querySelector('.comment-send');
    var cmCount = extra.querySelector('.cm-count');
    var dlCount = extra.querySelector('.dl-count');

    extra.querySelector('.comment-toggle').addEventListener('click', function(e){
      e.stopPropagation();
      panel.classList.toggle('open');
      if(panel.classList.contains('open')) input.focus();
    });

    function loadComments(){
      if(!db){ list.innerHTML = '<div class="comment-empty">комменты недоступны</div>'; return; }
      db.collection('comments').doc(id).collection('items').orderBy('ts','asc').onSnapshot(function(snap){
        list.innerHTML = '';
        cmCount.textContent = snap.size;
        if(snap.empty){ list.innerHTML = '<div class="comment-empty">пока нет комментов</div>'; return; }
        snap.forEach(function(d){
          var d2 = d.data();
          var item = document.createElement('div');
          item.className = 'comment-item';
          item.innerHTML = '<div class="comment-name"></div><div class="comment-text"></div>';
          item.querySelector('.comment-name').textContent = d2.name || 'гость';
          item.querySelector('.comment-text').textContent = d2.text || '';
          list.appendChild(item);
        });
        panel.scrollTop = panel.scrollHeight;
      });
    }
    function loadCount(){
      if(!db){ dlCount.textContent = '—'; return; }
      db.collection('counters').doc(id).onSnapshot(function(d){
        dlCount.textContent = d.exists ? (d.data().count || 0) : 0;
      });
    }
    loadComments();
    loadCount();

    function addComment(){
      var text = input.value.trim();
      if(!text || !db) return;
      var name = (localStorage.getItem('cfm_account') ? JSON.parse(localStorage.getItem('cfm_account')).username : '') || 'гость';
      db.collection('comments').doc(id).collection('items').add({
        name: name.slice(0,24), text: text.slice(0,280), ts: Date.now()
      }).then(function(){ input.value = ''; }).catch(function(){});
    }
    send.addEventListener('click', addComment);
    input.addEventListener('keydown', function(e){ if(e.key === 'Enter') addComment(); });

    var dl = card.querySelector('.dl-btn');
    if(dl){
      dl.addEventListener('click', function(){
        if(!db) return;
        var ref = db.collection('counters').doc(id);
        ref.get().then(function(d){
          ref.set({ count: (d.exists ? (d.data().count||0) : 0) + 1 }, { merge: true });
        }).catch(function(){});
      });
    }
  }

  // --- Enhance static cards ---
  document.querySelectorAll('.grid .card').forEach(enhanceCard);

  // --- Admin-approved cards from Firestore ---
  if(db){
    db.collection('cards').onSnapshot(function(snap){
      snap.forEach(function(d){
        var c = d.data();
        var grid = document.getElementById((c.cat || 'cheats') + 'Grid');
        if(!grid) return;
        if(grid.querySelector('[data-cardid="' + d.id + '"]')) return;
        var card = buildCard(c, d.id);
        grid.appendChild(card);
        enhanceCard(card);
        if(window.applyLang) window.applyLang(document.documentElement.lang || 'ru');
      });
    });
  }

  // --- Request modal ---
  var reqOverlay = document.getElementById('reqOverlay');
  var reqOpen = document.getElementById('reqOpenBtn');
  var reqClose = document.getElementById('reqClose');
  var reqSubmit = document.getElementById('reqSubmit');
  var reqUser = document.getElementById('reqUsername');
  var reqText = document.getElementById('reqText');
  var reqError = document.getElementById('reqError');

  function openReq(){
    if(!reqOverlay) return;
    reqOverlay.hidden = false;
    requestAnimationFrame(function(){ reqOverlay.classList.add('open'); });
  }
  function closeReq(){
    if(!reqOverlay) return;
    reqOverlay.classList.remove('open');
    setTimeout(function(){ reqOverlay.hidden = true; }, 400);
  }
  if(reqOpen) reqOpen.addEventListener('click', openReq);
  if(reqClose) reqClose.addEventListener('click', closeReq);
  if(reqOverlay) reqOverlay.addEventListener('click', function(e){ if(e.target === reqOverlay) closeReq(); });
  if(reqSubmit) reqSubmit.addEventListener('click', function(){
    var name = (reqUser ? reqUser.value.trim() : '') || 'гость';
    var text = reqText ? reqText.value.trim() : '';
    if(text.length < 2){ if(reqError) reqError.textContent = 'Опиши подробнее'; if(reqError) reqError.classList.add('show'); return; }
    if(db){
      db.collection('requests').add({ name: name.slice(0,24), text: text.slice(0,280), ts: Date.now() })
        .then(function(){
          closeReq(); reqText.value='';
          sendTg('🔔 Новая заявка на сайте\nОт: ' + name + '\n' + text);
        })
        .catch(function(){ if(reqError) reqError.textContent='Не удалось отправить'; if(reqError) reqError.classList.add('show'); });
    } else {
      if(reqError) reqError.textContent='Сначала настрой Firebase (apiKey)'; if(reqError) reqError.classList.add('show');
    }
  });
})();

