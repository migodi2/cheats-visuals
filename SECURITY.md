# Защита сайта от взлома (anti-hack)

Этот документ — единое руководство по защите сайта. Сайт работает как статическая
страница на Firebase (хостинг + Firestore) и аутентифицирует посетителей через
**анонимный вход Firebase**. Защита реализуется **правилами Firestore** (работают
на сервере Firebase, их невозможно обойти клиентом) и соответствующей логикой в `script.js`.

## Почему сайт взламывали

Раньше статус «владелец» выдавался по `localStorage`-сессии + токену, секрет которого
был **вшит в JavaScript**. Любой мог подделать токен, стать «владельцем» и записать
в документ `meta/banned` прямо из браузера — баня других или себя, очищая чат,
записывая произвольные данные. Правила Firestore были открыты.

## Архитектура защиты

1. **Анонимный вход.** В `script.js` каждый посетитель вызывает
   `firebase.auth().signInAnonymously()`. Благодаря этому каждый клиент получает
   настоящий UID Firebase — `request.auth.uid` в правилах больше не пустой.
2. **Allowlist админов.** Кто может выполнять админские действия (писать баны,
   удалять сообщения, очищать чат) — решается по единственному документу:
   `meta/admins { uids: ["<UID_владельца>"] }`. Документ создаётся
   **владельцем один раз в консоли Firebase** и больше не меняется клиентом
   (правило `allow write: if false`).
3. **Надёжные правила Firestore** (см. ниже) требуют аутентификацию для всех
   записей, строго проверяют схему полей и допускают опасные операции только админу.

## Правила Firestore — `firestore.rules`

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthed() { return request.auth != null && request.auth.token != null; }

    // Владелец / модератор — его Firebase UID есть в meta/admins.uids.
    function isAdmin() {
      return isAuthed()
        && exists(/databases/$(database)/documents/meta/admins)
        && get(/databases/$(database)/documents/meta/admins).data.uids.hasAny([request.auth.uid]);
    }

    // ---- Чат ----
    match /messages/{messageId} {
      allow read: if true;
      allow create: if isAuthed()
        && request.resource.data.keys().hasAll(['name','text','ts','uid'])
        && request.resource.data.keys().hasOnly(['name','text','ts','uid','avatar','timeLabel'])
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0 && request.resource.data.name.size() <= 30
        && request.resource.data.name.toLowerCase() != 'migodi'
        && request.resource.data.text is string
        && request.resource.data.text.size() > 0 && request.resource.data.text.size() <= 1000
        && request.resource.data.uid is string && request.resource.data.uid.size() <= 40
        && (
          !exists(/databases/$(database)/documents/meta/banned)
          || !get(/databases/$(database)/documents/meta/banned).data.names
               .toSet().hasAny([request.resource.data.name.toLowerCase()])
        );
      allow update, delete: if isAdmin();
    }

    // ---- Баны: читают все, пишут ТОЛЬКО админы ----
    match /meta/banned {
      allow read: if true;
      allow write: if isAdmin();
    }

    // ---- Реестр имён -> uid ----
    match /meta/usernames {
      allow read: if true;
      allow create, update: if isAdmin() || (isAuthed()
        && request.resource.data.keys().hasOnly(['map'])
        && request.resource.data.map is map
        && request.resource.data.map.size() <= 500
        && !request.resource.data.map.keys().hasAny(['migodi']));
      allow delete: if isAdmin();
    }

    // ---- Счётчик uid ----
    match /meta/uidCounter {
      allow read: if true;
      allow create, update: if isAuthed()
        && request.resource.data.keys().hasOnly(['last'])
        && request.resource.data.last is int
        && request.resource.data.last >= 0 && request.resource.data.last <= 999999999;
      allow delete: if false;
    }

    // ---- Журнал действий ----
    match /meta/auditLog/entries/{entryId} {
      allow read: if true;
      allow create: if isAuthed()
        && request.resource.data.keys().hasOnly(['action','target','by','ts','fp'])
        && request.resource.data.action is string && request.resource.data.action.size() <= 40
        && request.resource.data.target is string && request.resource.data.target.size() <= 120
        && request.resource.data.by is string && request.resource.data.by.size() <= 40
        && request.resource.data.fp is string && request.resource.data.fp.size() <= 40;
      allow update, delete: if false;
    }

    // ---- Allowlist админов (только чтение своего, писать нельзя) ----
    match /meta/admins {
      allow read: if isAuthed();
      allow write: if false;
    }
  }
}
```

## Конфиг — `firebase.json`

```json
{
  "firestore": { "rules": "firestore.rules" },
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json","firestore.rules",".firebaserc","*.md"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [{
      "source": "**",
      "headers": [
        { "name": "X-Content-Type-Options", "value": "nosniff" },
        { "name": "X-Frame-Options", "value": "DENY" },
        { "name": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }]
  }
}
```

## Конфиг проекта — `.firebaserc`

```json
{ "projects": ["cracksforminecraftmigodi2"] }
```

## Пошаговая установка

1. Установить Firebase CLI (один раз):
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. В консоли Firebase → **Auth → Sign-in method** включить **Anonymous**.
3. Задеплоить правила и хостинг:
   ```bash
   cd "/путь/к/проекту"
   firebase deploy --only firestore:security,hosting
   ```
4. Создать стартовые документы в **Firestore → Data → коллекция `meta`**:
   - `banned` → `{}` (пусто);
   - `admins` → `{ "uids": ["<ВАШ_Firebase_UID>"] }`;
   - `usernames` → `{ "map": { "migodi": 1 } }`;
   - `uidCounter` → `{ "last": 1 }`.
   Ваш UID берётся из **Auth → Users** после одного входа на сайт
   (он появится в колонке `uid`).
5. Очистить данные после взлома: удалить злонамеренные записи в
   `meta/banned` и спам в `messages` через тот же экран Data.

## Что изменилось в `script.js`

- После `firebase.initializeApp` вызывается `firebase.auth().signInAnonymously()`
  (локальная persistence) — каждый посетитель получает UID.
- `safeIsOwner()` больше не использует вшитый секрет и `localStorage`-токен.
  Владелец определяется по allowlist: читается `meta/admins` и проверяется,
  есть ли `request.auth.uid` в массиве `uids` (переменная `cfmIsAdmin`).
- Удалено «саморазрешение» `meta/usernames.set({migodi: 1})` при входе — теперь
  `migodi: 1` запишет админ через консоль (правила запрещают клиенту писать ключ `migodi`).

## Примечание

Косметика в конце `script.js` (`siteProtection`: блоки右键/Ctrl+U) — это лишь
отвлечение для обычных посетителей. **Настоящая защита — правила Firestore**:
никто не может записать бан или удалить чат, не будучи перечисленным в `meta/admins`,
даже подменив клиентский код.
