var http = require('http')
var https = require('https')
var url = require('url')
var StringDecoder = require('string_decoder').StringDecoder
var config = require('./config')
var fs = require('fs')
var _data = require('./lib/data')

_data.delete('test', 'newFile', function(err){
  console.log('this was the error', err)
})

var httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res)
})

httpServer.listen(config.httpPort, function () {
  console.log('This server is listening on port ' + config.httpPort)
})

var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}

var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res)
})

httpsServer.listen(config.httpsPort, function () {
  console.log('This server is listening on port ' + config.httpsPort)
})

var unifiedServer = function(req, res) {
  var parsedUrl = url.parse(req.url, true)
  var path = parsedUrl.pathname
  var trimedPath = path.replace(/^\/+|\/+$/g, '')
  var queryStringObject = parsedUrl.query
  var method = req.method.toLowerCase()
  var headers = req.headers
  var decoder = new StringDecoder('utf-8')
  var buffer = ''

  req.on('data', function (data) {
    buffer += decoder.write(data)
  })

  req.on('end', function () {
    buffer += decoder.end()
    var choosenHandler = typeof (router[trimedPath]) !== 'undefined' ? router[trimedPath] : handlers.notFound

    var data = {
      'trimedPath': trimedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    }

    choosenHandler(data, function (statusCode, payload) {
      statusCode = typeof (statusCode) === 'number' ? statusCode : '202'
      payload = typeof (payload) === 'object' ? payload : {}

      var payloadString = JSON.stringify(payload)
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)

      console.log('Returning this response ', statusCode, payloadString)
      console.log('Path: ' + trimedPath + ' Method: ' + method + ' Headers: ' + headers + ' Payload: ' + buffer)
    })
  })
}

var handlers = {}

handlers.ping = function (data, callBack) {
  callBack(200)
}

handlers.sample = function (data, callback) {
  callback(406, {'name': 'sample handler'})
}

handlers.hello = function (data, callback) {
  callback(406, {'name': 'Welcome to this Rest API'})
}

handlers.notFound = function (data, callback) {
  callback(404)
}

var router = {
  'sample': handlers.sample,
  'hello': handlers.hello,
  'ping': handlers.ping
}
