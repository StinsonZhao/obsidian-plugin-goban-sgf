import { TFile } from 'obsidian'
import {
  GobanSGFPluginSettings,
  DEFAULT_SETTINGS,
  GobanSGFPluginFrontmatterSettings,
  mergeSettings,
  FinalSettings,
  stringifyFrontmatterData,
} from './settings'
import GobanSGFView from './GobanSGFView'
import { h, render } from 'preact'
import App from '@/components/App'
import {
  CONTAINER_HTML_TOKEN,
  APP_HTML_TOKEN,
  POPUP_LAYER_HTML_TOKEN,
  FRONTMATTER_KEY,
} from '@/consts/consts'
import { genMarkdownSGFSection } from './utils/goban'
import { getAutoIncrID } from './utils/utils'
import { createStore, Store } from '@/store/store'

interface SGFEntry {
  sgf: string
  timestamp: number
}

export default class GobanController {
  sgfEntry: SGFEntry
  containerEL: HTMLElement
  settings: FinalSettings
  path?: string
  view: GobanSGFView
  appEl: HTMLElement
  saveTimer: NodeJS.Timeout | null = null
  store?: Store
  popLayer: HTMLElement
  ctrlID: string
  frontmatterData: GobanSGFPluginFrontmatterSettings
  pluginSettings: GobanSGFPluginSettings
  needRerender: boolean = false
  file: TFile

  constructor(
    sgfStr: string,
    frontmatterData: GobanSGFPluginFrontmatterSettings,
    view: GobanSGFView
  ) {
    this.sgfEntry = {
      sgf: sgfStr,
      timestamp: Date.now(),
    }
    this.ctrlID = getAutoIncrID().toString()
    this.view = view
    this.file = view.file
    this.containerEL = view.contentEl
    this.frontmatterData = frontmatterData
    this.pluginSettings = Object.assign({}, DEFAULT_SETTINGS, view.plugin.settings)
    this.settings = mergeSettings(
      this.frontmatterData,
      this.pluginSettings
    )
    this.containerEL.classList.add('goban-sgf-plugin-ctrl')
    this.containerEL.classList.add(CONTAINER_HTML_TOKEN, `${CONTAINER_HTML_TOKEN}-${this.ctrlID}`)
    this.containerEL.id = `${CONTAINER_HTML_TOKEN}-${this.ctrlID}`

    this.popLayer = document.createElement('div')
    this.popLayer.classList.add(POPUP_LAYER_HTML_TOKEN, `${POPUP_LAYER_HTML_TOKEN}-${this.ctrlID}`)
    this.popLayer.id = `${POPUP_LAYER_HTML_TOKEN}-${this.ctrlID}`

    this.appEl = document.createElement('div')
    this.appEl.classList.add(APP_HTML_TOKEN, `${APP_HTML_TOKEN}-${this.ctrlID}`)
    this.appEl.id = `${APP_HTML_TOKEN}-${this.ctrlID}`

    this.containerEL.appendChild(this.appEl)
    this.containerEL.appendChild(this.popLayer)
  }

  renderApp() {
    this.store = createStore(
      this.sgfEntry.sgf,
      this.frontmatterData,
      this.pluginSettings,
      {
        obViewID: this.ctrlID,
        obView: this.view,
        obPlugin: this.view.plugin,
        obApp: this.view.app,
      },
      {
        onFrontmatterChange: this.setFrontmatterData.bind(this),
      }
    )
    render(
      h(App, {
        store: this.store,
        onChange: this.setSGF.bind(this),
      }),
      this.appEl
    )
  }

  setPath(path: string) {
    this.path = path
  }

  setFrontmatterData(st: GobanSGFPluginFrontmatterSettings) {
    this.frontmatterData = st
    this.settings = mergeSettings(
      this.frontmatterData,
      Object.assign({}, DEFAULT_SETTINGS, this.view.plugin.settings)
    )
    this.debouncedSaveFile()
  }

  async setSGF(sgfEntry: { sgf: string; timestamp: number }, { immediately = false, needRerender = false }) {
    if (this.sgfEntry.timestamp > sgfEntry.timestamp) {
      return
    }

    this.sgfEntry = sgfEntry
    this.needRerender = needRerender
    if (immediately) {
      if (this.saveTimer) {
        clearTimeout(this.saveTimer)
      }
      await this.saveFile()
      return
    }
    this.debouncedSaveFile()
  }

  async debouncedSaveFile() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
    this.saveTimer = setTimeout(async () => {
      await this.saveFile()
      this.saveTimer = null
    }, 2000)
  }

  async saveFile() {
    const self = this
    const file = this.file
    const fm = self.frontmatterData
    if (!fm[FRONTMATTER_KEY]) {
      fm[FRONTMATTER_KEY] = process.env.PLUGIN_VERSION
    }
    if (!fm.tags || !fm.tags.includes('goban')) {
      fm.tags = fm.tags ? [...fm.tags, 'goban'] : ['goban']
    }
    const frontmatterPart = stringifyFrontmatterData(fm)
    const fileCont = `${frontmatterPart}\n${genMarkdownSGFSection(self.sgfEntry.sgf)}`
    await self.view.app.vault.modify(file, fileCont)
  }

  clear() {
    // if (this.saveTimer) {
    //   clearTimeout(this.saveTimer)
    //   this.saveTimer = null
    // }
  }
}
