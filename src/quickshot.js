var Url = require( 'url' )
const fs = require('fs');
var webshot = require( 'webshot' )
var Jimp = require( 'jimp' )
var Crawler = require( 'js-crawler' )
var DomParser = require( 'dom-parser' )

var webshotSettings = { // eslint-disable-line
  screenSize: {
    width: 1080,
    height: Math.floor( 1080 * 9 / 16 )
  },
  quality: 75,
  timeout: 60000,
  settings: {
    javascriptEnabled: false
  }
}

var cache = {}
var cacheList = []
var cacheLimit = 100
var listenersLimit = 300
var cacheTimeoutInterval = 10000 // 10 seconds

String.prototype.startsWith = function ( str ) { // eslint-disable-line
  return this.indexOf( str ) === 0
}

function handleError (cash, err) {
  if (!cash) { return; }
  if (cash.listeners instanceof Array) { 
    cash.listeners.map(val => val(err));
  }
  cache[cash.hostpath] = null
}

function get(url, callback) {
  if (!url.startsWith('http') && !url.startsWith('//')) {
    url = '//' + url
  }

  url = Url.parse(url, true, true);

  const hostpath = (url.host + (url.path || '/' ));
  let cash = cache[hostpath];

  if (cash && cash.data ) { // url is cached
    console.log('responding from cache to: ' + hostpath)
    return callback(null, cash.data);
  } else { // url not cached
    if (cash) {
      // add listeners
      if (cash.listeners.length > listenersLimit) {
        // dont add over listener capacity
        return console.log( 'listener limit reached from: ' + hostpath )
      }
      console.log( 'adding a pending listener to: ' + hostpath )
      return cash.listeners.push( callback )
    } else {
      cache[ hostpath ] = {
        hostpath: hostpath,
        url: url,
        data: null,
        listeners: [ callback ]
      }
      cash = cache[hostpath];

      // run webshot
      console.log( 'Webshooting: ' + hostpath )

      cacheList.push( cash )
      return webshot( hostpath, webshotSettings, function ( err, renderStream ) {
        if ( err ) {
          // kill the litener callbacks and reset the cache
          handleError( err, cash )
        } else {
          var buffer = ''

          // gather the data
          renderStream.on( 'data', function ( data ) {
            buffer += data.toString( 'binary' )
          } )

          // respond to all pending callbacks and update the cache with data
          renderStream.on( 'end', function () {
            Jimp.read( Buffer.from( buffer, 'binary' ) )
            .then( function ( image ) {

              if ( !cash ) {
                return console.log( 'error on finished webshot - no cash' )
              }

              console.log(
                'responding on finished webshot to: %s for %s listeners',
                cash.hostpath, cash.listeners.length
              )

              image
              .cover( 192, 108, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_TOP )
              .getBuffer( Jimp.MIME_JPEG, function ( err, imageBuffer ) {
                if ( err ) {
                  return handleError( err, cash )
                }

                if ( cash.listeners instanceof Array ) {
                  cash.listeners.forEach( function ( val, ind, arr ) {
                    if ( typeof ( val ) === 'function' )
                    { val( null, imageBuffer ) }
                  } )
                }

                cash.data = imageBuffer
                cash.listeners.length = 0
              } )
            } )
            .catch( function ( err ) {
              console.log( 'jimp error', err)

              handleError( err, cash )
            } )
          } )

          // kill the pending callbacks and reset the cache
          renderStream.on( 'error', function ( err ) {
            return handleError( err, cash )
          } )
        }
      } )
    }
  }
}

// clean cache every 10 seconds
var cacheTimeout = null
function cleanCache () {
  if ( cacheTimeout ) {
    clearTimeout( cacheTimeout )
    cacheTimeout = null
  }

  // clean cache
  if ( cacheList.length > cacheLimit ) {
    var removeList = cacheList.slice( cacheLimit )
    for ( var i = 0; i < removeList.length; i++ ) {
      var cash = removeList[ i ]
      if ( !cash ) continue
      if ( cash.listeners instanceof Array )
      { cash.listeners.map( function ( val, ind, arr ) {
        if ( typeof ( val ) === 'function' )
        { val( 'Over capacity' ) }
      } ) }
      cache[ cash.hostpath ] = null
    }
    console.log( '%s items removed from cache', removeList.length )
    cacheList.length = cacheLimit
  }

  console.log( 'cacheTimeout rewinded. cache size: [%s/%s]', cacheList.length, cacheLimit )
  cacheTimeout = setTimeout( cleanCache, cacheTimeoutInterval )
}
cleanCache()

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}

function removeSpecials(str) {
    var lower = str.toLowerCase();
    var upper = str.toUpperCase();

    var res = "";
    for(var i=0; i<lower.length; ++i) {
        if(lower[i] != upper[i] || lower[i].trim() === '')
            res += str[i];
    }
    return res;
}

async function fetchTitle(url) {
  const parser = new DomParser();
  const titlePromise = new Promise((resolve, reject) => {
    new Crawler()
    .configure({ depth: 1 })
    .crawl(url, page => {
      const dom = parser.parseFromString(page.content)
      let title = dom.getElementsByTagName("title");
      if (title && title.length >= 1) {
        title = title[0].textContent
      } else if (title === null || title.length === 0) {
        title = "no title"
      } 
      resolve(removeSpecials(title));
    }),
    err => reject(err)
  });
  return titlePromise;
};

module.exports = {
  get: get,
  base64_encode,
  fetchTitle
}
