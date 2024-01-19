import { MarkdownRenderChild, MarkdownPostProcessorContext } from 'obsidian'
import {
  GobanSGFPluginSettings,
  DEFAULT_SETTINGS,
  GobanSGFPluginFrontmatterSettings,
  mergeSettings,
  FinalSettings,
  stringifyFrontmatterData,
} from './settings'
import {
  FRONTMATTER,
  CONTAINER_HTML_TOKEN,
  APP_HTML_TOKEN,
  POPUP_LAYER_HTML_TOKEN,
  FRONTMATTER_KEY,
} from '@/consts/consts'
import { createStore, Store } from '@/store/store'
import * as matter from 'hexo-front-matter'
import { h, render } from 'preact'
import AppOnlyGobanReadonly from '@/components/AppOnlyGobanReadonly'

class GobanCodeBlock extends MarkdownRenderChild {
  store?: Store

  constructor(
    private readonly el: HTMLElement,
    private readonly markdownSource: string,
    private readonly ctx: MarkdownPostProcessorContext,
    private readonly pluginSettings: GobanSGFPluginSettings
  ) {
    super(el)
    this.el.classList.add('goban-sgf-plugin-container')
  }

  onload() {
    const selectInfo = this.ctx.getSectionInfo(this.el)?.text || ''
    const { _content, ...frontmatterData } = selectInfo ? matter.parse(selectInfo.trim()) || { _content: '' } : { _content: '' }

    this.store = createStore(
      this.markdownSource,
      frontmatterData || {},
      this.pluginSettings,
      {},
      {}
    )

    render(
      h(AppOnlyGobanReadonly, {
        store: this.store
      }),
      this.el
    )
  }
}

export default GobanCodeBlock
