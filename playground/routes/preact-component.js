import { h } from 'preact'
import { useState } from 'preact/hooks'

const Button = ({ ...props }) =>
  h('button', {
    ...props,
  })

export function render({ ...props }) {
  const [count, setCount] = useState(0)

  return (
    <>
      <p>Param: {props.id}</p>
      <Button onClick={() => setCount(count + 1)}>{count}</Button>
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
