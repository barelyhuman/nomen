import Counter from '../components/preact-island'

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
