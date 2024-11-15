//Asignar nombre y versión al caché

const CACHE_NAME = 'v1_cache_s';

//Archivos a guardar

var urlsToCache = [
    './Icons/facebook.png',
    './IMG/Fondo.jpg',
    './',
    './styles/styles.css',
    './input.css',
    './jquery.js',
    './main.js',
    '/manifest.json',
    './package-lock.json',
    './package.json',
    './sw.js',
    './tailwind.config.js'
];

//Install - Instalación del SW
self.addEventListener('install', e => {      
    e.waitUntil(
        caches.open(CACHE_NAME)   
        .then(cache => {
            cache.addAll(urlsToCache) 
            .then(() =>{
                self.skipWaiting();
            })
        })
        .catch(err => {
            console.log('El becario borró la base de datos!', err);
        })
    )
});

//Activar

self.addEventListener('activate', e =>{
    const cacheWhitelist = [CACHE_NAME]
    e.waitUntil(
        caches.keys()
        .then(cacheNames =>{
            return Promise.all(
                cacheNames.map(cacheName =>{
                    if(cacheWhitelist.indexOf(cacheName) == -1){
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            self.clients.claim();
        })
    );
})

//Fetch

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request)
        .then(response => {
            // Si hay respuesta en caché, devuelve esa
            if (response) {
                return response;
            }
            // Intenta obtener la respuesta de la red
            return fetch(e.request)
                .then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    // Clona y guarda la respuesta en la caché
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(e.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(err => {
                    console.error('Error en la solicitud de red:', err);
                    // Retorna un mensaje de error o una respuesta de respaldo en caso de fallo
                    return new Response('Contenido no disponible', {
                        status: 404,
                        statusText: 'Contenido no disponible'
                    });
                });
        })
        .catch(err => {
            console.error('Error al buscar en caché:', err);
            // Retorna una respuesta de error si fallan tanto la caché como la red
            return new Response('Error en la conexión', {
                status: 500,
                statusText: 'Error en la conexión'
            });
        })
    );
});

