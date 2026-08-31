// Firebase client config — безопасно хранить в клиенте.
// Безопасность обеспечивается Firestore rules, а не скрытием конфига.
window.__firebaseConfig = {
  apiKey: "AIzaSyBasLD6wAvy-vyubJO3OL-0P6aewRtvG1A",
  authDomain: "cracksforminecraftmigodi2.firebaseapp.com",
  projectId: "cracksforminecraftmigodi2",
  storageBucket: "cracksforminecraftmigodi2.firebasestorage.app",
  messagingSenderId: "314685614184",
  appId: "1:314685614184:web:ec9b3f4ccc5e11b62d33dd"
};

// Telegram-уведомления теперь через Cloud Functions (серверная часть).
// Клиент НЕ должен хранить bot token или chat id.
