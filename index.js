const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();

// Заполни через: firebase functions:config:set tg.bot="ВСТАВЬ_BOT_TOKEN" tg.chat="ВСТАВЬ_CHAT_ID"
// Либо пропиши значения прямо сюда (ниже).
const BOT_TOKEN = (functions.config().tg && functions.config().tg.bot) || 'ВСТАВЬ_BOT_TOKEN';
const CHAT_ID = (functions.config().tg && functions.config().tg.chat) || 'ВСТАВЬ_CHAT_ID';

// Уведомление в Telegram при новой заявке «попросить чит»
exports.notifyRequest = functions.firestore
  .document('requests/{id}')
  .onCreate((snap) => {
    const d = snap.data();
    const msg = '🔔 Новая заявка на сайте\nОт: ' + (d.name || 'гость') + '\n' + (d.text || '');
    const url = 'https://api.telegram.org/bot' + BOT_TOKEN +
      '/sendMessage?chat_id=' + encodeURIComponent(CHAT_ID) +
      '&text=' + encodeURIComponent(msg) +
      '&parse_mode=HTML';
    return fetch(url).then(() => null).catch(() => null);
  });
