import fs from 'fs'
import path from 'path'

import express from 'express'

import tmp from 'tmp'
import { throwError, of } from 'most'

import { getArgs } from './utils/args'
import { run } from './utils/run'
import rmDir from './utils/rmDir'
import { appInPath } from './utils/appPath'


const formidable = require('express-formidable')
const md5File = require('md5-file')

// setup environemental variables
require('env2')(path.resolve(__dirname, '../.env'))
// deal with command line args etc
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
let app = express()
// app.use(bodyParser.raw())
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
const workdirBase = './tmp'
if (!fs.existsSync(workdirBase)) {
  fs.mkdirSync(workdirBase)
}

// for manual caching of stl files
/*let fileStore = {}
const fileStoreBasePath = path.resolve(workdirBase, 'fileStore')
if (!fs.existsSync(fileStoreBasePath)) {
  fs.mkdirSync(fileStoreBasePath)
}*/

app.use(formidable({multiples: false, uploadDir: workdirBase}))

app.get('/status', (req, res) => {
  res.send({up: true})
})

app.post('/', function (req, res) {
  // console.log(req.files, req.fields)
  // if (!req.body) return res.sendStatus(400)

  const {inputFile} = req.files
  let {resolution, cameraPosition} = req.fields
  cameraPosition = cameraPosition || '[75,75,145]'
  cameraPosition = cameraPosition.replace(/' '/g, '')

  if (inputFile) {
    let authData = ''
    if (testMode && login && password) {
      authData = `testMode=${testMode} login=${login} password=${password}`
    }

    let workdir = tmp.dirSync({template: './tmp/render-XXXXXX'})
    const workDirPath = path.resolve(workdir.name)
    let inputFilePath = path.resolve(workDirPath, inputFile.name)

    //FIXME: futile attempt at caching
    // generate md5 hash of file
    /*const fileHash = md5File.sync(inputFile.path)
    if (fileStore[fileHash]) {
      inputFilePath = fileStore[fileHash]
      console.log('loading from cache', inputFilePath)
    } else {
      // move tmp file
      inputFilePath = path.join(fileStoreBasePath, inputFile.name)
      fs.renameSync(inputFile.path, inputFilePath)
      fileStore[fileHash] = inputFilePath
    }*/
    fs.renameSync(inputFile.path, inputFilePath)

    const rendererPath = path.resolve(__dirname, '../', 'node_modules', 'usco-headless-renderer/dist/index.js')
    const outputFilePath = path.resolve(workdir.name, 'output.png')
    const mainCmd = `node ${rendererPath} input=${inputFilePath} output=${outputFilePath} resolution=${resolution} cameraPosition=${cameraPosition} verbose=true`

    // RUN conversion
    appInPath('xvfb-run')
      .map(xvfb => {
        return xvfb === true ? `xvfb-run -a -s "-ac -screen 0 ${resolution}x24" ${mainCmd}` : `${mainCmd}`
      })
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
