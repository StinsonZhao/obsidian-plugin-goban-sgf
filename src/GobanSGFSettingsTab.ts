import { App, PluginSettingTab, Setting } from 'obsidian'
import GobanSGFPlugin from './main'
import { t } from './lang/helper'
import { DEFAULT_SETTINGS } from './settings'
import { convertKomi, convertHandicap, convertSize } from './utils/utils'

export default class GobanSGFSettingsTab extends PluginSettingTab {
  plugin: GobanSGFPlugin
  constructor(app: App, plugin: GobanSGFPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    new Setting(containerEl)
      .setName(`${t('FOLDER')}`)
      .setDesc(`${t('FOLDER_INFO')}`)
      .addText((text) =>
        text
          .setValue(this.plugin.settings.folder || DEFAULT_SETTINGS.folder)
          .onChange((value: string) => {
            this.plugin.settings.folder = value || DEFAULT_SETTINGS.folder
            this.plugin.saveData(this.plugin.settings)
          })
      )

    new Setting(containerEl).setName(`${t('GOTO_END_AT_BEGINNING')}`).addToggle((toggle) =>
      toggle
        .setValue(this.plugin.settings.gotoEndAtBeginning || DEFAULT_SETTINGS.gotoEndAtBeginning)
        .onChange((value: boolean) => {
          this.plugin.settings.gotoEndAtBeginning = value
          this.plugin.saveData(this.plugin.settings)
        })
    )

    new Setting(containerEl).setName(`${t('FUZZY_STONE_PLACEMENT')}`).addToggle((toggle) =>
      toggle
        .setValue(this.plugin.settings.fuzzyStonePlacement || DEFAULT_SETTINGS.fuzzyStonePlacement)
        .onChange((value: boolean) => {
          this.plugin.settings.fuzzyStonePlacement = value
          this.plugin.saveData(this.plugin.settings)
        })
    )

    new Setting(containerEl).setName(`${t('SHOW_NEXT_MOVE')}`).addToggle((toggle) =>
      toggle
        .setValue(this.plugin.settings.dftShowNextMoves || DEFAULT_SETTINGS.dftShowNextMoves)
        .onChange((value: boolean) => {
          this.plugin.settings.dftShowNextMoves = value
          this.plugin.saveData(this.plugin.settings)
        })
    )

    new Setting(containerEl)
      .setName(`${t('SHOW_SIBLINGS')}`)
      .setDesc(`${t('SHOW_SIBLINGS_INFO')}`)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.dftShowSiblings || DEFAULT_SETTINGS.dftShowSiblings)
          .onChange((value: boolean) => {
            this.plugin.settings.dftShowSiblings = value
            this.plugin.saveData(this.plugin.settings)
          })
      )

    new Setting(containerEl)
      .setName(`${t('SHOW_MOVE_NUMBER')}`)
      .setDesc(`${t('SHOW_MOVE_NUMBER_INFO')}`)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.dftShowMoveNumbers || DEFAULT_SETTINGS.dftShowMoveNumbers)
          .onChange((value: boolean) => {
            this.plugin.settings.dftShowMoveNumbers = value
            this.plugin.saveData(this.plugin.settings)
          })
      )

    new Setting(containerEl)
      .setName(`${t('INIT_KOMI')}`)
      .setDesc(`${t('INIT_KOMI_INFO')}`)
      .addText((text) =>
        text
          .setValue(this.plugin.settings.dftKomi?.toString() || DEFAULT_SETTINGS.dftKomi.toString())
          .onChange((value: string) => {
            this.plugin.settings.dftKomi = convertKomi(value) || DEFAULT_SETTINGS.dftKomi
            this.plugin.saveData(this.plugin.settings)
          })
      )

    new Setting(containerEl)
      .setName(`${t('INIT_HANDICAP')}`)
      .setDesc(`${t('INIT_HANDICAP_INFO')}`)
      .addText((text) =>
        text
          .setValue(
            this.plugin.settings.dftHandicap?.toString() || DEFAULT_SETTINGS.dftHandicap.toString()
          )
          .onChange((value: string) => {
            this.plugin.settings.dftHandicap =
              Number(value) < 2 ? 0 : convertHandicap(value) || DEFAULT_SETTINGS.dftHandicap
            this.plugin.saveData(this.plugin.settings)
          })
      )

    new Setting(containerEl).setName(`${t('INIT_SIZE')}`).addText((text) =>
      text
        .setValue(this.plugin.settings.dftSize?.toString() || DEFAULT_SETTINGS.dftSize.toString())
        .onChange((value: string) => {
          this.plugin.settings.dftSize = convertSize(value) || DEFAULT_SETTINGS.dftSize
          this.plugin.saveData(this.plugin.settings)
        })
    )
  }
}
