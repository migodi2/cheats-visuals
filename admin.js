/* ============================================
   ADMIN PANEL: requests list + approve to cards
   Uses Firebase callable functions for auth
   ============================================ */
(function(){
  var db = null;
  var functions = null;
  try {
    if(window.__firebaseConfig && window.__firebaseConfig.apiKey &&
       window.__firebaseConfig.apiKey.indexOf('ВСТАВЬ') === -1 && window.firebase){
      firebase.initializeApp(window.__firebaseConfig);
      db = firebase.firestore();
      functions = firebase.functions();
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
    var pass = passInput.value;
    if(!pass){ gateErr.textContent = 'Введите пароль'; return; }
    if(pass.length < 8){ gateErr.textContent = 'Минимум 8 символов'; return; }
    if(!functions){ gateErr.textContent = 'Firebase не подключён'; return; }

    var adminAuth = functions.httpsCallable('adminAuth');
    adminAuth({ password: pass }).then(function(result){
      if(result.data && result.data.ok && result.data.customToken){
        // Sign in with custom token so Firestore rules recognize us as admin
        return firebase.auth().signInWithCustomToken(result.data.customToken);
      }
      throw new Error('Auth failed');
    }).then(function(){
      unlock();
    }).catch(function(err){
      var msg = 'Неверный пароль';
      if(err && err.code === 'resource-exhausted') msg = 'Слишком много попыток. Подождите.';
      else if(err && err.code === 'failed-precondition') msg = 'Сервер не настроен';
      else if(err && err.code === 'permission-denied') msg = 'Неверный пароль';
      gateErr.textContent = msg;
    });
  });
  passInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') passBtn.click(); });

  function fmt(ts){
    if(!ts) return '';
    var d = new Date(ts);
    return d.toLocaleString('ru-RU');
  }

  function loadRequests(){
    if(!db){ reqList.textContent = 'Firebase не подключён (проверь firebase-config.js)'; return; }
    var first = true;
    var seen = {};
    db.collection('requests').orderBy('ts','desc').onSnapshot(function(snap){
      reqList.textContent = '';
      if(snap.empty){ reqList.textContent = 'заявок пока нет'; return; }
      snap.forEach(function(d){
        var r = d.data();
        if(!first && !seen[d.id]){
          // Telegram notifications handled by Cloud Functions trigger
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
      reqList.textContent = 'нет доступа к requests';
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
    if(!functions){ cfErr.textContent = 'Firebase не подключён'; return; }
    var cat = document.getElementById('cfCat').value;
    var ver = document.getElementById('cfVer').value.trim();
    var title = document.getElementById('cfTitle').value.trim();
    var link = document.getElementById('cfLink').value.trim();
    var tg = document.getElementById('cfTg').value.trim();
    var install = document.getElementById('cfInstall').value.trim() || 'Установка: закинуть .jar в папку mods.';
    if(!title){ cfErr.textContent = 'Укажи название'; return; }
    if(!link){ cfErr.textContent = 'Укажи ссылку на скачивание'; return; }

    var createCard = functions.httpsCallable('createCard');
    createCard({cat: cat, ver: ver, title: title, link: link, tg: tg, install: install})
    .then(function(result){
      if(result.data && result.data.ok){
        if(currentReqId){
          db.collection('requests').doc(currentReqId).delete().catch(function(){});
        }
        cardForm.hidden = true; currentReqId = null;
      } else {
        cfErr.textContent = 'Ошибка: неизвестная';
      }
    }).catch(function(e){
      cfErr.textContent = 'Ошибка: ' + (e && e.message ? e.message : e);
    });
  });
})();
