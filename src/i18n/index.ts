import i18nJson from './i18n.json';

export type Lan = 'cn' | 'en' | 'fr' | 'fa';

type I18nData = {
  [K in keyof typeof i18nJson.data]: {
    cn: string;
    en: string;
    fr: string;
    fa: string;
  };
};

const getParam = (param: string) => {
  const r = new RegExp(`\\?(?:.+&)?${param}=(.*?)(?:&.*)?$`);
  const m = window.location.toString().match(r);
  return m ? decodeURI(m[1]) : '';
};

export const lan: Lan = (() => {
  let l = getParam('lan').toLowerCase();
  if ((i18nJson.lan as string[]).indexOf(l) === -1) {
    l = i18nJson.default;
  }
  return l as Lan;
})();

export const i18n = i18nJson.data as I18nData;

document.title = i18n.title[lan];
