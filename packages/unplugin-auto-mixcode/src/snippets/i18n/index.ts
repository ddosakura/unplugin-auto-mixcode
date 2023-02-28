import { join, relative, resolve } from "node:path";

import { slash } from "@antfu/utils";
import { isPackageExists } from "local-pkg";

import type { SnippetDefinition } from "@/core/types";
import { PREFIX_MIXCODE_VIRTUAL_MODULE } from "@/core/utils";
import { Watcher } from "@/core/watcher";

import { getLocales } from "./scan";

function normalizeLocale(path: string) {
  const list = path.replace(/\.json$/, "").split("/");
  if (list.length > 2 || list.length === 0) return;
  const [lang, ns = ""] = list;
  return [lang, ns] as const;
}

class ResourceManager {
  constructor(private root = "") {}
  setRoot(root: string) {
    this.root = root;
  }

  private locales = new Map<string, Set<string>>();
  add(path: string) {
    const locale = normalizeLocale(path);
    if (!locale) return;
    const [lang, ns] = locale;
    if (!this.locales.has(lang)) {
      this.locales.set(lang, new Set());
    }
    this.locales.get(lang)?.add(ns);
  }
  remove(path: string) {
    const locale = normalizeLocale(path);
    if (!locale) return;
    const [lang, ns] = locale;
    const nss = this.locales.get(lang);
    if (!nss) return;
    nss.delete(ns);
    if (nss.size === 0) {
      this.locales.delete(lang);
    }
  }

  langs() {
    return Array.from(this.locales.keys());
  }
  imports() {
    return this.langs()
      .map((lang) =>
        `import * as ${lang} from "${PREFIX_MIXCODE_VIRTUAL_MODULE}i18n/locale?${lang}";`
      );
  }
  locale(lang: string) {
    const nss = this.locales.get(lang);
    if (!nss) return [];
    return Array
      .from(nss.values())
      .map((ns) =>
        [
          ns ? ns : "default",
          join(this.root, ns ? `${lang}/${ns}.json` : `${lang}.json`),
        ] as const
      );
  }
}

export interface SnippetI18nOptions {
  dir: string;
  locale: string;
  hookUseTranslation: string;

  /** @link https://www.i18next.com/translation-function/interpolation#additional-options */
  interpolation: Partial<{
    prefix: string;
    suffix: string;
  }>;

  /** @link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter */
  segmenter: Partial<{
    locales: string;
    granularity: "grapheme" | "word" | "sentence";
  }>;
}

export const snippetI18n = (
  {
    dir = "src/locales",
    locale = "en",
    hookUseTranslation: HOOK_USE = "useTranslation",
    interpolation = {},
    segmenter,
  }: Partial<SnippetI18nOptions> = {},
): SnippetDefinition => {
  const resources = new ResourceManager();
  return {
    createWatcher(this) {
      const dirPath = slash(resolve(this.root, dir));
      resources.setRoot(dirPath);
      const locales = getLocales(dirPath);
      locales.forEach((path) => resources.add(relative(dirPath, path)));
      return new Watcher({
        match: (path) => path.startsWith(dirPath),
        onUpdate: (path, type) => {
          switch (type) {
            case "add": {
              resources.add(relative(dirPath, path));
              break;
            }
            case "unlink": {
              resources.remove(relative(dirPath, path));
              break;
            }
          }
          return {
            invalidateModules: [
              `${PREFIX_MIXCODE_VIRTUAL_MODULE}i18n/i18next.ts`,
              `${PREFIX_MIXCODE_VIRTUAL_MODULE}i18n/vue.ts`,
            ],
          };
        },
      });
    },
    virtual: {
      modules: {
        // fallback hook
        [HOOK_USE](this) {
          if (this.framework === "react") {
            return `export { useTranslation } from "react-i18next";`;
          }

          if (this.framework === "vue") {
            if (isPackageExists("vue-i18n")) {
              return `export { useI18n as useTranslation } from "vue-i18n";`;
            }
            return `export { useTranslation } from "i18next-vue";`;
          }
          if (this.framework === "vue2") {
            if (isPackageExists("vue-i18n-bridge")) {
              return `export { useI18n as useTranslation } from "vue-i18n-bridge";`;
            }
            return i18nextVue2UseTranslation;
          }

          return `export {}`;
        },
        locale(params) {
          const [lang = locale] = Array.from(Object.keys(params));
          return resources
            .locale(lang)
            .map(([ns, path]) => `export { default as ${ns} } from "${path}";`)
            .join("\n");
        },
        i18next(this) {
          const options: string[] = [];
          const plugins: I18NextPlugin[] = [
            { from: "i18next-http-backend" },
            { from: "i18next-browser-languagedetector" },
            { from: "react-i18next", imports: ["initReactI18next"] },
          ];
          const snippets = plugins
            .filter(({ from }) => isPackageExists(from))
            .map(({ from, imports }, index) => {
              const DEFAULT_IMPORT = `plugin_${index}`;
              const plugins = imports ? imports : [DEFAULT_IMPORT];
              const importer = imports
                ? `{ ${imports.join(", ")} }`
                : DEFAULT_IMPORT;
              return {
                importer: `import ${importer} from "${from}";`,
                uses: plugins.map((p) => `.use(${p})`),
              };
            });

          if (!isPackageExists("i18next-http-backend")) {
            const langs = resources.langs();
            snippets.push({
              importer: resources.imports().join("\n"),
              uses: [],
            });
            options.push(`resources: { ${langs.join(", ")} }`);
          }
          if (!isPackageExists("i18next-browser-languagedetector")) {
            options.push(`lng: "${locale}"`);
          }
          options.push(
            `fallbackLng: "${locale}"`,
            `debug: ${this.dev ? "true" : "false"}`,
          );
          return `
import i18n from "i18next";
${snippets.map(({ importer }) => importer).join("\n")}
i18n${snippets.flatMap(({ uses }) => uses).join("")}.init({
  ${options.join(",")}
});
export default i18n;
  `;
        },
        /** @link https://vue-i18n.intlify.dev/ */
        vue() {
          const langs = resources.langs();
          const imports = resources.imports().join("\n");
          return `
${imports}
const messages = {
${
            langs.map((lang) =>
              `${lang}: Object.assign({}, ...Object.values(${lang}))`
            ).join(",\n")
          }
};
export default {
  legacy: false,
  locale: "${locale}",
  messages,
};
`;
        },
      },
    },
    macro: {
      scan(this, s) {
        if (this.framework === "vue") {
          // auto inject in setup script
          s.replace(
            /<script([^>])+setup([^>])*>/,
            ($0) => `${$0}\n${CODE_USE}`,
          );
        }

        const isVueI18n = isPackageExists("vue-i18n") ||
          isPackageExists("vue-i18n-bridge");
        const {
          prefix = isVueI18n ? "{" : "{{",
          suffix = isVueI18n ? "}" : "}}",
        } = interpolation;
        const {
          locales = locale,
          granularity = "word",
        } = segmenter ?? {};
        return {
          prefix,
          suffix,
          segmenter: segmenter ? locales : "off",
          granularity,
        };
      },
      transform(params, _s, config: {
        prefix: string;
        suffix: string;
        segmenter: string;
        granularity: Required<SnippetI18nOptions["segmenter"]["granularity"]>;
      }) {
        const { "": key, ...props } = params;
        if (typeof key === "undefined") {
          return {
            code: typeof props.t === "undefined" ? "" : CODE_USE,
            context: {
              prefix: props.prefix || config.prefix,
              suffix: props.suffix || config.suffix,
              segmenter: props.segmenter || config.segmenter,
              granularity: props.granularity || config.granularity,
            },
          };
        }
        const optionKeys: string[] = [];
        const rawKey = key.replace(/{([^{}}]+)}/g, (_$0, $1) => {
          optionKeys.push($1);
          return `${config.prefix}${$1}${config.suffix}`;
        });
        const options = {
          ...Object.fromEntries(optionKeys.map((k) => [k, k] as const)),
          ...props,
        };
        const rawOptions = Object.entries(options).map(([k, v]) => `${k}:${v}`)
          .join(",");
        if (config.segmenter === "off" || rawKey !== key) {
          return `}{t("${rawKey}", {${rawOptions}})}{`;
        }
        const segmenter = new Intl.Segmenter(config.segmenter, {
          granularity: config.granularity,
        });
        return Array
          .from(segmenter.segment(key))
          .map((sd) => `}{t("${sd.segment}", {${rawOptions}})}{`)
          .join("");
      },
    },
  };
};

const CODE_USE = `const { t } = useTranslation();`;

interface I18NextPlugin {
  from: string;
  imports?: string[];
}

const i18nextVue2UseTranslation = `
export function useTranslation() {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error("i18next-vue: No Vue instance in context.");
  }
  const globalProps = instance.proxy ?? {};
  return {
    ti18n: globalProps.$ti18n,
    t: globalProps.$t ?? ((k) => k),
  };
}
`;
