import Counter from '../components/preact-island.js'
import { head } from 'nomen-js/head'

export function render({ ...props }) {
  return (
    <>
      <p>Param: {props.id}</p>
      <Counter initCount={+props.id} />
    </>
  )
}

export function onServer(context, [id]) {
  head({
    title: 'Hello World',
  })

  return {
    props: {
      id,
    },
  }
}
