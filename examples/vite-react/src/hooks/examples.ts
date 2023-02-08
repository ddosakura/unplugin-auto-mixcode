export const useCounter = () => {
  const [count, setCount] = useState(0);
  const inc = () => setCount((count) => count + 1);
  return [count, inc] as const;
};

export const useCountDown = () => {
  const [count, setCount] = useState(0);
  const inc = () => setCount((count) => count - 1);
  return [count, inc] as const;
};
