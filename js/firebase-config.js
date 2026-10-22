// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Register a Web App in Project settings.
// 3. Copy the config values below from Firebase into this file.
// Firebase web config is not a password; secure access with Authentication and rules.
export const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

export const isFirebaseConfigured =
  !firebaseConfig.apiKey.startsWith("REPLACE_") &&
  !firebaseConfig.projectId.startsWith("REPLACE_") &&
  !firebaseConfig.appId.startsWith("REPLACE_");
