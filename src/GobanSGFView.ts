import {
  HoverPopover,
  HoverParent,
  TextFileView,
  WorkspaceLeaf,
  TFile,
  Notice,
  Platform,
  Menu,
} from 'obsidian'
import * as matter from 'hexo-front-matter'
import GobanSGFPlugin from './main'
import { t } from './lang/helper'
import {
  VIEW_TYPE_GOBAN_SGF,
  DEFAULT_DATA,
  FRONT_MATTER_REGEX,
  SGF_CONTENT_REGEX,
  DEFAULT_SGF,
} from './consts/consts'
import GobanController from './GobanController'
import { shallowObjEquals } from './utils/utils'

export default class GobanSGFView extends TextFileView implements HoverParent {
  plugin: GobanSGFPlugin
  hoverPopover: HoverPopover | null
  saveTimer: NodeJS.Timeout | null
  container: Element
  fileCache: any
  gobanCtrl: GobanController
  firstInit: boolean = true

  constructor(leaf: WorkspaceLeaf, plugin: GobanSGFPlugin) {
    super(leaf)
    this.plugin = plugin

    this.fileCache = {
      frontmatter: {
        FRONTMATTER_KEY: `${process.env.PLUGIN_VERSION}`,
      },
    }
  }

  getViewType() {
    return VIEW_TYPE_GOBAN_SGF
  }

  getDisplayText() {
    if (this.file) {
      return this.file.basename
    }
    return t('NOFILE')
  }

  clear() {
    this.saveTimer && clearTimeout(this.saveTimer)
    this.saveTimer = null
  }

  getViewData() {
    return this.data
  }

  onload() {
    super.onload()
    this.registerEvent(this.app.workspace.on('quick-preview', () => this.onQuickPreview, this))
  }

  onQuickPreview(file: TFile, data: string) {
    if (file === this.file && data !== this.data) {
      this.setViewData(data)
      this.fileCache = this.app.metadataCache.getFileCache(file)
    }
  }

  async onFileMetadataChange(file: TFile) {
    const path = file.path
    let md = await this.app.vault.adapter.read(path)
    this.onQuickPreview(file, md)
  }

  onunload() {
    this.app.workspace.offref('quick-preview')
    this.app.workspace.offref('resize')

    if (this.gobanCtrl) {
      this.gobanCtrl.clear()
      this.contentEl.innerHTML = ''
      this.gobanCtrl = null
    }

    this.plugin.setMarkdownView(this.leaf)
  }

  setViewData(data: string = DEFAULT_DATA, clear: boolean = false) {
    data = this.data = data.replaceAll('\r\n', '\n').replaceAll('\r', '\n')
    const { mdContent, frontmatterData } = this.parseMd(this.data)
    const sgfStr = this.extractSGFFromMD(mdContent)

    if (this.gobanCtrl && !this.gobanCtrl.needRerender && this.gobanCtrl.sgfEntry.sgf === sgfStr && shallowObjEquals(frontmatterData, this.gobanCtrl.frontmatterData)) {
      return
    }

    if (this.gobanCtrl) {
      this.gobanCtrl.clear()
      this.contentEl.innerHTML = ''
    }

    this.gobanCtrl = new GobanController(sgfStr, frontmatterData, this)

    if (this.firstInit) {
      setTimeout(() => {
        if (this.leaf) {
          const view = this.leaf.view as GobanSGFView
          this.gobanCtrl.setPath(view?.file.path)
          if (view.file) {
            this.fileCache = this.app.metadataCache.getFileCache(view.file)
          }
        }
        this.gobanCtrl.renderApp()
        this.firstInit = false
      }, 100)
    } else {
      const view = this.leaf.view as GobanSGFView
      this.fileCache = this.app.metadataCache.getFileCache(view.file)
      this.gobanCtrl.setPath(view?.file.path)
      this.gobanCtrl.renderApp()
    }
  }

  parseMd(data: string) {
    const { _content: content, ...frontmatterData } = matter.parse(data.trim())
    return {
      mdContent: content.trim(),
      frontmatterData,
    }
  }

  extractSGFFromMD(mdText: string) {
    const sgfCont = mdText.trim().match(SGF_CONTENT_REGEX)?.[3]?.trim()
    let sgfData = DEFAULT_SGF
    if (sgfCont) {
      sgfData = sgfCont
    } else {
      new Notice(t('CONTENT_INVALID'))
    }

    return sgfData
  }

  onPaneMenu(menu: Menu, source: string): void {
    const self = this
    menu.addItem((item) => {
      item
        .setTitle(`${t('OPEN_AS_MD')}`)
        .setIcon('document')
        .onClick(() => {
          self.plugin.sgfFileModes[(self.leaf as any).id || self.file.path] = 'markdown'
          self.plugin.setMarkdownView(self.leaf)
        })
        .setSection('pane')
    })
    super.onPaneMenu(menu, source)
  }
}
