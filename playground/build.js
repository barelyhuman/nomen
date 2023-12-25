import { nomen } from './src/nomen.js'

try {
  await nomen.boot()
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}
