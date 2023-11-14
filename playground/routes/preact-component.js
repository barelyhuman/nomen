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

export const onServer = (context, [id]) => {
  head({
    title: 'Hello World',
  })

  return {
    props: {
      id,
    },
  }
}
