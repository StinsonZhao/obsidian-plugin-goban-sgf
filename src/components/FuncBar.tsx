import { useCallback, useContext, useRef, useState } from 'preact/hooks'
import { GobanContext } from '@/store/store'
import { t } from '@/lang/helper'
import PlayBar from './PlayBar'
import EditBar from './EditBar'
import GameInfo from './GameInfo'
import MenuIcon from '@/icons/menu'
import modals from '@/modals/modals'
import { setFrontmatterSetting, getSGF } from '@/store/actions'
import { errorlog, newLinkClick } from '@/utils/utils'
import { Notice } from 'obsidian'

export interface FuncBarProps {
  onSGFChange: (
    sgfEnrty: { sgf: string; timestamp: number },
    options: { immediately: boolean; needRerender?: boolean }
  ) => Promise<void>
}

const FuncBar = ({ onSGFChange }: FuncBarProps) => {
  const store = useContext(GobanContext)
  const { mode, id, frontmatterData, gameInfo } = store

  const handling = useRef(false)
  const handleOpenDisplaySettings = useCallback(async () => {
    if (handling.current) {
      return
    }
    try {
      const res = await modals.DisplaySetting({
        props: {
          initData: frontmatterData.value,
        },
        id: id.value,
      })
      if (res) {
        setFrontmatterSetting(store, res)
      }
    } catch {
    } finally {
      handling.current = false
    }
  }, [store, id.value, frontmatterData.value])

  const importRef = useRef<HTMLInputElement>()
  const handlingImport = useRef(false)
  const handleImport = useCallback(
    async (e) => {
      const f = e.target.files?.[0]
      if (!f || handlingImport.current) {
        importRef.current.value = ''
        return
      }
      handlingImport.current = true
      const reader = new FileReader()
      if (f.size > 10 * 1000 * 1000) {
        new Notice(t('TOO_LARGE'))
        importRef.current.value = ''
        return
      }

      try {
        const fileCont = await new Promise((resolve, reject) => {
          reader.onload = function (event) {
            const fileContent = event.target.result
            resolve(fileContent)
          }
          reader.onerror = function (event) {
            reject(event?.target?.error?.message || 'Error when reading file')
          }
          reader.readAsText(f)
        })
        const confirmRes = await modals.Confirm({
          props: {
            title: t('IMPORT_CONFIRM_TITLE'),
            msg: t('IMPORT_CONFIRM_MSG'),
          },
          id: id.value,
        })
        if (confirmRes === 'confirm') {
          await onSGFChange(
            {
              sgf: fileCont as string,
              timestamp: Date.now(),
            },
            {
              immediately: true,
              needRerender: true,
            }
          )
        }
      } catch (e) {
        errorlog({
          where: 'import SGF',
          error: e,
        })
      } finally {
        handlingImport.current = false
        importRef.current.value = ''
      }
    },
    [id.value]
  )

  const handleExport = useCallback(async () => {
    const cont = getSGF(store)
    const sgfStr = 'data:text/plain;charset=utf-8,\uFEFF' + encodeURIComponent(cont)
    newLinkClick(sgfStr, {
      download: `${gameInfo.value.gameName || gameInfo.value.eventName || 'goban'}.sgf`,
    })
  }, [store])

  return (
    <div className="relative z-10 flex items-center justify-between w-full p-2 transition-all grow">
      {mode.value === 'gameInfo' ? (
        <GameInfo />
      ) : (
        <>
          <div className="relative group">
            <div className="absolute -top-1 left-0 whitespace-pre translate-y-[-100%] py-2 px-3 bg-[var(--background-secondary-alt)] text-[var(--text-normal)] transition-all origin-bottom rounded shadow-md text-xs opacity-50 scale-0 border-[var(--background-modifier-border-hover)] border border-solid group-hover:opacity-100 group-hover:scale-100 delay-100 hover:opacity-100 hover:scale-100">
              <div
                className="flex items-center w-full h-8 cursor-pointer hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)]"
                onClick={handleOpenDisplaySettings}
              >
                {t('DISPLAY_SETTINGS')}
              </div>
              <div className="h-[1px] w-full border-t border-dashed border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] my-2" />
              <label
                for="import-sgf"
                className="flex items-center w-full h-8 cursor-pointer hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)]"
              >
                {t('IMPORT_SGF')}
              </label>
              <input
                ref={importRef}
                hidden
                type="file"
                id="import-sgf"
                name="import-sgf"
                accept=".sgf"
                onChange={handleImport}
              />
              <div
                className="flex items-center w-full h-8 cursor-pointer hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)]"
                onClick={handleExport}
              >
                {t('EXPORT_SGF')}
              </div>
            </div>
            <button className="rounded shrink-0 h-8 w-8 p-0 flex items-center justify-center text-[var(--text-muted)] bg-transparent transition shadow-none outline-none border-none cursor-pointer hover:bg-[var(--interactive-accent)] hover:text-[var(--text-on-accent)] mr-8 active:scale-90">
              <div className="w-4 h-4">
                <MenuIcon />
              </div>
            </button>
          </div>
          {mode.value === 'edit' ? (
            <div className="flex grow">
              <EditBar />
            </div>
          ) : (
            <div className="flex grow">
              <PlayBar />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default FuncBar
