import { useContext } from 'preact/hooks'
import { GobanContext } from '@/store/store'
import { t } from '@/lang/helper'
import { setPlayer, setMode, makeResign, makeMove } from '@/store/actions'
import InfoIcon from '@/icons/info'
import MarkIcon from '@/icons/mark'
import ResignIcon from '@/icons/resign'
import SkipIcon from '@/icons/skip'
import Tooltip from '@/components/Tooltip'

export interface PlayBarProps {}

const PlayBar = () => {
  const store = useContext(GobanContext)
  const { gameInfo, curPlayer, playerCaptures, curTreePositionNodeID } = store

  const handleClickCurrentPlayer = () => {
    setPlayer(store, curTreePositionNodeID.value, -curPlayer)
  }

  const handleGameInfo = () => {
    setMode(store, 'gameInfo')
  }

  const handleEdit = () => {
    setMode(store, 'edit')
  }

  const handleReisgn = (p) => {
    makeResign(store, { player: p })
  }

  const handleSkip = (p) => {
    makeMove(store, [-1, -1], { player: p })
  }

  return (
    <div className="relative h-8 shrink-0 flex items-center justify-between w-full grow flex-nowrap text-[var(--text-normal)]">
      <div className="w-18"></div>

      <div className="flex items-center justify-center">
        <div
          className={`mr-4 flex items-center justify-end transition ${
            curPlayer.value < 0 ? 'opacity-20' : 'opacity-100'
          }`}
        >
          <Tooltip message={t('RESIGN')} placement="top-begin">
            <button
              class="rounded shrink-0 h-8 w-8 p-0 flex items-center justify-center text-[var(--text-muted)] bg-transparent transition shadow-none outline-none border-none cursor-pointer hover:bg-[var(--interactive-accent)] hover:text-[var(--text-on-accent)] active:scale-90 mr-0.5"
              onClick={() => handleReisgn(curPlayer.value)}
            >
              <div class="w-4 h-4 scale-75 transform origin-center">
                <ResignIcon />
              </div>
            </button>
          </Tooltip>

          <Tooltip message={t('SKIP')} placement="top-begin">
            <button
              class="rounded shrink-0 h-8 w-8 p-0 flex items-center justify-center text-[var(--text-muted)] bg-transparent transition shadow-none outline-none border-none cursor-pointer hover:bg-[var(--interactive-accent)] hover:text-[var(--text-on-accent)] active:scale-90"
              onClick={() => handleSkip(curPlayer.value)}
            >
              <div class="w-4 h-4 scale-75 transform origin-center">
                <SkipIcon />
              </div>
            </button>
          </Tooltip>

          <div className="h-4 w-[1px] bg-[var(--background-modifier-border)] ml-2"></div>
        </div>
        <div className="flex items-center shrink-0">
          <div
            className={`rounded-[24px] opacity-0 h-4 w-4 bg-[rgba(0,0,0,0.3)] dark:bg-[rgba(255,255,255,0.3)] flex items-center justify-center text-xs font-medium ${
              playerCaptures.value?.[0] ? 'opacity-70' : ''
            }`}
          >
            {playerCaptures.value?.[0]}
          </div>
          {gameInfo.value?.playerRanks?.[0] ? (
            <div className="text-xs ml-2 text-[var(--text-muted)]">
              {gameInfo.value?.playerRanks?.[0]}
            </div>
          ) : null}
          <div className="ml-2 text-sm font-semibold">
            {gameInfo.value?.playerNames?.[0] || t('BLACK')}
          </div>
        </div>
        <div
          className="flex items-center mx-3 cursor-pointer shrink-0"
          onClick={handleClickCurrentPlayer}
        >
          <div className="relative w-[34px] h-[22px]">
            <div
              className={`absolute left-0 top-0 bottom-0 w-[22px] rounded-[24px] border-2 border-transparent dark:border-white bg-black ${
                curPlayer.value < 0 ? 'z-10' : 'z-30'
              }`}
            ></div>
            <div
              className={`absolute z-20 right-0 top-0 bottom-0 w-[22px] rounded-[24px] border-2 border-black dark:border-transparent bg-white`}
            ></div>
          </div>
        </div>
        <div className="flex items-center shrink-0">
          <div className="text-sm font-semibold">
            {gameInfo.value?.playerNames?.[1] || t('WHITE')}
          </div>
          {gameInfo.value?.playerRanks?.[1] ? (
            <div className="text-xs ml-2 text-[var(--text-muted)]">
              {gameInfo.value?.playerRanks?.[1]}
            </div>
          ) : null}
          <div
            className={`ml-2 rounded-[24px] opacity-0 h-4 w-4 bg-[rgba(0,0,0,0.3)] dark:bg-[rgba(255,255,255,0.3)] text-[var(--text-normal)] flex items-center justify-center text-xs font-medium ${
              playerCaptures.value?.[1] ? 'opacity-70' : ''
            }`}
          >
            {playerCaptures.value?.[1]}
          </div>
        </div>
        <div
          className={`ml-4 flex items-center transition ${
            curPlayer.value < 0 ? 'opacity-100' : 'opacity-20'
          }`}
        >
          <div className="h-4 w-[1px] bg-[var(--background-modifier-border)] mr-2"></div>
          <Tooltip message={t('SKIP')} placement="top-end">
            <button
              class="rounded shrink-0 h-8 w-8 p-0 flex items-center justify-center text-[var(--text-muted)] bg-transparent transition shadow-none outline-none border-none cursor-pointer hover:bg-[var(--interactive-accent)] hover:text-[var(--text-on-accent)] active:scale-90 mr-0.5"
              onClick={() => handleSkip(curPlayer.value)}
            >
              <div class="w-4 h-4 scale-75 transform origin-center">
                <SkipIcon />
              </div>
            </button>
          </Tooltip>

          <Tooltip message={t('RESIGN')} placement="top-end">
            <button
              class="rounded shrink-0 h-8 w-8 p-0 flex items-center justify-center text-[var(--text-muted)] bg-transparent transition shadow-none outline-none border-none cursor-pointer hover:bg-[var(--interactive-accent)] hover:text-[var(--text-on-accent)] active:scale-90"
              onClick={() => handleReisgn(curPlayer.value)}
            >
              <div class="w-4 h-4 scale-75 transform origin-center">
                <ResignIcon />
              </div>
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Tooltip message={t('GAME_INFO')} placement="top-end">
          <button
            class="rounded shrink-0 h-8 w-8 p-0 flex items-center justify-center text-[var(--text-muted)] bg-transparent transition shadow-none outline-none border-none cursor-pointer hover:bg-[var(--interactive-accent)] hover:text-[var(--text-on-accent)] active:scale-90"
            onClick={handleGameInfo}
          >
            <div class="w-4 h-4">
              <InfoIcon />
            </div>
          </button>
        </Tooltip>

        <Tooltip message={t('EDIT_MODE')} placement="top-end">
          <button
            class="rounded shrink-0 h-8 w-8 p-0 flex items-center justify-center text-[var(--text-muted)] bg-transparent transition shadow-none outline-none border-none cursor-pointer hover:bg-[var(--interactive-accent)] hover:text-[var(--text-on-accent)] ml-2 active:scale-90"
            onClick={handleEdit}
          >
            <div class="w-4 h-4">
              <MarkIcon />
            </div>
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default PlayBar
