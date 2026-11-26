const C='kss-v6',A=['./','index.html','app.js','style.css','manifest.webmanifest','img/hero.jpg','img/broiler.jpg','img/kuroiler.jpg','img/clean.jpg','img/vaccine.jpg','img/grow.jpg','img/day28.jpg','img/icon-192.png','img/icon-512.png','img/icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(A.map(u=>c.add(u).catch(()=>0)))));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
// network-first (updates arrive when online), cache fallback (opens offline). The fetch handler is required for Chrome install.
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||!r.url.startsWith(self.location.origin))return;
  e.respondWith(Promise.race([fetch(r).then(n=>{if(n.ok){const cp=n.clone();caches.open(C).then(c=>c.put(r,cp))}return n}),new Promise((_,j)=>setTimeout(()=>j(new Error('slow')),4000))]).catch(()=>caches.match(r).then(x=>x||caches.match('index.html'))))});
