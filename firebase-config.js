/*
  firebase-config.js — fill this in with YOUR Firebase project's web config
  (Firebase console -> Project settings -> General -> Your apps -> Web app -> SDK setup and configuration).

  This file is safe to commit: Firebase web config values are public identifiers, not secrets.
  Real protection comes from Firestore security rules (see README "Cloud sync setup").

  Until you fill in a real apiKey below, cloud sync stays off and the app works exactly as
  before: 100% offline, localStorage only. Nothing breaks if you never touch this file.
*/
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
