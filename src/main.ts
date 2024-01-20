import {
  MarkdownView,
  Notice,
  Plugin,
  WorkspaceLeaf,
  normalizePath,
  TFile,
  ViewState,
  TFolder,
  MarkdownPostProcessorContext,
} from 'obsidian'
import {
  ICON_NAME,
  VIEW_TYPE_GOBAN_SGF,
  FRONTMATTER_KEY,
  FRONTMATTER,
  HIDE_STATUS_BAR_HTML_TOKEN,
  BODY_DATA_HTML_TOKEN,
} from './consts/consts'
import { around } from 'monkey-around'
import { t } from './lang/helper'
import { checkAndCreateFolder, getNewUniqueFilepath, getGobanFilename } from './utils/filesUtils'
import { errorlog } from './utils/utils'
import { genMarkdownSGFSection, genInitSGF } from './utils/goban'
import GobanSGFView from './GobanSGFView'
import { GobanSGFPluginSettings, DEFAULT_SETTINGS } from './settings'
import GobanSGFSettingsTab from './GobanSGFSettingsTab'
import GobanCodeBlock from './GobanCodeBlock'
import './style.css'

export default class GobanSGFPlugin extends Plugin {
  settings: GobanSGFPluginSettings
  sgfFileModes: { [file: string]: string } = {}
  private _loaded: boolean = false

  async onload() {
    await this.loadSettings()

    this.addCommands()
    this.registerEvents()
    this.registerMonkeyAround()
    this.registerView(VIEW_TYPE_GOBAN_SGF, (leaf: WorkspaceLeaf) => new GobanSGFView(leaf, this))

    this.addRibbonIcon(ICON_NAME, t('CREATE_NEW'), () => {
      this.createAndOpenGoban()
    })

    this.registerMarkdownCodeBlockProcessor('sgf', this.gobanProcessor.bind(this))
    this.registerMarkdownCodeBlockProcessor('goban-sgf', this.gobanProcessor.bind(this))

    this.addSettingTab(new GobanSGFSettingsTab(this.app, this))
  }

  async gobanProcessor(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    ctx.addChild(new GobanCodeBlock(el, source, ctx, this.settings))
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  private async createAndOpenGoban(filename?: string, foldername?: string): Promise<string> {
    try {
      const file = await this.createGobanFile(filename, foldername)
      this.openGoban(file)
      return file.path
    } catch (e) {
      errorlog({
        where: 'createAndOpenGoban(main.ts)',
        error: e,
      })
      new Notice(t('ERROR_CREATING_GOBAN'))
      return null
    }
  }

  private async createGobanFile(filename?: string, foldername?: string) {
    const folderpath = normalizePath(foldername ? foldername : this.settings.folder)
    await checkAndCreateFolder(this, folderpath) //create folder if it does not exist
    const fname = getNewUniqueFilepath(
      this.app.vault,
      getGobanFilename(this.settings, filename || t('UNTITLED')),
      folderpath
    )
    const file = await this.app.vault.create(fname, await this.genBlankGobanFile())

    //wait for metadata cache
    let counter = 0
    while (file instanceof TFile && !this.isGobanFile(file) && counter++ < 10) {
      await sleep(50)
    }

    if (counter > 10) {
      errorlog({
        file,
        error: 'new goban not recognized as an goban file',
        fn: this.createGobanFile,
      })
    }

    return file
  }

  private async genBlankGobanFile() {
    return `${FRONTMATTER}\n${genMarkdownSGFSection(
      genInitSGF(
        this.settings.dftSize || 19,
        this.settings.dftHandicap || 0,
        this.settings.dftKomi || 5.5
      )
    )}`
  }

  private isGobanFile(f: TFile) {
    if (!f) {
      return false
    }
    const fileCache = f ? this.app.metadataCache.getFileCache(f) : null
    return !!fileCache?.frontmatter && !!fileCache.frontmatter[FRONTMATTER_KEY]
  }

  private async openGoban(gobanFile: TFile) {
    let leaf: WorkspaceLeaf = this.app.workspace.getLeaf('tab')
    if (!leaf) {
      leaf = this.app.workspace.getLeaf(false)
    }
    try {
      await leaf.setViewState({
        type: VIEW_TYPE_GOBAN_SGF,
        state: {
          file: gobanFile.path,
        },
        active: true,
      })
    } catch (e) {
      errorlog({
        where: 'openGoban(main.ts): leaf.openFile',
        error: e,
      })

      new Notice(t('ERROR_OPEN_GOBAN'))
    }
  }

  private registerEvents() {
    this.registerEvent(
      this.app.workspace.on(
        'file-menu',
        (menu, file: TFile, source: string, leaf?: WorkspaceLeaf & { id?: string }) => {
          // Add a menu item to the folder context menu to create a goban
          if (file instanceof TFolder) {
            menu.addItem((item) => {
              item
                .setTitle(`${t('CREATE_NEW')}`)
                .setIcon('document')
                .onClick(() => this.createAndOpenGoban(undefined, file.path))
            })
          }

          //add markdown view menu  open as goban view
          if (leaf && this.sgfFileModes[leaf.id || file.path] == 'markdown') {
            const cache = this.app.metadataCache.getFileCache(file)
            if (cache?.frontmatter && cache.frontmatter[FRONTMATTER_KEY]) {
              menu
                .addItem((item) => {
                  item
                    .setTitle(`${t('OPEN_AS_GOBAN')}`)
                    .setIcon('document')
                    .onClick(() => {
                      this.sgfFileModes[leaf.id || file.path] = VIEW_TYPE_GOBAN_SGF
                      this.setGobanView(leaf)
                    })
                })
                .addSeparator()
            }
          }
        }
      )
    )

    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        this.app.workspace.getLeavesOfType(VIEW_TYPE_GOBAN_SGF).forEach((leaf) => {
          const view = leaf.view as GobanSGFView
          view.onFileMetadataChange(file)
        })
      })
    )

    this.registerEvent(
      this.app.workspace.on('active-leaf-change', (leaf) => {
        if (!leaf) {
          return
        }

        const gobanSGFLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOBAN_SGF) || []
        // const gobanView = this.app.workspace.getActiveViewOfType(GobanSGFView) not working: click on sidebar whill emit this event, and `this.app.workspace.getActiveViewOfType(GobanSGFView)` will return null
        // So use this trick to know whether any goban view is can be seen
        const gobanLeaf = gobanSGFLeaves.find((leaf: any) => leaf?.height > 0 || leaf?.width > 0)
        const gobanView = gobanLeaf?.view as GobanSGFView
        if (gobanView) {
          if (!document.body.classList.contains(HIDE_STATUS_BAR_HTML_TOKEN)) {
            document.body.classList.add(HIDE_STATUS_BAR_HTML_TOKEN)
          }

          if (
            gobanView?.gobanCtrl?.ctrlID &&
            document.body.dataset[BODY_DATA_HTML_TOKEN] !== gobanView?.gobanCtrl?.ctrlID
          ) {
            document.body.dataset[BODY_DATA_HTML_TOKEN] = gobanView?.gobanCtrl?.ctrlID
          }
        } else {
          document.body.classList.remove(HIDE_STATUS_BAR_HTML_TOKEN)
          if (document.body.dataset[BODY_DATA_HTML_TOKEN]) {
            delete document.body.dataset[BODY_DATA_HTML_TOKEN]
          }
        }
      })
    )
  }

  async setMarkdownView(leaf: WorkspaceLeaf) {
    const state = leaf.view.getState()

    await leaf.setViewState({
      type: VIEW_TYPE_GOBAN_SGF,
      state: { file: null },
    })

    await leaf.setViewState(
      {
        type: 'markdown',
        state,
        popstate: true,
      } as ViewState,
      { focus: true }
    )
  }

  async setGobanView(leaf: WorkspaceLeaf) {
    await leaf.setViewState({
      type: VIEW_TYPE_GOBAN_SGF,
      state: leaf.view.getState(),
      popstate: true,
    } as ViewState)
  }

  private addCommands() {
    this.addCommand({
      id: 'Create New Goban',
      name: `${t('CREATE_NEW')}`,
      callback: () => {
        this.createAndOpenGoban()
      },
    })

    this.addCommand({
      id: 'Toggle to Markdown or Goban',
      name: `${t('TOGGLE_MD_GOBAN')}`,
      mobileOnly: false,
      callback: () => {
        const gobanView = this.app.workspace.getActiveViewOfType(GobanSGFView)
        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (gobanView != null) {
          this.sgfFileModes[(gobanView.leaf as WorkspaceLeaf & { id?: string }).id || gobanView.file.path] = 'markdown'
          this.setMarkdownView(gobanView.leaf)
        } else if (markdownView != null) {
          this.sgfFileModes[(markdownView.leaf as WorkspaceLeaf & { id?: string }).id || markdownView.file.path] =
            VIEW_TYPE_GOBAN_SGF
          this.setMarkdownView(markdownView.leaf)
        }
      },
    })
  }

  private registerMonkeyAround() {
    const self = this

    this.register(
      around(WorkspaceLeaf.prototype, {
        detach(next) {
          return function () {
            const state = this.view?.getState()
            if (state?.file && self.sgfFileModes[this.id || state.file]) {
              delete self.sgfFileModes[this.id || state.file]
            }

            return next.apply(this)
          }
        },

        setViewState(next) {
          return function (state: ViewState, ...rest: any[]) {
            if (
              // Don't force goban mode during shutdown
              self._loaded &&
              state.type === 'markdown' &&
              state.state?.file &&
              // And the current mode of the file is not set to markdown
              self.sgfFileModes[this.id || state.state.file] !== 'markdown'
            ) {
              // Then check for the goban frontMatterKey
              const cache = self.app.metadataCache.getCache(state.state.file)
              if (cache?.frontmatter && cache.frontmatter[FRONTMATTER_KEY]) {
                // If we have it, force the view type to goban
                const newState = {
                  ...state,
                  type: VIEW_TYPE_GOBAN_SGF,
                }

                self.sgfFileModes[state.state.file] = VIEW_TYPE_GOBAN_SGF

                return next.apply(this, [newState, ...rest])
              }
            }

            return next.apply(this, [state, ...rest])
          }
        },
      })
    )
  }
}
