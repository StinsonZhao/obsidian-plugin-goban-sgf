import { useContext, useState } from 'preact/hooks'
import { GobanContext } from '@/store/store'
import { t } from '@/lang/helper'
import { setTool, setMode, toggleCurStoneTool } from '@/store/actions'
import ExitIcon from '@/icons/exit'
import Tooltip from '@/components/Tooltip'
import { Cross, Triangle, Square, Circle, Alpha, Number } from '@/icons/tools'

export interface EditBarProps {}

const StoneTool = ({ currentPlayer }) => {
  return (
    <div className="relative w-5 h-5">
      <div
        className={`absolute left-0 top-0 w-4 h-4 rounded-[24px] border-2 border-transparent dark:border-white bg-black ${
          currentPlayer < 0 ? 'z-10' : 'z-30'
        }`}
      ></div>
      <div
        className={`absolute z-20 right-0 bottom-0 w-4 h-4 rounded-[24px] border-2 border-black dark:border-transparent bg-white`}
      ></div>
    </div>
  )
}

const ToolIcons = {
  cross: Cross,
  triangle: Triangle,
  square: Square,
  circle: Circle,
  label: Alpha,
  number: Number,
}

const ToolNameKey = {
  cross: 'CROSS',
  triangle: 'TRIANGLE',
  square: 'SQUARE',
  circle: 'CIRCLE',
  label: 'ALPHA',
  number: 'NUMBER',
  stone: 'STONE',
}

const ToolBtn = ({ tool, onClick, curTool }) => {
  const Icon = ToolIcons[tool]

  return (
    <Tooltip message={t(ToolNameKey[tool])}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center border border-solid cursor-pointer transition ${
          curTool === tool
            ? 'text-[var(--text-on-accent)] bg-[var(--interactive-accent)] border-[var(--interactive-accent)]'
            : 'text-[var(--text-normal)] bg-[var(--interactive-normal)] border-[var(--background-modifier-border)] hover:text-[var(--text-on-accent)] hover:bg-[var(--interactive-accent-hover)] hover:border-[var(--interactive-accent-hover)]'
        }`}
        style={{
          boxShadow:
            curTool === tool
              ? `0px 2px 16px -2px hsla(calc(var(--accent-h) - 3), calc(var(--accent-s) * 1.02), calc(var(--accent-l) * 1.15),1)`
              : '',
        }}
        onClick={onClick}
      >
        <div className="w-5 h-5">
          <Icon />
        </div>
      </div>
    </Tooltip>
  )
}

const EditBar = () => {
  const store = useContext(GobanContext)
  const { curTool, curStoneTool } = store

  const handleToolSelect = (tool) => {
    if (tool !== 'stone' && tool === curTool.value) {
      return
    }

    if (tool === 'stone' && tool === curTool.value) {
      toggleCurStoneTool(store)
      return
    }

    setTool(store, tool)
  }

  const handleExit = () => {
    setMode(store, 'play')
  }

  return (
    <div className="relative h-8 shrink-0 flex items-center justify-between w-full grow flex-nowrap text-[var(--text-normal)]">
      <div></div>
      <div className="flex items-center justify-center gap-2 shrink-0 grow flex-nowrap">
        <Tooltip
          message={
            t('CURRENT_SELECT_IS') +
            (curStoneTool.value < 0 ? t('WHITE_STONE') : t('BLACK_STONE')) +
            '(' +
            t('CLICK_TO_TOGGLE') +
            ')'
          }
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border border-solid cursor-pointer transition ${
              curTool.value === 'stone'
                ? 'text-[var(--text-on-accent)] bg-[var(--interactive-accent)] border-[var(--interactive-accent)]'
                : 'text-[var(--text-normal)] bg-[var(--interactive-normal)] border-[var(--background-modifier-border)] hover:text-[var(--text-on-accent)] hover:bg-[var(--interactive-accent)] hover:border-[var(--interactive-accent)]'
            }`}
            style={{
              boxShadow:
                curTool.value === 'stone'
                  ? `0px 2px 16px -2px hsla(calc(var(--accent-h) - 3), calc(var(--accent-s) * 1.02), calc(var(--accent-l) * 1.15),1)`
                  : '',
            }}
            onClick={() => handleToolSelect('stone')}
          >
            <StoneTool currentPlayer={curStoneTool.value} />
          </div>
        </Tooltip>
        {['cross', 'triangle', 'square', 'circle', 'label', 'number'].map((tool) => (
          <ToolBtn
            key={tool}
            curTool={curTool.value}
            tool={tool}
            onClick={() => handleToolSelect(tool)}
          />
        ))}
      </div>

      <div className="flex items-center justify-end">
        <Tooltip message={t('EXIT_EDIT')} placement="top-end">
          <button
            class="rounded shrink-0 h-8 w-8 p-0 flex items-center justify-center text-[var(--text-muted)] bg-transparent transition shadow-none outline-none border-none cursor-pointer hover:bg-[var(--interactive-accent)] hover:text-[var(--text-on-accent)] active:scale-90 ml-8"
            onClick={handleExit}
          >
            <div class="w-4 h-4">
              <ExitIcon />
            </div>
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default EditBar
