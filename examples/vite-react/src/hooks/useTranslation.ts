// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import i18n from "virtual:mixcode/i18n/vue";

const { locale } = i18n;
const langAtom = atom(locale);

export const useTranslation = () => {
  const [lang, setLang] = useAtom(langAtom);
  return {
    t(key: string, options: Record<string, any>) {
      const { locale, messages } = i18n;
      const message = messages[lang || locale];
      const result = message[key] ?? key;
      return (result as string).replace(
        /{{([^{}]+)}}/g,
        (_$0, $1) => options[$1],
      );
    },
    i18n: {
      get language() {
        return lang;
      },
      changeLanguage(lang: string) {
        setLang(lang);
      },
    },
  };
};
