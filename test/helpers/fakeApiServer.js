import fs from 'fs'
import path from 'path'
import http from 'http'
import assign from 'fast.js/object/assign' // faster object.assign

export function docHandlerHelper (doc, req, res) {
  let content = JSON.stringify(doc)
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content)
  })
  res.end(content)
}

function modelHandler (req, res) {
  let filePath = './input/model.stl'
  let fullPath = path.resolve(filePath)
  let stat = fs.statSync(fullPath)

  res.writeHead(200, {
    'Content-Type': 'application/sla',
    'Content-Length': stat.size
  })
  let readStream = fs.createReadStream(fullPath)
  readStream.pipe(res)
}

function model3mfHandler (req, res) {
  let filePath = './input/cube_gears.3mf'
  let fullPath = path.resolve(filePath)
  let stat = fs.statSync(fullPath)

  res.writeHead(200, {
    'Content-Type': 'application/sla',
    'Content-Length': stat.size
  })
  let readStream = fs.createReadStream(fullPath)
  readStream.pipe(res)
}

function handleRequest (handlers, req, res) {
  let url = req.url
  let handler = handlers[url]
  // console.log("url",url, "handler",handler)
  handler(req, res)
}

export default function makeServer (PORT, cb, handlers = {}) {
  let defaultHandlers = {
    '/v1/data/model.stl': modelHandler,
    '/v1/data/cube_gears.3mf': model3mfHandler
  }
  handlers = assign({}, defaultHandlers, handlers)

  let requestHandler = handleRequest.bind(null, handlers)
  let server = http.createServer(requestHandler)

  server.listen(PORT, 'localhost', function () {
    console.log('Server listening on: http://localhost:%s', PORT)
    if (cb) {
      cb()
    }
  })
  return server
}
