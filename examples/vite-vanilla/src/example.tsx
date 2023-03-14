/** @jsxImportSource @mixcode/jsx/dist */

import typescriptLogo from "./typescript.svg";

export function setupCounter(element: HTMLButtonElement) {
  let counter = 0;
  const setCounter = (count: number) => {
    counter = count;
    element.innerHTML = `count is ${counter}`;
  };
  element.addEventListener("click", () => setCounter(counter + 1));
  setCounter(0);
}

export const ActionPannel = () => {
  const btn = <button type="button" />;
  console.log({ btn });
  setupCounter(btn);
  return (
    <div className="p-[2em]">
      {btn}
    </div>
  );
};

export default function () {
  return (
    <div>
      <a href="https://vitejs.dev" target="_blank">
        <img src="/vite.svg" className="logo" alt="Vite logo" />
      </a>
      <a href="https://www.typescriptlang.org/" target="_blank">
        <img
          src={typescriptLogo}
          className="logo vanilla"
          alt="TypeScript logo"
        />
      </a>
      <h1>Vite + TypeScript</h1>
      <ActionPannel />
      <ActionPannel />
      <p className="color-[#888]">
        Click on the Vite and TypeScript logos to learn more
      </p>
    </div>
  );
}
