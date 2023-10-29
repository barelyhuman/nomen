import { useState } from 'preact/hooks';

export function render({ ...props }) {
  const [count, setCount] = useState(0);

  return (
    <>
      <p>Param: {props.id}</p>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </>
  );
}

export const onServer = (context, [id]) => {
  return {
    props: {
      id,
    },
  };
};
