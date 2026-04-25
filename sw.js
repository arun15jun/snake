const CACHE_NAME = 'neon-hub-v8';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './splash.png',
  './snake/index.html',
  './snake/style.css',
  './snake/game.js',
  './2048/index.html',
  './2048/style.css',
  './2048/game.js',
  './flappy/index.html',
  './flappy/style.css',
  './flappy/game.js',
  './breakout/index.html',
  './breakout/style.css',
  './breakout/game.js',
  './tetris/index.html',
  './tetris/style.css',
  './tetris/game.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
