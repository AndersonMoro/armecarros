
const CACHE_NAME = 'armecarros-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/historico.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/auth.js',
  '/js/vehicleStorage.js',
  '/js/camera.js',
  '/js/historico.js',
  '/js/logo-handler.js',
  '/js/app.js',
  '/attached_assets/branca.png',
  '/attached_assets/LOGO CARROS-01.png',
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Instalar o service worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retorna o cache se encontrado
        if (response) {
          return response;
        }
        
        // Clona a requisição
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          function(response) {
            // Verifica se é uma resposta válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(function() {
          // Fallback para página offline se necessário
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
    );
});

// Atualizar cache
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
