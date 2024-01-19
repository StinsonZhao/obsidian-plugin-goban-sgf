import '@sabaki/shudan/css/goban.css'
import { useRef, useEffect } from 'preact/hooks'
import GameGoban from './GameGoban'
import FuncBar from './FuncBar'
import Comment from './Comment'
import GameGraph from './GameGraph'
import { Store, GobanContext } from '@/store/store'
import { goStep, startAutoscrolling, stopAutoscrolling, undo, redo, getSGF } from '@/store/actions'
import { isTextLikeElement } from '@/utils/utils'
import { BODY_DATA_HTML_TOKEN } from '@/consts/consts'

export interface GobanProps {
  store: Store
  onChange: (
    sgfEnrty: { sgf: string; timestamp: number },
    options: { immediately?: boolean; needRerender?: boolean }
  ) => Promise<void>
}

const App = ({ store, onChange }: GobanProps) => {
  const storeRef = useRef(store)
  storeRef.current = store
  const residueDeltaYRef = useRef(0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.body.dataset[BODY_DATA_HTML_TOKEN] !== storeRef.current.id.value) {
        return
      }

      if (
        !e.ctrlKey &&
        !e.metaKey &&
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        if (isTextLikeElement(document.activeElement)) {
          return
        }

        e.preventDefault()

        let sign = e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 1
        startAutoscrolling(storeRef.current, sign)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (isTextLikeElement(document.activeElement)) {
          return
        }
        e.preventDefault()
        let step = -1
        if (e.shiftKey) {
          step = -step
        }

        if (step < 0) {
          undo(storeRef.current)
        } else {
          redo(storeRef.current)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (document.body.dataset[BODY_DATA_HTML_TOKEN] !== storeRef.current.id.value) {
        return
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        stopAutoscrolling()
      }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (!residueDeltaYRef.current) {
        residueDeltaYRef.current = 0
      }
      residueDeltaYRef.current += e.deltaY
      if (Math.abs(residueDeltaYRef.current) >= 40) {
        goStep(storeRef.current, Math.sign(residueDeltaYRef.current))
        residueDeltaYRef.current = 0
      }
    }

    document
      .querySelectorAll(`.goban-sgf-plugin-app-${storeRef.current.id.value} .wheel-nav`)
      .forEach((el) => {
        el.addEventListener('wheel', handleWheel)
      })
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      document
        .querySelectorAll(`.goban-sgf-plugin-app-${storeRef.current.id.value} .wheel-nav`)
        .forEach((el) => {
          el.removeEventListener('wheel', handleWheel)
        })
    }
  }, [store])

  const { gameTreesHashs } = store

  const onChangeRef = useRef(onChange)
  useEffect(() => {
    const cont = getSGF(storeRef.current)
    onChangeRef.current &&
      onChangeRef.current(
        {
          sgf: cont,
          timestamp: Date.now(),
        },
        {
          immediately: false,
        }
      )
  }, [gameTreesHashs.value])

  return (
    <GobanContext.Provider value={store}>
      <div className="flex w-full h-full">
        <div className="flex flex-col h-full mr-2 grow">
          <div className="w-full grow mb-2 rounded bg-[var(--background-primary-alt)] game-goban wheel-nav">
            <GameGoban />
          </div>
          <div className="w-full shrink-0 rounded bg-[var(--background-primary-alt)] relative">
            <div className="absolute inset-0 z-0 opacity-20 goban-sgf-app_bg"></div>
            <FuncBar onSGFChange={onChange} />
          </div>
        </div>
        <div className="flex flex-col h-full w-80 shrink-0">
          <div className="relative w-full rounded bg-[var(--background-primary-alt)] grow mb-2 game-graph">
            <div className="absolute inset-0 z-0 opacity-20 goban-sgf-app_bg"></div>
            <GameGraph />
          </div>
          <div className="relative w-full h-96 shrink-0 rounded bg-[var(--background-primary-alt)]">
            <div className="absolute inset-0 z-0 opacity-20 goban-sgf-app_bg"></div>
            <Comment />
          </div>
        </div>
      </div>
    </GobanContext.Provider>
  )
}

export default App
