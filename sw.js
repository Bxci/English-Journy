/*
  sw.js — service worker for offline/installable PWA support.

  Two caches:
  - ej-shell-<version>: the app shell (HTML/CSS/JS/curriculum data) — precached on install by
    fetching index.html and regex-extracting every script/link src it loads, so this file never
    has to duplicate that list by hand and go stale.
  - ej-audio-v1: Piper-generated audio clips — NOT precached (there are thousands; see README §15
    on why the app never preloads them), only cached the first time each one is actually played,
    then served from cache on every later play (including fully offline).

  Bump CACHE_VERSION when shipping a change to any shell file so clients pick it up; old shell
  caches are deleted on activate. The audio cache is versioned separately since clip content
  doesn't change on every deploy.
*/
const CACHE_VERSION = "v5";
const CACHE_NAME = "ej-shell-" + CACHE_VERSION;
const AUDIO_CACHE = "ej-audio-v1";

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const files = new Set(["./", "index.html", "style.css", "manifest.webmanifest", "audio/manifest.json",
      "icons/icon-192.png", "icons/icon-512.png", "icons/icon-512-maskable.png"]);
    try {
      const html = await (await fetch("index.html")).text();
      const re = /(?:src|href)="([^"]+\.(?:js|css))"/g;
      let m;
      while ((m = re.exec(html))) files.add(m[1]);
    } catch (e) { /* offline install (re-install after an update) -> just use the hardcoded set above */ }
    await Promise.all(Array.from(files).map(f => cache.add(f).catch(() => { /* a missing/renamed file shouldn't block install */ })));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME && k !== AUDIO_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Audio clips: cache-first, cached lazily the first time each one plays.
  if (url.pathname.includes("/audio/clips/")) {
    event.respondWith((async () => {
      const cache = await caches.open(AUDIO_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const resp = await fetch(req);
        if (resp.ok) cache.put(req, resp.clone());
        return resp;
      } catch (e) {
        return cached || Response.error();
      }
    })());
    return;
  }

  // App shell + everything else same-origin: cache-first, top up the cache for anything new,
  // fall back to the cached index.html for navigations when fully offline and uncached.
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const resp = await fetch(req);
      if (resp.ok) { const cache = await caches.open(CACHE_NAME); cache.put(req, resp.clone()); }
      return resp;
    } catch (e) {
      return (await caches.match("index.html")) || Response.error();
    }
  })());
});
