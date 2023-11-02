import Counter from '../components/preact-island'
import { head } from 'nomen-js/head'

head({
  title: 'Hello World',
})

export function render({ ...props }) {
  return (
    <>
      <p>Param: {props.id}</p>
      <Counter initCount={+props.id} />
    </>
  )
}

export const onServer = (context, [id]) => {
  return {
    props: {
      id,
    },
  }
}
