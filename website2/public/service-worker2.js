//cachestorage名称，可以加上版本号予以区分
const OFFLINE_CACHE_PREFIX = 'offline_page2_';
const CACHE_VERSION = 'v1.0';
const OFFLINE_CACHE_NAME = OFFLINE_CACHE_PREFIX + CACHE_VERSION;

//Service Worker安装事件，其中可以预缓存资源
this.addEventListener('install', function(event) {
  
  //需要缓存的页面资源
  var urlsToPrefetch = [
    './test.html',
    './test2.html',
    './zhaopin-logo.png',
    './test.css',
    './test.js',
  ];

  event.waitUntil(
    caches.open(OFFLINE_CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToPrefetch);
    })
  );      
});
 
//Service Worker激活事件
this.addEventListener('activate', function(event) {
  //在激活事件中清除非当前版本的缓存避免用户存储空间急剧膨胀
  event.waitUntil(caches.keys().then(function(cacheNames) {
    return Promise.all(cacheNames.map(function(cacheName) {
        if (cacheName !== OFFLINE_CACHE_NAME) {
          if(cacheName.indexOf(OFFLINE_CACHE_PREFIX) != -1) {
            return caches.delete(cacheName);
          }
        }
    }));
  }));
});
   
var addToCache = function(req) {
  return fetch(req.clone()).then(function(resp) {
    var cacheResp = resp.clone();
    if (resp.status !== 200 || (resp.type !== 'basic' && resp.type !== 'cors')) {
      return resp;
    }
    caches.open(OFFLINE_CACHE_NAME).then(function(cache) {
      cache.put(req.clone(), cacheResp);
    })
    return resp;
  })
}

//Service Worker 请求拦截事件
this.addEventListener('fetch', function(event)  {
  var req, url;
  url = event.request.url;
  if (url.indexOf('cors=1') !== -1) {
    req = new Request(url, {mode: 'cors'});
  } else {
    req = event.request.clone();
  }

  event.respondWith(
    caches.open(OFFLINE_CACHE_NAME).then(function(cache) {
      return cache.match(event.request.url);
    }).then(function(response){
      //response为空表明未匹配成功，交由fetch方法去网络拉取
      if(response) {
        return response;
      }
      return addToCache(req);
    })
  ); 
});