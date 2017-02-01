import {create} from '@most/create'
const exec = require('child_process').exec
const execSync = require('child_process').execSync

export function run (cmd) {
  return create((add, end, error) => {
    let child = exec(cmd)
    child.stdout.on('data', function (data) {
      // console.log("stdout",data)
      add(data)
    })
    child.stderr.on('data', function (data) {
      error(data)
    })
    child.on('close', function (code) {
      end()
    })
  })
}

export function runSync (cmd) {
  return create((add, end, error) => {
    let result = execSync(cmd)
    add(result)
    end()
  })
}
