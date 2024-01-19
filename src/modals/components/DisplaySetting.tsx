import { t } from '@/lang/helper'
import { noopAsync, WithFinishFC } from '../common'
import BaseModal from './BaseModal'
import type { FinalSettings, GobanSGFPluginFrontmatterSettings } from '@/settings'
import { useCallback, useState } from 'preact/hooks'
import {
  convertBool,
  convertLastMoves,
  convertKomi,
  convertHandicap,
  convertSize,
  convertGobanRange,
} from '@/utils/utils'
import jstr from 'json-stable-stringify'

export interface DisplaySettingProps {
  initData: GobanSGFPluginFrontmatterSettings
  onConfirm?: () => void
  onCancel?: () => void
}

const BoolSelectOptions = [
  {
    label: t('SELECT_INHERIT'),
    value: 'i',
  },
  {
    label: t('SELECT_YES'),
    value: 'y',
  },
  {
    label: t('SELECT_NO'),
    value: 'n',
  },
]

const mapBoolToSelectValue = (v: any) => {
  const cv = convertBool(v, false)
  if (cv === undefined) {
    return 'i'
  }
  return cv ? 'y' : 'n'
}

export const DisplaySetting: WithFinishFC<DisplaySettingProps> = ({ onFinish, initData }) => {
  const handleCancel = () => {
    onFinish(Promise.resolve(null))
  }

  const gobanRange = convertGobanRange(
    initData.gobanRange,
    isNaN(convertSize(initData.size)) ? 19 : convertSize(initData.size)
  )
  const [d, setD] = useState({
    gotoEndAtBeginning: mapBoolToSelectValue(initData.gotoEndAtBeginning),
    fuzzyStonePlacement: mapBoolToSelectValue(initData.fuzzyStonePlacement),
    showNextMoves: mapBoolToSelectValue(initData.showNextMoves),
    showSiblings: mapBoolToSelectValue(initData.showSiblings),
    showMoveNumbers: mapBoolToSelectValue(initData.showMoveNumbers),
    showLastMoves: convertLastMoves(initData.showLastMoves),
    komi: convertKomi(initData.komi),
    handicap: convertHandicap(initData.handicap),
    size: convertSize(initData.size),
    gobanRangeX1: gobanRange?.x?.[0],
    gobanRangeX2: gobanRange?.x?.[1],
    gobanRangeY1: gobanRange?.y?.[0],
    gobanRangeY2: gobanRange?.y?.[1],
    initMode:
      initData.initMode === 'edit' ? 'edit' : initData.initMode === 'play' ? 'play' : 'inherit',
    initCommentMode:
      initData.initCommentMode === 'edit'
        ? 'edit'
        : initData.initCommentMode === 'view'
        ? 'view'
        : 'inherit',
  })

  const handleConfirm = () => {
    const res: GobanSGFPluginFrontmatterSettings = {
    }
    let sizeInUse = 19
    if (!isNaN(Number(d.size)) && Number(d.size) >= 2 && Number(d.size) <= 25) {
      res.size = Number(d.size)
      sizeInUse = Number(d.size)
    } else {
      res.size = undefined
    }
    if (d.gobanRangeX1 >= 0 || d.gobanRangeX2 >= 0 || d.gobanRangeY1 >= 0 || d.gobanRangeY2 >= 0) {
      let x1 = d.gobanRangeX1 >= 0 && d.gobanRangeX1 < sizeInUse ? d.gobanRangeX1 : 0
      let x2 = d.gobanRangeX2 >= 0 && d.gobanRangeX2 < sizeInUse ? d.gobanRangeX2 : sizeInUse - 1
      let y1 = d.gobanRangeY1 >= 0 && d.gobanRangeY1 < sizeInUse ? d.gobanRangeY1 : 0
      let y2 = d.gobanRangeY2 >= 0 && d.gobanRangeY2 < sizeInUse ? d.gobanRangeY2 : sizeInUse - 1
      if (x1 > x2) {
        const temp = x1
        x1 = x2
        x2 = temp
      }
      if (y1 > y2) {
        const temp = y1
        y1 = y2
        y2 = temp
      }
      const gobanRange = {
        x: [x1, x2],
        y: [y1, y2],
      }
      res.gobanRange = jstr(gobanRange)
    } else {
      res.gobanRange = undefined
    }
    for (let k in d) {
      if (['size', 'gobanRangeX1', 'gobanRangeX2', 'gobanRangeY1', 'gobanRangeY2'].includes(k)) {
        continue
      }
      if ([
        'gotoEndAtBeginning',
        'fuzzyStonePlacement',
        'showNextMoves',
        'showSiblings',
        'showMoveNumbers',
      ].includes(k)) {
        if (d[k] !== 'i') {
          res[k] = d[k] === 'y'
        } else {
          res[k] = undefined
        }
      } else if (['showLastMoves', 'komi', 'handicap'].includes(k)) {
        if (!isNaN(Number(d[k]))) {
          res[k] = Number(d[k])
        } else {
          res[k] = undefined
        }
      } else if (['initMode', 'initCommentMode'].includes(k)) {
        res[k] = d[k] === 'inherit' ? undefined : d[k]
      }
    }
    onFinish(Promise.resolve(res))
  }

  const handleSelectChange = useCallback((e, field) => {
    const v = e.target.value
    if (
      [
        'gotoEndAtBeginning',
        'fuzzyStonePlacement',
        'showNextMoves',
        'showSiblings',
        'showMoveNumbers',
        'initMode',
        'initCommentMode',
      ].includes(field)
    ) {
      setD((pre) => ({ ...pre, [field]: v }))
    } else if (['gobanRangeX1', 'gobanRangeX2', 'gobanRangeY1', 'gobanRangeY2'].includes(field)) {
      setD((pre) => ({ ...pre, [field]: Number(v) >= 0 ? Number(v) : undefined }))
    } else if (field === 'size') {
      setD((pre) => ({ ...pre, [field]: Number(v) >= 2 && Number(v) <= 25 ? Number(v) : undefined }))
    }
  }, [])

  const handleNumberChange = useCallback((e, field) => {
    const v = e.target.value || undefined
    if (field === 'showLastMoves') {
      setD((pre) => ({ ...pre, [field]: convertLastMoves(v) }))
    } else if (field === 'komi') {
      setD((pre) => ({ ...pre, [field]: convertKomi(v) === Number(v) ? v : convertKomi(v) }))
    } else if (field === 'handicap') {
      setD((pre) => ({ ...pre, [field]: convertHandicap(v) }))
    }
  }, [])

  return (
    <BaseModal onFinish={onFinish} title={t('DISPLAY_SETTINGS')} width={800}>
      <div className="w-full px-6 pt-1 pb-6">
        <div className="text-xs text-[var(-text-muted)] mb-6">*{t('PAGE_SETTINGS_INFO')}</div>
        <div className="flex text-xs">
          <div className="w-[calc(50%-12px)] shrink-0 grow mr-6">
            <div className="mb-4">
              <div className="mb-1 px-0.5">{t('GOTO_END_AT_BEGINNING')}</div>
              <div className="flex items-center w-28">
                <select
                  value={d.gotoEndAtBeginning}
                  onChange={(e) => handleSelectChange(e, 'gotoEndAtBeginning')}
                  className="w-full shadow-none border-solid border border-[var(--background-modifier-border)]"
                >
                  {BoolSelectOptions.map((it) => (
                    <option value={it.value}>{it.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 px-0.5">{t('FUZZY_STONE_PLACEMENT')}</div>
              <div className="flex items-center w-28">
                <select
                  value={d.fuzzyStonePlacement}
                  onChange={(e) => handleSelectChange(e, 'fuzzyStonePlacement')}
                  className="w-full shadow-none border-solid border border-[var(--background-modifier-border)]"
                >
                  {BoolSelectOptions.map((it) => (
                    <option value={it.value}>{it.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 px-0.5">{t('SHOW_NEXT_MOVE')}</div>
              <div className="flex items-center w-28">
                <select
                  value={d.showNextMoves}
                  onChange={(e) => handleSelectChange(e, 'showNextMoves')}
                  className="w-full shadow-none border-solid border border-[var(--background-modifier-border)]"
                >
                  {BoolSelectOptions.map((it) => (
                    <option value={it.value}>{it.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 px-0.5">{t('SHOW_SIBLINGS')}</div>
              <div className="flex items-center w-28">
                <select
                  value={d.showSiblings}
                  onChange={(e) => handleSelectChange(e, 'showSiblings')}
                  className="w-full shadow-none border-solid border border-[var(--background-modifier-border)]"
                >
                  {BoolSelectOptions.map((it) => (
                    <option value={it.value}>{it.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 px-0.5">{t('SHOW_MOVE_NUMBER')}</div>
              <div className="flex items-center w-28">
                <select
                  value={d.showMoveNumbers}
                  onChange={(e) => handleSelectChange(e, 'showMoveNumbers')}
                  className="w-full shadow-none border-solid border border-[var(--background-modifier-border)]"
                >
                  {BoolSelectOptions.map((it) => (
                    <option value={it.value}>{it.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 px-0.5">{t('SHOW_LATS_MOVES')}</div>
              <div className="flex items-center w-28">
                <input
                  className="w-full"
                  type="number"
                  min={0}
                  max={20}
                  value={d.showLastMoves}
                  placeholder={t('SELECT_INHERIT')}
                  onInput={(e) => handleNumberChange(e, 'showLastMoves')}
                />
              </div>
            </div>
          </div>
          <div className="w-[calc(50%-12px)] shrink-0 grow">
            <div className="mb-4">
              <div className="mb-1 px-0.5">{t('INIT_KOMI')}</div>
              <div className="flex items-center w-28">
                <input
                  className="w-full"
                  type="number"
                  min={0}
                  max={361}
                  step={0.5}
                  value={d.komi}
                  placeholder={t('SELECT_INHERIT')}
                  onInput={(e) => handleNumberChange(e, 'komi')}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 px-0.5">{t('INIT_HANDICAP')}</div>
              <div className="flex items-center w-28">
                <input
                  className="w-full"
                  type="number"
                  min={2}
                  max={9}
                  value={d.handicap}
                  placeholder={t('SELECT_INHERIT')}
                  onInput={(e) => handleNumberChange(e, 'handicap')}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 px-0.5">{t('INIT_MODE')}</div>
              <div className="flex items-center w-28">
                <select
                  value={d.initMode}
                  onChange={(e) => handleSelectChange(e, 'initMode')}
                  className="w-full shadow-none border-solid border border-[var(--background-modifier-border)]"
                >
                  <option value="inherit">{t('SELECT_INHERIT')}</option>
                  <option value="play">{t('PLAY_MODE')}</option>
                  <option value="edit">{t('EDIT_MODE')}</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 px-0.5">{t('INIT_COMMENT_MODE')}</div>
              <div className="flex items-center w-28">
                <select
                  value={d.initCommentMode}
                  onChange={(e) => handleSelectChange(e, 'initCommentMode')}
                  className="w-full shadow-none border-solid border border-[var(--background-modifier-border)]"
                >
                  <option value="inherit">{t('SELECT_INHERIT')}</option>
                  <option value="view">{t('VIEW_MODE')}</option>
                  <option value="edit">{t('EDIT_MODE')}</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 px-0.5">{t('INIT_SIZE')}</div>
              <div className="flex items-center w-28">
                <select
                  value={d.size}
                  onChange={(e) => handleSelectChange(e, 'size')}
                  className="w-full shadow-none border-solid border border-[var(--background-modifier-border)]"
                >
                  <option value={-1}>{t('SELECT_INHERIT')}</option>
                  {[...Array(24)].map((_, i) => (
                    <option value={i + 2}>{i + 2}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 px-0.5">{t('SHOW_RANGE')}</div>
              <div className="flex items-center w-[80%] mb-1">
                <div className="flex items-center mr-1 shrink-0 text-[var(--text-muted)]">
                  <span className="inline-block h-1 w-1 rounded-md bg-[var(--text-faint)] ml-0.5 mr-1"></span>
                  {t('AXIOS_X')}:
                </div>
                <select
                  value={d.gobanRangeX1}
                  onChange={(e) => handleSelectChange(e, 'gobanRangeX1')}
                  className="h-6 grow shadow-none border-solid border border-[var(--background-modifier-border)]"
                >
                  <option value={-1}>{t('SELECT_INHERIT')}</option>
                  {[...Array(d.size || 19)].map((_, i) => (
                    <option value={i}>{i + 1}</option>
                  ))}
                </select>
                <div className="mx-0.5 shrink-0">-</div>
                <select
                  value={d.gobanRangeX2}
                  onChange={(e) => handleSelectChange(e, 'gobanRangeX2')}
                  className="h-6 grow shadow-none border-solid border border-[var(--background-modifier-border)]"
                >
                  <option value={-1}>{t('SELECT_INHERIT')}</option>
                  {[...Array(d.size || 19)].map((_, i) => (
                    <option value={i}>{i + 1}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center w-[80%]">
                <div className="flex items-center mr-1 shrink-0 text-[var(--text-muted)]">
                  <span className="inline-block h-1 w-1 rounded-md bg-[var(--text-faint)] ml-0.5 mr-1"></span>
                  {t('AXIOS_Y')}:
                </div>
                <select
                  value={d.gobanRangeY1}
                  onChange={(e) => handleSelectChange(e, 'gobanRangeY1')}
                  className="h-6 grow shadow-none border-solid border border-[var(--background-modifier-border)]"
                >
                  <option value={-1}>{t('SELECT_INHERIT')}</option>
                  {[...Array(d.size || 19)].map((_, i) => (
                    <option value={i}>{i + 1}</option>
                  ))}
                </select>
                <div className="mx-0.5 shrink-0">-</div>
                <select
                  value={d.gobanRangeY2}
                  onChange={(e) => handleSelectChange(e, 'gobanRangeY2')}
                  className="h-6 grow shadow-none border-solid border border-[var(--background-modifier-border)]"
                >
                  <option value={-1}>{t('SELECT_INHERIT')}</option>
                  {[...Array(d.size || 19)].map((_, i) => (
                    <option value={i}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end mt-6">
          <button
            className="rounded shrink-0 h-8 py-0 px-3 flex items-center justify-center text-[var(--text-on-accent)] bg-[var(--interactive-accent)] transition shadow-none outline-none border-none cursor-pointer hover:bg-[var(--interactive-accent-hover)] hover:text-[var(--text-on-accent)] mr-4 active:scale-90"
            onClick={handleConfirm}
          >
            {t('CONFIRM')}
          </button>

          <button
            className="rounded shrink-0 h-8 py-0 px-3 flex items-center justify-center text-[var(--text-muted)] bg-[var(--interactive-normal)]transition shadow-none outline-none cursor-pointer hover:bg-[var(--interactive-hover)] hover:text-[var(--text-normal)] active:scale-90 border border-solid border-[var(--background-modifier-border)]"
            onClick={handleCancel}
          >
            {t('CANCEL')}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}
