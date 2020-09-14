importScripts("codegen.js");
importScripts("vendor/pouchdb.min.js");
let db = null;
self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
});

self.addEventListener('activate', () => {
  console.log('Script provider worker registered. Creating new db');
})

self.addEventListener('fetch', event => {
  handleRoutes(event);
});

function handleRoutes(event) {
  const { url, referrer, method } = event.request;
  const api = url.replace(referrer, '/');
  if (api === '/components' && method === 'POST') {
    event.respondWith(saveComponent(event.request))
  } else if (api === '/components' && method === 'GET') {
    event.respondWith(getComponents());
  } else if (api.startsWith('/generated/') && method === 'GET') {
    event.respondWith(getCodegenedFile(event.request));
  } else {
    event.respondWith(fetch(event.request));
  }
}

function getComponents() {
  if (!db) db = new PouchDB('components');
  return db.allDocs({ include_docs: true }).then(r => {
    return new Response(
      JSON.stringify(r.rows.map(row => row.doc)),
      {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/json; charset=UTF8'
        }
      }
    );
  });
}

function getCodegenedFile(request) {
  const { url, referrer } = request;
  const api = url.replace(referrer, '/');
  const modelname = api.replace('/generated/', '');
  if (!db) db = new PouchDB('components');
  return db.get(modelname).then(data => {
    return new Response(
      codegen(data.model),
      {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/javascript; charset=UTF-8'
        }
      }
    )
  });
}

function saveComponent(request) {
  return request.json().then(r => {
    const modelname = r.filename;
    const model = r.model;
    if (!db) db = new PouchDB('components');
    return db.put({
      _id: modelname,
      model
    })
    .then(() => {
      return new Response(
        '{}',
        {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json; charset=UTF-8'
          }
        }
      )
    })
  })
  .catch(e => {
    console.error(e);
  })

}