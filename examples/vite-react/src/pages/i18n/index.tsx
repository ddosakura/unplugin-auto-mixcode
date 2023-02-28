/* eslint-disable @typescript-eslint/no-unused-vars */

const Example: React.FC<{ name: string }> = (props) => {
  /** @mixcode i18n?t */

  return (
    <div>
      {/** @mixcode i18n?=你好，{name}。&name=props.name */}
    </div>
  );
};

const Switcher = () => {
  const { i18n } = useTranslation();
  return (
    <button
      onClick={() => i18n.changeLanguage(i18n.language === "en" ? "zh" : "en")}
    >
      switch
    </button>
  );
};

export default function Page() {
  /** @mixcode i18n?t */

  const name = "sakura";

  return (
    <div>
      <h3>i18n</h3>
      <Switcher />
      <Example name="aaa" />
      <Example name="bbb" />
      <div>
        <span>
          {
            /**
             * @mixcode i18n?=你好，{name}。
             * @mixcode i18n?segmenter=zh
             * @mixcode i18n?=前端国际化
             */
          }
        </span>
      </div>
    </div>
  );
}
