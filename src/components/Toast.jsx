import { useEffect, useRef } from 'react';

export default function Toast({ message, onDone }) {
  const ref = useRef();

  useEffect(() => {
    if (!message) return;
    ref.current?.classList.add('show');
    const t = setTimeout(() => {
      ref.current?.classList.remove('show');
      setTimeout(onDone, 300);
    }, 3000);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;
  return <div className="toast show" ref={ref}>{message}</div>;
}
