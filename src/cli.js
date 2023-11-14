#!/usr/bin/env node

import { spawn } from 'node:child_process'
import process from 'node:process'

const args = process.argv.slice(2)

const _process = spawn('node', ['--loader', 'nomen-js/loader', ...args], {
  stdio: 'pipe',
})

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
