import en from './locales/en'
import zhCN from './locales/zh-cn'
import { LOCALE } from '@/consts/consts'

const localeMap: { [k: string]: Partial<typeof en> } = {
  en,
  'zh-cn': zhCN,
}

const locale = localeMap[LOCALE]

export const t = (str: string): string => {
  return (locale && locale[str]) || en[str]
}
