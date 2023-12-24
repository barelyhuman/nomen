#!/usr/bin/env node

import { spawn } from 'node:child_process'
import process from 'node:process'
import chokidar from 'chokidar'

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

const flags = {
  dev: false,
}

const argIter = lazyLoop(nomenArgs)

for (let arg of argIter)
  switch (arg) {
    case '--dev': {
      flags.dev = true
      break
    }
  }

if (flags.dev) process.env.NOMEN_DEV = true

console.log(`[${new Date().toLocaleTimeString()}]`)
let processWrapper = startWrappedProcess()

if (flags.dev) {
  const watcher = chokidar.watch(entryFile)
  watcher.add('./**/index.html')
  watcher.on('change', ev => {
    if (ev.startsWith('node_modules')) return
    if (ev.startsWith('.nomen')) return
    processWrapper.process.once('close', () => {
      console.log(`[${new Date().toLocaleTimeString()}]`)
      processWrapper = startWrappedProcess()
    })
    process.kill(processWrapper.process.pid, 'SIGINT')
  })
}

function startWrappedProcess() {
  let _process = spawn(
    baseCommand,
    [
      '--loader',
      'nomen-js/loader',
      '--no-warnings',
      ...nodeArgs.concat(entryFile),
    ],
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
  return {
    process: _process,
    wait: async () => {
      await new Promise(resolve => {
        _process.on('exit', () => {
          resolve()
        })
      })
    },
  }
}

function* lazyLoop(args) {
  const _clone = args.slice()
  let toRead
  while ((toRead = _clone.shift())) yield toRead

  return
}

async function main() {
  await processWrapper.wait()
}

main()
