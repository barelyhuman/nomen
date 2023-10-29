import { useState } from 'preact/hooks';

export function render() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

export const onServer = (context, [id]) => {};
