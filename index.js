var http = require('http')
var https = require('https')
var url = require('url')
var StringDecoder = require('string_decoder').StringDecoder
var config = require('./lib/config')
var fs = require('fs')
var _data = require('./lib/data')
var handlers = require('./lib/handlers')
var helpers = require('./lib/helpers')

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
      'payload': helpers.perseJsonToObject(buffer)
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

var router = {
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks
}
