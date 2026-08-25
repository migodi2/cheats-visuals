/* ============================================
   ADMIN PANEL: requests list + approve to cards
   ============================================ */
(function(){
  var ADMIN_PASS = 'M1god1_S3cur3_2026!';            // смени на свой сложный пароль
  var ADMIN_TOKEN = 'f9Kv2pLx_84QwZtY7mR3sA1'; // совпадает с токеном в firestore.rules — не показывай никому

  var db = null;
  try {
    if(window.__firebaseConfig && window.__firebaseConfig.apiKey &&
       window.__firebaseConfig.apiKey.indexOf('ВСТАВЬ') === -1 && window.firebase){
      firebase.initializeApp(window.__firebaseConfig);
      db = firebase.firestore();
    }
  } catch(e){ db = null; }

  var gate = document.getElementById('gate');
  var passInput = document.getElementById('passInput');
  var passBtn = document.getElementById('passBtn');
  var gateErr = document.getElementById('gateErr');
  var panel = document.getElementById('panel');
  var reqList = document.getElementById('reqList');
  var cardForm = document.getElementById('cardForm');
  var cfErr = document.getElementById('cfErr');
  var currentReqId = null;

  function unlock(){
    gate.hidden = true;
    panel.hidden = false;
    loadRequests();
  }

  passBtn.addEventListener('click', function(){
    if(passInput.value === ADMIN_PASS){ unlock(); }
    else { gateErr.textContent = 'Неверный пароль'; }
  });
  passInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') passBtn.click(); });

  function fmt(ts){
    if(!ts) return '';
    var d = new Date(ts);
    return d.toLocaleString('ru-RU');
  }

  function loadRequests(){
    if(!db){ reqList.innerHTML = '<div class="empty">Firebase не подключён (проверь firebase-config.js)</div>'; return; }
    var first = true;
    var seen = {};
    function sendTgFallback(text){
      try{
        var t = window.__tg;
        if(!t || !t.bot || t.bot.indexOf('ВСТАВЬ') !== -1 || !t.chat || t.chat.indexOf('ВСТАВЬ') !== -1) return;
        var url = 'https://api.telegram.org/bot' + t.bot + '/sendMessage?chat_id=' + encodeURIComponent(t.chat) + '&text=' + encodeURIComponent(text);
        fetch(url, {mode:'no-cors', keepalive:true}).catch(function(){});
      }catch(e){}
    }
    db.collection('requests').orderBy('ts','desc').onSnapshot(function(snap){
      reqList.innerHTML = '';
      if(snap.empty){ reqList.innerHTML = '<div class="empty">заявок пока нет</div>'; return; }
      snap.forEach(function(d){
        var r = d.data();
        if(!first && !seen[d.id]){
          sendTgFallback('🔔 Новая заявка (резерв)\nОт: ' + (r.name||'гость') + '\n' + (r.text||''));
        }
        seen[d.id] = true;
        var item = document.createElement('div');
        item.className = 'req-item';
        var meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = 'от: ' + (r.name || 'гость') + '  •  ' + fmt(r.ts);
        var txt = document.createElement('div');
        txt.className = 'txt';
        txt.textContent = r.text || '';
        var acts = document.createElement('div');
        acts.className = 'acts';
        var ok = document.createElement('button');
        ok.className = 'btn-ok'; ok.textContent = 'Одобрить';
        ok.addEventListener('click', function(){ openCardForm(d.id, r); });
        var del = document.createElement('button');
        del.className = 'btn-del'; del.textContent = 'Удалить';
        del.addEventListener('click', function(){
          db.collection('requests').doc(d.id).delete().catch(function(){});
        });
        acts.appendChild(ok); acts.appendChild(del);
        item.appendChild(meta); item.appendChild(txt); item.appendChild(acts);
        reqList.appendChild(item);
      });
      first = false;
    }, function(){
      reqList.innerHTML = '<div class="empty">нет доступа к requests</div>';
    });
  }

  function openCardForm(reqId, req){
    currentReqId = reqId;
    cardForm.hidden = false;
    cfErr.textContent = '';
    document.getElementById('cfCat').value = 'cheats';
    document.getElementById('cfVer').value = '';
    document.getElementById('cfTitle').value = (req && req.text) ? req.text.slice(0,40) : '';
    document.getElementById('cfLink').value = '';
    document.getElementById('cfTg').value = '';
    document.getElementById('cfInstall').value = 'Установка: закинуть .jar в папку mods.';
    cardForm.scrollIntoView({ behavior:'smooth' });
  }

  document.getElementById('cfCancel').addEventListener('click', function(){
    cardForm.hidden = true; currentReqId = null;
  });

  document.getElementById('cfSave').addEventListener('click', function(){
    if(!db){ cfErr.textContent = 'Firebase не подключён'; return; }
    var cat = document.getElementById('cfCat').value;
    var ver = document.getElementById('cfVer').value.trim();
    var title = document.getElementById('cfTitle').value.trim();
    var link = document.getElementById('cfLink').value.trim();
    var tg = document.getElementById('cfTg').value.trim();
    var install = document.getElementById('cfInstall').value.trim() || 'Установка: закинуть .jar в папку mods.';
    if(!title){ cfErr.textContent = 'Укажи название'; return; }
    if(!link){ cfErr.textContent = 'Укажи ссылку на скачивание'; return; }

    db.collection('cards').add({
      cat: cat,
      ver: ver,
      title: title,
      link: link,
      tg: tg,
      install: install,
      token: ADMIN_TOKEN,
      ts: Date.now()
    }).then(function(){
      if(currentReqId){
        db.collection('requests').doc(currentReqId).delete().catch(function(){});
      }
      cardForm.hidden = true; currentReqId = null;
    }).catch(function(e){
      cfErr.textContent = 'Ошибка записи: ' + (e && e.message ? e.message : e);
    });
  });
})();
