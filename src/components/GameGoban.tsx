import { Goban as SabakiGoban, Vertex } from '@sabaki/shudan'
import { useMeasure } from '@/hooks/useMeasure'
import { useContext, useState, useEffect, useRef, useMemo } from 'preact/hooks'
import { GobanContext } from '@/store/store'
import { Focus } from '@/icons/annos'
import { t } from '@/lang/helper'
import { Prev, Next } from '@/icons/navs'
import { debounce } from 'obsidian'
import { goStep, clickVertex } from '@/store/actions'

export interface GameGobanProps {}

const debounceSetStep = debounce((v: number, store: any, curStep: any) => {
  const st = Number(v) - curStep.value
  if (st) {
    goStep(store, st)
  }
}, 600)

const GameGoban = () => {
  const [mref, { width, height }] = useMeasure()
  const store = useContext(GobanContext)
  const {
    signMap,
    markerMap,
    ghostStoneMap,
    fuzzyStonePlacement,
    curAnnos,
    selectedVertices,
    curStep,
    totalSteps,
    gobanRange,
    gameInfo,
  } = store

  const [step, setStep] = useState(curStep.value || 0)
  const stepRef = useRef(step)
  useEffect(() => {
    if (Number(stepRef.current || 0) !== Number(curStep.value || 0)) {
      stepRef.current = curStep.value || 0
      setStep(stepRef.current)
    }
  }, [curStep.value])

  const handleProcessChange = (e) => {
    const v = e.target.value
    setStep((pre) => (isNaN(Number(v)) ? pre : Number(v)))
    stepRef.current = isNaN(Number(v)) ? step : Number(v)
    debounceSetStep(Number(v), store, curStep)
  }
  const stepPercent =
    Math.floor((totalSteps.value ? (step || 0) / totalSteps.value : 0) * 10000) / 100

  const [clicked, setClicked] = useState(false)
  const handling = useRef(false)
  const handleVertexClick = async (e, vertex) => {
    if (handling.current) {
      return
    }
    try {
      handling.current = false
      const { button = 0, ctrlKey = false, metaKey = false, clientX = 0, clientY = 0 } = e
      setClicked(true)
      await clickVertex(store, vertex, button, ctrlKey || metaKey, clientX, clientY)
      setTimeout(() => {
        setClicked(false)
      }, 200)
    } catch {
      //
    } finally {
      handling.current = false
    }
  }

  const vSize = useMemo(() => {
    let s = 24
    const gobanSize = isNaN(Number(gameInfo.value?.size?.[0]))
      ? 19
      : Number(gameInfo.value?.size?.[0])
    const { x = [0, gobanSize - 1], y = [0, gobanSize - 1] } = gobanRange.value || {}

    const vBasedW = Math.floor(width / (x[1] - x[0] + 1 + 2 * 0.25 + 2 * 0.15))
    const vBasedH = Math.floor(height / (y[1] - y[0] + 1 + 2 * 0.25 + 2 * 0.15))

    s = Math.min(vBasedW, vBasedH)

    return s
  }, [width, height, gobanRange, gameInfo])

  return (
    <div className="relative flex flex-col items-center w-full h-full grow">
      <div
        className={`absolute inset-0 z-0 rounded ${
          curAnnos.value.isHotspot ? 'border-[3px] border-solid border-[var(--text-accent)]' : ''
        }`}
      >
        <div className={`relative h-full w-full rounded opacity-50 goban-sgf-app_bg`}></div>
        {curAnnos.value.isHotspot ? (
          <div className="absolute left-[50%] bottom-0 transform -translate-x-[50%] h-6 text-xs text-white font-semibold flex items-center px-2 pt-[3px] rounded-t-md whitespace-nowrap flex-nowrap bg-[var(--text-accent)]">
            <div className="w-3 h-3">
              <Focus opposition />
            </div>
            <span className="ml-1">{t('AN_HOTSPOT')}</span>
          </div>
        ) : null}
      </div>
      <div className="relative z-10 flex flex-col w-full grow shrink-0">
        <div class="shrink-0 grow h-full w-full flex justify-center items-center relative rounded">
          <div ref={mref} className="absolute inset-4">
            {width && height && (
              <div class="h-full w-full relative z-10 flex justify-center items-center">
                <SabakiGoban
                  vertexSize={vSize}
                  signMap={signMap.value}
                  markerMap={markerMap.value}
                  ghostStoneMap={ghostStoneMap.value}
                  animateStonePlacement={clicked}
                  rangeX={gobanRange.value?.x || undefined}
                  rangeY={gobanRange.value?.y || undefined}
                  fuzzyStonePlacement={fuzzyStonePlacement.value}
                  selectedVertices={selectedVertices.value}
                  onVertexMouseDown={handleVertexClick}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`relative z-20 mb-3 flex items-center shrink-0 w-[60%] group transition ${totalSteps.value ? 'opacity-100' : 'opacity-0'}`}>
        <div
          className={`shrink-0 p-4 flex justify-center items-center text-[var(--text-muted)] transition hover:text-[var(--text-accent)] ${
            step > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'
          }`}
          onClick={step > 0 ? () => goStep(store, -1) : undefined}
        >
          <div className="w-4 h-4 transform scale-75">
            <Prev />
          </div>
        </div>
        <div className="relative z-10 flex items-center grow">
          <input
            className="relative z-10 w-full m-0 rounded-lg appearance-none cursor-pointer goban-sgf-plugin-process"
            style={{
              backgroundImage: `linear-gradient(to right, hsl(var(--accent-h), var(--accent-s), var(--accent-l)) ${stepPercent}%, var(--background-modifier-border) ${stepPercent}%)`,
            }}
            type="range"
            min={0}
            max={totalSteps.value}
            value={step}
            onInput={handleProcessChange}
          />
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center h-8 transition opacity-0 group-hover:opacity-100">
            <div className="flex justify-center items-center text-xs text-[var(--text-faint)]">
              <div className="text-[var(--text-accent)]">{step}</div>
              <div className="transform scale-75 opacity-50 font-semibold origin-center mx-0.5">
                /
              </div>
              <div>{totalSteps.value}</div>
            </div>
          </div>
        </div>
        <div
          className={`shrink-0 p-4 flex justify-center items-center text-[var(--text-muted)]  transition hover:text-[var(--text-accent)] ${
            step < totalSteps.value ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'
          }`}
          onClick={step === totalSteps.value ? undefined : () => goStep(store, 1)}
        >
          <div className="w-4 h-4 transform scale-75">
            <Next />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameGoban
