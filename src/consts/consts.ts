import { moment } from "obsidian"
import { genMarkdownSGFSection } from '../utils/goban'

export const ICON_NAME = 'stop-circle'
export const VIEW_TYPE_GOBAN_SGF = 'goban-sgf'
export const LOCALE = moment.locale()
export const FRONTMATTER_KEY = "goban-sgf-plugin"
export const DEFAULT_SGF = `(;GM[1]FF[4]CA[UTF-8]AP[Obsidian Goban SGF Plugin:${process.env.PLUGIN_VERSION}]KM[6.5]SZ[19]DT[${moment().format('YYYY-MM-DD')}])`
export const FRONTMATTER = [
  "---",
  "",
  `${FRONTMATTER_KEY}: ${process.env.PLUGIN_VERSION}`,
  "tags: [goban]",
  "",
  "---"
].join("\n")
export const DEFAULT_DATA = genMarkdownSGFSection(DEFAULT_SGF)
export const FRONT_MATTER_REGEX = /^(---)$.+?^(---)$.+?/ims
export const SGF_CONTENT_REGEX = /^(```\s*(goban-)?sgf)$(.*)^(```)$/ims
export const CONTAINER_HTML_TOKEN = 'goban-sgf-plugin-container'
export const APP_HTML_TOKEN = 'goban-sgf-plugin-app'
export const POPUP_LAYER_HTML_TOKEN = 'goban-sgf-plugin-pop-layer'
export const HIDE_STATUS_BAR_HTML_TOKEN = 'hide-status-bar'
export const BODY_DATA_HTML_TOKEN = 'gobanSgfPluginViewActive'