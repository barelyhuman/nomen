#!/usr/bin/env node

import { spawn } from 'node:child_process'
import process from 'node:process'

const args = process.argv.slice(2)
const argSeparator = args.indexOf('--')

let nodeArgs = []
let nomenArgs = args
let entryFile = args[args.length - 1]

if (argSeparator > -1) {
  nomenArgs = args.slice(0, argSeparator)
  nodeArgs = nodeArgs.concat(args.slice(argSeparator))
  entryFile = nomenArgs[nomenArgs.length - 1]
}

let baseCommand = 'node'

const { hasFlag: hasDevFlag } = consumeBoolean('--dev', nomenArgs)

if (hasDevFlag) process.env.NOMEN_DEV = true

const _process = spawn(
  baseCommand,
  ['--loader', 'nomen-js/loader', ...nodeArgs.concat(entryFile)],
  {
    stdio: 'pipe',
  }
)

_process.stdout.on('data', d => {
  console.log(d.toString())
})

_process.stderr.on('data', d => {
  console.error(d.toString())
})

await new Promise(resolve => {
  _process.on('exit', () => {
    resolve()
  })
})

function consumeBoolean(flag, args) {
  let hasFlag = false

  for (let arg of args)
    if (arg === flag) {
      hasFlag = true
      break
    }

  return {
    hasFlag,
  }
}
