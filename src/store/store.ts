import { App } from 'obsidian'
import { signal, computed, effect } from '@preact/signals'
import { sgf2Games } from '@/utils/goban'
import sgf from '@sabaki/sgf'
import { createContext } from 'preact'
import {
  getBoard,
  getGameInfo,
  getPlayer,
  getAnnos,
  getMoveInterpretation,
  getMatrixDict,
  HistoryItem,
} from './common'
import { GobanSGFPluginFrontmatterSettings, GobanSGFPluginSettings, mergeSettings } from '../settings'
import type GobanSGFView from '@/GobanSGFView'
import type GobanSGFPlugin from '@/main'

interface ObObjects {
  obViewID?: number | string
  obView?: GobanSGFView
  obPlugin?: GobanSGFPlugin
  obApp?: App
}

export const createStore = (
  data: string,
  fmData: GobanSGFPluginFrontmatterSettings,
  pSettings: GobanSGFPluginSettings,
  { obViewID, obView, obPlugin, obApp: oa }: ObObjects,
  {
    onFrontmatterChange,
  }: {
    onFrontmatterChange?: (fm: GobanSGFPluginFrontmatterSettings) => void
  }
) => {
  const games = sgf2Games(data)
  const id = computed(() => obViewID || '-1')
  const view = computed(() => obView)
  const plugin = computed(() => obPlugin)
  const obApp = computed(() => oa)
  const frontmatterData = signal(fmData)
  const pluginSettings = signal(pSettings)
  const settings = computed(() => mergeSettings(frontmatterData.value, pluginSettings.value))

  effect(() => {
    onFrontmatterChange && onFrontmatterChange(frontmatterData.value)
  })

  const gameTrees = signal(games)
  const curGameIndex = signal(0)
  const curGame = computed(
    () => gameTrees?.value?.[curGameIndex.value] || gameTrees?.value?.[0] || null
  )
  const rootNode = computed(() => curGame?.value?.root || null)
  // main path in the current gameTree, key for parent node id, value for node id
  const currents = signal<{
    [id: string]: string | number
  }>({})
  const defaultCurTreePositionNodeID = (() => {
    if (settings.value.gotoEndAtBeginning) {
      const [node] = [...curGame.value?.listCurrentNodes(currents.value)]?.slice(-1)
      return node.id || rootNode.value?.id || ''
    }
    return rootNode.value?.id || ''
  })()
  const curTreePositionNodeID = signal(defaultCurTreePositionNodeID)
  const curNode = computed(() => curGame.value?.get(curTreePositionNodeID.value) || null)
  const curStep = computed(() => curGame.value?.getLevel(curTreePositionNodeID.value) || 0)
  const totalSteps = computed(() => {
    const r = Math.max((curGame.value?.getCurrentHeight(currents.value) || 0) - 1, 0)
    return r
  })
  const curNodeCommentTitle = computed(() =>
    curNode.value?.data.N ? curNode.value?.data.N[0] : ''
  )
  const curNodeCommentContent = computed(() =>
    curNode.value?.data.C ? curNode.value?.data.C[0] : ''
  )

  const board = computed(() =>
    getBoard(curGame?.value, curTreePositionNodeID.value || rootNode?.value?.id || '')
  )
  const gobanRange = computed(() => settings.value.gobanRange)
  const signMap = computed(() => board.value?.signMap)
  const showMoveNumbers = computed(() => settings.value.showMoveNumbers)
  const showLastMoveNumbers = computed(() => settings.value.showLastMoves)
  const markerMap = computed(() => {
    let markerMap = board.value?.markers || []
    if (showMoveNumbers.value) {
      markerMap = markerMap.map((row) => row.map((_) => null))
      const history = [
        ...curGame.value.listNodesVertically(curTreePositionNodeID.value, -1, {}),
      ].reverse()
      for (let i = 0; i < history.length; i++) {
        const node = history[i]
        let vertex = [-1, -1]
        if (node.data.B != null) {
          vertex = sgf.parseVertex(node.data.B[0])
        } else if (node.data.W != null) {
          vertex = sgf.parseVertex(node.data.W[0])
        }
        const [x, y] = vertex
        if (markerMap[y] != null && x < markerMap[y].length) {
          markerMap[y][x] = { type: 'label', label: i.toString() }
        }
      }
    } else if (showLastMoveNumbers.value > 0) {
      markerMap = markerMap.map((row) => row.map((it) => it))
      const history = [
        ...curGame.value.listNodesVertically(curTreePositionNodeID.value, -1, {}),
      ].reverse()
      const start = history.length > showLastMoveNumbers.value ? history.length - showLastMoveNumbers.value : 0
      for (let i = start; i < history.length; i++) {
        const node = history[i]
        let vertex = [-1, -1]
        if (node.data.B != null) {
          vertex = sgf.parseVertex(node.data.B[0])
        } else if (node.data.W != null) {
          vertex = sgf.parseVertex(node.data.W[0])
        }
        const [x, y] = vertex
        if (markerMap[y] != null && x < markerMap[y].length) {
          markerMap[y][x] = { type: 'label', label: i.toString() }
        }
      }
    }
    return markerMap
  })
  const showNextMoves = computed(() => settings.value.showNextMoves)
  const showSiblings = computed(() => settings.value.showSiblings)
  const ghostStoneMap = computed(() => {
    let ghostStoneMap = []
    if (showNextMoves.value || showSiblings.value) {
      ghostStoneMap = board.value.signMap.map((row) => row.map((_) => null))

      if (showSiblings.value) {
        for (let v in board.value.siblingsInfo) {
          let [x, y] = v.split(',').map((x) => +x)
          let { sign } = board.value.siblingsInfo[v]

          ghostStoneMap[y][x] = { sign, faint: showNextMoves }
        }
      }

      if (showNextMoves.value) {
        for (let v in board.value.childrenInfo) {
          let [x, y] = v.split(',').map((x) => +x)
          let { sign, type } = board.value.childrenInfo[v]

          ghostStoneMap[y][x] = { sign, type }
        }
      }
    }

    return ghostStoneMap
  })
  const fuzzyStonePlacement = computed(() => settings.value.fuzzyStonePlacement)
  const mode = signal<'play' | 'edit' | 'gameInfo'>(settings.value.initMode || 'play')
  const gameInfo = computed(() => getGameInfo(curGame.value))
  const curPlayer = computed(() => getPlayer(curGame.value, curTreePositionNodeID.value))
  const playerCaptures = computed(() => [1, -1].map((sign) => board.value?.getCaptures(sign)))
  const gameInfos = computed(() => {
    const games = gameTrees.value || []
    return games.map((game) => getGameInfo(game))
  })

  const curTool = signal<'stone' | 'cross' | 'triangle' | 'square' | 'circle' | 'label' | 'number'>(
    'stone'
  )
  const curStoneTool = signal<number>(curPlayer.value || 1)

  const commentMode = signal<'edit' | 'view'>(settings.value.initCommentMode || 'view')
  const curAnnos = computed(() => getAnnos(curNode.value))
  const moveInterpretation = computed(() =>
    getMoveInterpretation(curNode.value, curGame.value, curTreePositionNodeID.value)
  )

  const selectedVertices = signal<any[]>([])

  const matrixDict = computed(() => getMatrixDict(curGame.value))

  const history = signal<HistoryItem[]>([
    {
      gameTrees: gameTrees.value,
      gameIndex: curGameIndex.value,
      treePosition: curTreePositionNodeID.value,
      timestamp: Date.now(),
    },
  ])
  const historyCursor = signal(0)

  const gameTreesHashs = computed(() => gameTrees.value.map((gt) => gt.getHash()).join(','))

  return {
    id,
    view,
    plugin,
    obApp,
    gameTrees,
    frontmatterData,
    curGameIndex,
    curGame,
    rootNode,
    board,
    curTreePositionNodeID,
    curNode,
    curNodeCommentTitle,
    curNodeCommentContent,
    currents,
    signMap,
    markerMap,
    ghostStoneMap,
    fuzzyStonePlacement,
    mode,
    gameInfo,
    curPlayer,
    playerCaptures,
    gameInfos,
    curTool,
    curStoneTool,
    commentMode,
    curAnnos,
    moveInterpretation,
    selectedVertices,
    matrixDict,
    curStep,
    totalSteps,
    history,
    historyCursor,
    gameTreesHashs,
    gobanRange,
    settings,
  }
}

export type Store = ReturnType<typeof createStore>

export const GobanContext = createContext<Store>(null)
