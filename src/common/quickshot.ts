import { parse } from 'url';
import webshot from 'node-webshot';
import Jimp from 'jimp';

const webshotSettings = {
  // eslint-disable-line
  screenSize: {
    width: 1080,
    height: Math.floor((1080 * 9) / 16),
  },
  quality: 75,
  timeout: 60000,
  settings: {
    javascriptEnabled: false,
  },
};

const cache = {};
const cacheList = [];
const cacheLimit = 100;
const listenersLimit = 300;
const cacheTimeoutInterval = 10000; // 10 seconds

String.prototype.startsWith = function(str) {
  // eslint-disable-line
  return this.indexOf(str) === 0;
};

function handleError(cash, err) {
  if (!cash) {
    return;
  }
  if (cash.listeners instanceof Array) {
    cash.listeners.map(val => val(err));
  }
  cache[cash.hostpath] = null;
}

export const takeShot = url => {
  return new Promise((resolve, reject) => {
    makeShot(url, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

function makeShot(url, callback) {
  if (!url.startsWith('http') && !url.startsWith('//')) {
    url = '//' + url;
  }

  url = parse(url, true, true);

  const hostpath = url.host + (url.path || '/');
  let cash = cache[hostpath];

  if (cash && cash.data) {
    // url is cached
    console.log('responding from cache to: ' + hostpath);
    return callback(null, cash.data);
  } else {
    // url not cached
    if (cash) {
      // add listeners
      if (cash.listeners.length > listenersLimit) {
        // dont add over listener capacity
        return console.log('listener limit reached from: ' + hostpath);
      }
      return cash.listeners.push(callback);
    } else {
      cache[hostpath] = {
        hostpath: hostpath,
        url: url,
        data: null,
        listeners: [callback],
      };
      cash = cache[hostpath];

      // run webshot
      console.log('Webshooting: ' + hostpath);

      cacheList.push(cash);
      return webshot(hostpath, webshotSettings, function(err, renderStream) {
        if (err) {
          // kill the litener callbacks and reset the cache
          handleError(err, cash);
        } else {
          let buffer = '';

          // gather the data
          renderStream.on('data', function(data) {
            buffer += data.toString('binary');
          });

          // respond to all pending callbacks and update the cache with data
          renderStream.on('end', function() {
            Jimp.read(Buffer.from(buffer, 'binary'))
              .then(function(image) {
                if (!cash) {
                  return console.log('error on finished webshot - no cash');
                }

                console.log(
                  'responding on finished webshot to: %s for %s listeners',
                  cash.hostpath,
                  cash.listeners.length,
                );

                image
                  .cover(
                    640,
                    480,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_TOP,
                  )
                  .getBuffer(Jimp.MIME_JPEG, function(err, imageBuffer) {
                    if (err) {
                      return handleError(err, cash);
                    }

                    if (cash.listeners instanceof Array) {
                      cash.listeners.forEach(function(val, ind, arr) {
                        if (typeof val === 'function') {
                          val(null, imageBuffer);
                        }
                      });
                    }

                    cash.data = imageBuffer;
                    cash.listeners.length = 0;
                  });
              })
              .catch(function(err) {
                console.log('jimp error', err);

                handleError(err, cash);
              });
          });

          // kill the pending callbacks and reset the cache
          renderStream.on('error', function(err) {
            return handleError(err, cash);
          });
        }
      });
    }
  }
}

// clean cache every 10 seconds
let cacheTimeout = null;
function cleanCache() {
  if (cacheTimeout) {
    clearTimeout(cacheTimeout);
    cacheTimeout = null;
  }

  // clean cache
  if (cacheList.length > cacheLimit) {
    const removeList = cacheList.slice(cacheLimit);
    for (let i = 0; i < removeList.length; i++) {
      const cash = removeList[i];
      if (!cash) continue;
      if (cash.listeners instanceof Array) {
        cash.listeners.map(function(val, ind, arr) {
          if (typeof val === 'function') {
            val('Over capacity');
          }
        });
      }
      cache[cash.hostpath] = null;
    }
    console.log('%s items removed from cache', removeList.length);
    cacheList.length = cacheLimit;
  }

  console.log(
    'cacheTimeout rewinded. cache size: [%s/%s]',
    cacheList.length,
    cacheLimit,
  );
  cacheTimeout = setTimeout(cleanCache, cacheTimeoutInterval);
}
cleanCache();
