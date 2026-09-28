/*
  auth.js — optional cloud account + sync layer, built on Firebase Auth + Firestore.

  Fully optional and feature-detected: if window.FIREBASE_CONFIG still has the placeholder
  apiKey (see firebase-config.js), or the Firebase SDK scripts fail to load (e.g. offline),
  EJAuth.enabled is false and the app runs exactly as before — localStorage only, no network.

  Exposes window.EJAuth = {
    enabled,                         // bool: is cloud sync configured & SDK loaded?
    get user(),                      // current firebase user or null
    onChange(cb),                    // cb(user|null) on every auth state change (incl. initial)
    signUpEmail(email, pass),        // -> Promise<user>
    signInEmail(email, pass),        // -> Promise<user>
    signInGoogle(),                  // -> Promise<user>
    signInX(),                       // -> Promise<user>   (X / Twitter)
    signOut(),                       // -> Promise<void>
    loadCloudState(uid),             // -> Promise<object|null>
    saveCloudState(uid, state),      // debounced write, fire-and-forget
    ERROR_HE,                        // firebase error code -> Hebrew message
  }
*/
(function (root) {
  const cfg = root.FIREBASE_CONFIG || {};
  const configured = !!(cfg.apiKey && cfg.apiKey !== "YOUR_API_KEY" && cfg.projectId && cfg.projectId !== "YOUR_PROJECT_ID");
  const sdkLoaded = !!(root.firebase && root.firebase.initializeApp);
  const enabled = configured && sdkLoaded;

  let app = null, auth = null, db = null;
  if (enabled) {
    try {
      app = root.firebase.initializeApp(cfg);
      auth = root.firebase.auth();
      db = root.firebase.firestore();
    } catch (e) { /* misconfigured project -> stay disabled */ }
  }
  const live = enabled && auth && db;

  const ERROR_HE = {
    "auth/email-already-in-use": "כבר יש חשבון עם האימייל הזה. נסי להתחבר במקום להירשם.",
    "auth/invalid-email": "כתובת האימייל לא תקינה.",
    "auth/weak-password": "הסיסמה חלשה מדי (לפחות 6 תווים).",
    "auth/wrong-password": "סיסמה שגויה.",
    "auth/user-not-found": "לא נמצא חשבון עם האימייל הזה.",
    "auth/invalid-credential": "אימייל או סיסמה שגויים.",
    "auth/too-many-requests": "יותר מדי נסיונות. נסי שוב בעוד כמה דקות.",
    "auth/popup-closed-by-user": "החלון נסגר לפני שהתחברת.",
    "auth/network-request-failed": "אין חיבור לאינטרנט כרגע.",
  };

  function wrap(promise) {
    return promise.then(cred => cred.user).catch(e => { throw Object.assign(new Error(ERROR_HE[e.code] || e.message), { code: e.code }); });
  }

  let saveTimer = null;
  function saveCloudState(uid, state) {
    if (!live || !uid) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      db.collection("users").doc(uid).set({ state: JSON.stringify(state), updatedAt: Date.now() }, { merge: true }).catch(() => { /* offline / transient -> next save will retry */ });
    }, 1500);
  }

  function loadCloudState(uid) {
    if (!live || !uid) return Promise.resolve(null);
    return db.collection("users").doc(uid).get().then(snap => {
      if (!snap.exists) return null;
      const data = snap.data();
      try { return { state: JSON.parse(data.state), updatedAt: data.updatedAt || 0 }; } catch (e) { return null; }
    }).catch(() => null);
  }

  root.EJAuth = {
    enabled: live,
    get user() { return live ? auth.currentUser : null; },
    onChange(cb) { if (live) auth.onAuthStateChanged(cb); else setTimeout(() => cb(null), 0); },
    signUpEmail(email, pass) { return wrap(auth.createUserWithEmailAndPassword(email, pass)); },
    signInEmail(email, pass) { return wrap(auth.signInWithEmailAndPassword(email, pass)); },
    signInGoogle() { return wrap(auth.signInWithPopup(new root.firebase.auth.GoogleAuthProvider())); },
    signInX() { return wrap(auth.signInWithPopup(new root.firebase.auth.TwitterAuthProvider())); },
    signOut() { return live ? auth.signOut() : Promise.resolve(); },
    loadCloudState,
    saveCloudState,
    ERROR_HE,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
