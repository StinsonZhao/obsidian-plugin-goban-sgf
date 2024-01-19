import { useContext, useCallback, useState } from 'preact/hooks'
import { GobanContext } from '@/store/store'
import { t } from '@/lang/helper'
import { setMode, setGameInfo, switchGame } from '@/store/actions'

export interface GameInfoProps {}

const GameInfo = () => {
  const store = useContext(GobanContext)
  const { gameTrees, gameInfo, curPlayer, rootNode, gameInfos, curGameIndex, settings } = store
  const [info, setInfo] = useState({
    bPlayerRank: gameInfo.value?.playerRanks?.[0],
    bPlayerName: gameInfo.value?.playerNames?.[0],
    wPlayerRank: gameInfo.value?.playerRanks?.[1],
    wPlayerName: gameInfo.value?.playerNames?.[1],
    gameName: gameInfo.value?.gameName,
    eventName: gameInfo.value?.eventName,
    date: gameInfo.value?.date,
    result: gameInfo.value?.result,
    komi: gameInfo.value?.komi || settings.value?.komi || '0',
    handicap: gameInfo.value?.handicap || settings.value?.handicap ||  '0',
    size: gameInfo.value?.size?.[0] || settings.value?.size || '19',
    gameComment: gameInfo.value?.gameComment,
  })

  const handleInfoChange = useCallback((e, field) => {
    const v = e.target.value
    setInfo((pre) => ({
      ...pre,
      [field]: v,
    }))
  }, [])

  const [selectGameIdx, setSelectGameIdx] = useState(curGameIndex.value)
  const handleSwitchGame = useCallback(
    (e) => {
      const v = e.target.value
      if (Number(v) === Number(selectGameIdx) || isNaN(Number(v))) {
        return
      }
      setSelectGameIdx(v)
      const gInfo = gameInfos.value?.[Number(v)]
      setInfo({
        bPlayerRank: gInfo?.playerRanks?.[0],
        bPlayerName: gInfo?.playerNames?.[0],
        wPlayerRank: gInfo?.playerRanks?.[1],
        wPlayerName: gInfo?.playerNames?.[1],
        gameName: gInfo?.gameName,
        eventName: gInfo?.eventName,
        date: gInfo?.date,
        result: gInfo?.result,
        komi: gInfo?.komi || '0',
        handicap: gInfo?.handicap || '0',
        size: gInfo?.size?.[0] || '19',
        gameComment: gInfo?.gameComment,
      })
    },
    [selectGameIdx, gameInfos.value]
  )

  const handleConfirm = useCallback(() => {
    if (selectGameIdx !== curGameIndex.value) {
      switchGame(store, selectGameIdx)
    }

    setTimeout(() => {
      const isEmptyTree = rootNode.value?.children?.length === 0
      const data: any = {
        blackName: info.bPlayerName,
        blackRank: info.bPlayerRank,
        whiteName: info.wPlayerName,
        whiteRank: info.wPlayerRank,
        gameName: info.gameName,
        eventName: info.eventName,
        gameComment: info.gameComment,
        date: info.date,
        result: info.result,
        komi: info.komi,
      }
      if (isEmptyTree) {
        data.handicap = info.handicap
        data.size = [info.size, info.size]
      }
      setGameInfo(store, data)
      setMode(store, 'play')
    }, 0)
  }, [store, rootNode.value, info, selectGameIdx, curGameIndex.value])

  const handleCancel = useCallback(() => {
    setMode(store, 'play')
  }, [store])

  return (
    <div className="relative shrink-0 w-full grow flex-nowrap text-[var(--text-normal)] px-4">
      <div className="">
        <div className="flex items-center justify-center pt-4 pb-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center shrink-0">
              <input
                type="text"
                className="text-right rounded-r-none max-w-16 relative z-10 left-[1px] focus:z-30"
                value={info.bPlayerRank}
                placeholder={t('RANK')}
                onInput={(e) => handleInfoChange(e, 'bPlayerRank')}
              />
              <input
                type="text"
                className="relative z-20 text-right rounded-l-none max-w-24"
                value={info.bPlayerName}
                placeholder={t('BLACK')}
                onInput={(e) => handleInfoChange(e, 'bPlayerName')}
              />
            </div>
            <div className="flex items-center mx-3 shrink-0">
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
              <input
                type="text"
                className="relative z-20 rounded-r-none max-w-24"
                value={info.wPlayerName}
                placeholder={t('WHITE')}
                onInput={(e) => handleInfoChange(e, 'wPlayerName')}
              />
              <input
                type="text"
                className="rounded-l-none max-w-16 relative z-10 right-[1px] focus:z-30"
                value={info.wPlayerRank}
                placeholder={t('RANK')}
                onInput={(e) => handleInfoChange(e, 'wPlayerRank')}
              />
            </div>
          </div>
        </div>
        <div className="flex mt-4">
          <div className="min-w-80 grow w-[calc(50%-16px)] mr-8">
            <div className="flex items-center mb-2">
              <div className="w-24 mr-2 text-xs shrink-0">{t('GAME_NAME')}:</div>
              <input
                type="text"
                className="grow"
                value={info.gameName}
                placeholder={t('GAME_NAME')}
                onInput={(e) => handleInfoChange(e, 'gameName')}
              />
            </div>

            <div className="flex items-center mb-2">
              <div className="w-24 mr-2 text-xs shrink-0">{t('TOURNAMENT_NAME')}:</div>
              <input
                type="text"
                className="grow"
                value={info.eventName}
                placeholder={t('TOURNAMENT_NAME')}
                onInput={(e) => handleInfoChange(e, 'eventName')}
              />
            </div>

            <div className="flex items-center mb-2">
              <div className="w-24 mr-2 text-xs shrink-0">{t('DATE')}:</div>
              <input
                type="text"
                className="grow"
                value={info.date}
                placeholder={t('DATE')}
                onInput={(e) => handleInfoChange(e, 'date')}
              />
            </div>

            <div className="flex items-center mb-2">
              <div className="w-24 mr-2 text-xs shrink-0">{t('NOTES')}:</div>
              <input
                type="text"
                className="grow"
                value={info.gameComment}
                placeholder={'-'}
                onInput={(e) => handleInfoChange(e, 'gameComment')}
              />
            </div>
          </div>
          <div className="min-w-80 grow w-[calc(50%-16px)]">
            <div className="flex items-center mb-2">
              <div className="w-24 mr-2 text-xs shrink-0">{t('GAME_RESULT')}:</div>
              <input
                type="text"
                className="grow"
                value={info.result}
                placeholder={'-'}
                onInput={(e) => handleInfoChange(e, 'result')}
              />
            </div>

            <div className="flex items-center mb-2">
              <div className="w-24 mr-2 text-xs shrink-0">{t('KOMI')}:</div>
              <input
                type="number"
                className="grow"
                step={0.5}
                value={info.komi}
                placeholder="0"
                onInput={(e) => handleInfoChange(e, 'komi')}
              />
            </div>

            <div className="flex items-center mb-2">
              <div className="w-24 mr-2 text-xs shrink-0">{t('HANDICAP')}:</div>
              <select
                disabled={rootNode.value.children.length !== 0}
                value={info.handicap}
                onChange={(e) => handleInfoChange(e, 'handicap')}
                class="grow"
              >
                <option value="0">No stones</option>
                {[...Array(8)].map((_, i) => (
                  <option value={String(i + 2)}>{i + 2} stones</option>
                ))}
              </select>
            </div>

            <div className="flex items-center mb-2">
              <div className="w-24 mr-2 text-xs shrink-0">{t('GOBAN_SIZE')}:</div>
              <select
                disabled={rootNode.value.children.length !== 0}
                value={info.size}
                onChange={(e) => handleInfoChange(e, 'size')}
                class="grow"
              >
                {[...Array(24)].map((_, i) => (
                  <option value={String(i + 2)}>
                    {i + 2} × {i + 2}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="h-0.5 w-full bg-[rgba(0,0,0,0.05)] rounded my-4" />
      <div className="flex items-center justify-between">
        <div>
          {gameTrees.value?.length > 1 ? (
            <div className="flex items-center">
              <div className="w-24 mr-2 text-xs shrink-0 font-semibold text-[var(--text-muted)]">
                {t('SWITCH_GAME')}:
              </div>
              <select value={selectGameIdx} onChange={handleSwitchGame} class="w-80">
                {gameInfos.value.map((g, i) => (
                  <option value={String(i)}>
                    Game-{i + 1}
                    {g.gameName || g.eventName ? `: ${g.gameName || g.eventName}` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-end">
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
    </div>
  )
}

export default GameInfo
