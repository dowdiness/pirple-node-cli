var http = require('http')
var url = require('url')
var StringDecoder = require('string_decoder').StringDecoder
var server = http.createServer(function (req, res) {
  var parsedUrl = url.parse(req.url, true)

  var path = parsedUrl.pathname

  var method = req.method
  var headers = req.headers
  var decoder = new StringDecoder('utf-8')
  var buffer = ''

  req.on('data', function (data) {
    buffer += decoder.write(data)
  })

  req.on('end', function () {
    buffer += decoder.end()

    res.end('Hello world!\n')

    console.log('Path: ' + path + 'Method: ' + method + ' Headers: ' + headers + 'Payload: ' + buffer)
  })
})

server.listen(3000, function () {
  console.log('This server is listening on port 3000 now')
})