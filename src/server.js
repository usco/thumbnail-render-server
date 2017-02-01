import fs from 'fs'
import path from 'path'

import express from 'express'

import tmp from 'tmp'
import { throwError, of } from 'most'

import { getArgs } from './utils/args'
import { run } from './utils/run'
import rmDir from './utils/rmDir'

// setup environemental variables
require('env2')(path.resolve(__dirname, '../.env'))
// ///////deal with command line args etc
let params = getArgs()


function sendBackFile (workdir, response, filePath) {
  let fullPath = path.resolve(filePath)
  // console.log("sending back image data",fullPath)
  let stat = fs.statSync(fullPath)

  response.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': stat.size
  })

  let readStream = fs.createReadStream(filePath)
  /*readStream.on('finish',function(){
    console.log("done streaming")
  })*/ // does not work

  // Add this to ensure that the file descriptor is closed in case of error.
  response.on('error', function (err) {
    readStream.end()
  })

  response.on('finish', function () {
    // console.log("done with response, removing folder", workdir)
    rmDir(workdir)
  })

  readStream.pipe(response)
}

const defaults = {
  port: 2210,
  testMode: undefined,
  login: undefined,
  password: undefined
}
params = Object.assign({}, defaults, params)

const {port, testMode, login, password} = params

// ///////////////
// start up server
var formidable = require('express-formidable')
let app = express()
// app.use(bodyParser.raw())
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
const workdirBase = './tmp'
if (!fs.existsSync(workdirBase)) {
  fs.mkdirSync(workdirBase)
}

app.use(formidable({multiples: false, uploadDir: workdirBase}))

app.post('/', function (req, res) {
  //console.log(req.files, req.fields)
  // if (!req.body) return res.sendStatus(400)

  const {inputFile} = req.files
  const {resolution, angle} = req.fields

  if (inputFile) {
    let authData = ''
    if (testMode && login && password) {
      authData = `testMode=${testMode} login=${login} password=${password}`
    }

    let workdir = tmp.dirSync({template: './tmp/render-XXXXXX'})
    const workDirPath = path.resolve(workdir.name)

    //move tmp file
    const inputFilePath = path.resolve(workDirPath, inputFile.name)
    fs.renameSync(inputFile.path, inputFilePath)
    const rendererPath = path.resolve(__dirname, '../', 'node_modules', 'usco-headless-renderer/dist/index.js')
    const outputFilePath = path.resolve(workdir.name, 'output.png')
    const mainCmd = `node ${rendererPath} ${inputFilePath} ${resolution} ${outputFilePath}`

    // RUN conversion
    of(mainCmd)
      .tap(cmd => console.log('launching', cmd))
      .flatMap(cmd => run(cmd))
      .flatMapError(function (error) {
        // console.log("error in launch",error)
        return throwError(error)
      })
      .drain()
      .then(function (e) {
        console.log('done with rendering')
        sendBackFile(workDirPath, res, outputFilePath)
      })
      .catch(function (error) {
        console.log(`error rendering design: ${inputFile}`, error)
        res.status(500).send(error)
      })
  } else {
    console.log('lacking inputFile')
    res.status(500).send('lacking inputFile')
  }
})

let server = app.listen(port, function () {
  let host = server.address().address
  let port = server.address().port
  console.log('renderer listening at http://%s:%s', host, port)
})
