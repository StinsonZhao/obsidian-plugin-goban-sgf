import { fromDimensions } from '@sabaki/go-board'
import { parseVertex, parseCompressedVertices, stringifyVertex } from '@sabaki/sgf'
import { t } from '@/lang/helper'
import { typographer } from '@/utils/utils'
import boardmatcher from '@sabaki/boardmatcher'

let boardCache: { [id: string]: any } = {}

export interface HistoryItem {
  gameTrees: any[]
  gameIndex: number
  treePosition: string
  timestamp: number
}

const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const clearBoardCache = () => {
  boardCache = {}
}

export const getBoard = (tree: any, id: string) => {
  let treePositions = []
  let board = null
  for (let node of tree.listNodesVertically(id, -1, {})) {
    if (boardCache[node.id] != null && node.id !== id) {
      board = boardCache[node.id]
      break
    }
    treePositions.unshift(node.id)
  }

  if (!board) {
    let size = [19, 19]
    if (tree.root.data.SZ != null) {
      let value = tree.root.data.SZ[0]
      if (value.includes(':')) size = value.split(':')
      else size = [value, value]
      size = size.map((x) => (isNaN(x) ? 19 : +x))
    }
    board = fromDimensions(...size)
  }

  let inner = (tree: any, id: any, baseboard: any) => {
    let node = tree.get(id)
    let parent = tree.get(node.parentId)
    if (node == null) return null

    let vertex = null
    let board = null

    // Make move

    let propData: { [k: string]: any } = { B: 1, W: -1 }

    for (let prop in propData) {
      if (node.data[prop] == null) continue

      vertex = parseVertex(node.data[prop][0])
      board = baseboard.makeMove(propData[prop], vertex)
      board.currentVertex = vertex

      break
    }

    if (!board) board = baseboard.clone()

    // Add markup

    propData = { AW: -1, AE: 0, AB: 1 }

    for (let prop in propData) {
      if (node.data[prop] == null) continue

      for (let value of node.data[prop]) {
        for (let vertex of parseCompressedVertices(value)) {
          if (!board.has(vertex)) continue
          board.set(vertex, propData[prop])
        }
      }
    }

    Object.assign(board, {
      markers: board.signMap.map((row: any) => row.map((_: any) => null)),
      lines: [],
      childrenInfo: [],
      siblingsInfo: [],
    })

    if (vertex != null && board.has(vertex)) {
      let [x, y] = vertex
      board.markers[y][x] = { type: 'point' }
    }

    propData = { CR: 'circle', MA: 'cross', SQ: 'square', TR: 'triangle' }

    for (let prop in propData) {
      if (node.data[prop] == null) continue

      for (let value of node.data[prop]) {
        for (let [x, y] of parseCompressedVertices(value)) {
          if (board.markers[y] == null) continue
          board.markers[y][x] = { type: propData[prop] }
        }
      }
    }

    if (node.data.LB != null) {
      for (let composed of node.data.LB) {
        let sep = composed.indexOf(':')
        let point = composed.slice(0, sep)
        let label = composed.slice(sep + 1)
        let [x, y] = parseVertex(point)

        if (board.markers[y] == null) continue
        board.markers[y][x] = { type: 'label', label }
      }
    }

    if (node.data.L != null) {
      for (let i = 0; i < node.data.L.length; i++) {
        let point = node.data.L[i]
        let label = alpha[i]
        if (label == null) return
        let [x, y] = parseVertex(point)

        if (board.markers[y] == null) continue
        board.markers[y][x] = { type: 'label', label }
      }
    }

    for (let type of ['AR', 'LN']) {
      if (node.data[type] == null) continue

      for (let composed of node.data[type]) {
        let sep = composed.indexOf(':')
        let [v1, v2] = [composed.slice(0, sep), composed.slice(sep + 1)].map(parseVertex)

        board.lines.push({ v1, v2, type: type === 'AR' ? 'arrow' : 'line' })
      }
    }

    // Add variation overlays

    let addInfo = (node: any, list: any) => {
      let v: any, sign: any

      if (node.data.B != null) {
        v = parseVertex(node.data.B[0])
        sign = 1
      } else if (node.data.W != null) {
        v = parseVertex(node.data.W[0])
        sign = -1
      } else {
        return
      }

      if (!board.has(v)) return

      let type = null

      if (node.data.BM != null) {
        type = 'bad'
      } else if (node.data.DO != null) {
        type = 'doubtful'
      } else if (node.data.IT != null) {
        type = 'interesting'
      } else if (node.data.TE != null) {
        type = 'good'
      }

      list[v] = { sign, type }
    }

    for (let child of node.children) {
      addInfo(child, board.childrenInfo)
    }

    if (parent != null) {
      for (let sibling of parent.children) {
        addInfo(sibling, board.siblingsInfo)
      }
    }

    boardCache[id] = board
    return board
  }

  for (let id of treePositions) {
    board = inner(tree, id, board)
  }

  return board
}

export const getRootProperty = (tree, property, fallback = null) => {
  let result = ''
  if (property in tree.root.data) result = tree.root.data[property][0]

  return result === '' ? fallback : result
}

export const getGameInfo = (tree) => {
  let komi = getRootProperty(tree, 'KM')
  if (komi != null && !isNaN(komi)) komi = +komi
  else komi = null

  let size = getRootProperty(tree, 'SZ')
  if (size == null) {
    size = [19, 19]
  } else {
    let s = size.toString().split(':')
    size = [+s[0], +s[s.length - 1]]
  }

  let handicap = getRootProperty(tree, 'HA', 0)
  handicap = Math.max(1, Math.min(9, Math.round(handicap)))
  if (handicap === 1) handicap = 0

  let playerNames = ['B', 'W'].map(
    (x) => getRootProperty(tree, `P${x}`) || getRootProperty(tree, `${x}T`)
  )

  let playerRanks = ['BR', 'WR'].map((x) => getRootProperty(tree, x))

  return {
    playerNames,
    playerRanks,
    blackName: playerNames[0],
    blackRank: playerRanks[0],
    whiteName: playerNames[1],
    whiteRank: playerRanks[1],
    gameName: getRootProperty(tree, 'GN'),
    eventName: getRootProperty(tree, 'EV'),
    gameComment: getRootProperty(tree, 'GC'),
    date: getRootProperty(tree, 'DT'),
    result: getRootProperty(tree, 'RE'),
    komi,
    handicap,
    size,
  }
}

export const getPlayer = (tree, treePosition) => {
  const { data } = tree.get(treePosition)

  return data.PL != null
    ? data.PL[0] === 'W'
      ? -1
      : 1
    : data.B != null || (data.HA != null && +data.HA[0] >= 1)
    ? -1
    : 1
}

export const positionAnnotationOptions = [
  {
    label: t('AN_GOOD_FOR_BLACK'),
    value: 'GB',
  },
  {
    label: t('AN_UNCLEAR_POSITION'),
    value: 'UC',
  },
  {
    label: t('AN_EVEN_POSITION'),
    value: 'DM',
  },
  {
    label: t('AN_GOOD_FOR_WHITE'),
    value: 'GW',
  },
]

export const moveAnnotationOptions = [
  {
    label: t('AN_GOOD_MOVE'),
    value: 'TE',
  },
  {
    label: t('AN_INTERESTING_MOVE'),
    value: 'IT',
  },
  {
    label: t('AN_DOUBTFUL_MOVE'),
    value: 'DO',
  },
  {
    label: t('AN_BAD_MOVE'),
    value: 'BM',
  },
]

export const hotspotOption = {
  label: t('AN_HOTSPOT'),
  value: 'HO',
}

export const getAnnos = (node) => {
  if (!node) {
    return {
      moveAnnotation: [null, 1],
      positionAnnotation: [null, 1],
      isHotspot: false,
    }
  }
  return {
    moveAnnotation:
      node.data.BM != null
        ? ['BM', node.data.BM[0]]
        : node.data.DO != null
        ? ['DO', 1]
        : node.data.IT != null
        ? ['IT', 1]
        : node.data.TE != null
        ? ['TE', node.data.TE[0]]
        : [null, 1],
    positionAnnotation:
      node.data.UC != null
        ? ['UC', node.data.UC[0]]
        : node.data.GW != null
        ? ['GW', node.data.GW[0]]
        : node.data.DM != null
        ? ['DM', node.data.DM[0]]
        : node.data.GB != null
        ? ['GB', node.data.GB[0]]
        : [null, 1],
    isHotspot: node.data.HO != null,
  }
}

export const getMoveInterpretation = (node, gameTree, treePosition) => {
  // Determine root node
  if (node.parentId == null) {
    let result: any = []

    if (node.data.EV != null) {
      result.push(node.data.EV[0])
    }
    if (node.data.GN != null) {
      result.push(node.data.GN[0])
    }

    result = result.filter((x) => x.trim() !== '').join(' — ')
    if (result !== '') {
      return typographer(result)
    }

    return ''
  }

  // Determine end of main variation and show game result
  if (node.children.length === 0 && gameTree.onMainLine(treePosition)) {
    let result = getRootProperty(gameTree, 'RE', '')
    if (result.trim() !== '') {
      return t('GAME_RESULT') + ': ' + result.trim()
    }
  }

  // Get current vertex

  let vertex, sign

  if (node.data.B != null) {
    sign = 1
    vertex = parseVertex(node.data.B[0])
  } else if (node.data.W != null) {
    sign = -1
    vertex = parseVertex(node.data.W[0])
  } else {
    return ''
  }
  let prevBoard = getBoard(gameTree, node.parentId)
  let patternMatch = boardmatcher.findPatternInMove(prevBoard.signMap, sign, vertex)
  if (patternMatch == null) {
    let diff = vertex
      .map((z, i) => Math.min(z + 1, [prevBoard.width, prevBoard.height][i] - z))
      .sort((a, b) => a - b)

    if (diff[0] > 6) {
      return ''
    }

    return t(`BM_${diff[0]}-${diff[1]}_POINT` as any)
  }

  const board = getBoard(gameTree, treePosition)
  const matchedVertices = [...patternMatch.match.anchors, ...patternMatch.match.vertices].filter(
    (v) => board.get(v) !== 0
  )

  return {
    patternName: t(getPatternNameI18NKey(patternMatch.pattern.name)),
    url: patternMatch.pattern.url,
    matchedVertices,
  }
}

export const getPatternNameI18NKey = (name: string): any => {
  let n = name
  n = n.replace(/\s/g, '_').toUpperCase()
  return `BM_${n}` as any
}

export const getMatrixDict= (tree) => {
  let matrix = [...Array(tree.getHeight() + 1)].map(_ => [])
  let dict = {}

  let inner = (node, matrix, dict, xshift, yshift) => {
    let sequence = [...tree.getSequence(node.id)]
    let hasCollisions = true

    while (hasCollisions) {
      hasCollisions = false

      for (let y = 0; y <= sequence.length; y++) {
        if (xshift >= matrix[yshift + y].length - (Number(y === sequence.length)))
          continue

        hasCollisions = true
        xshift++
        break
      }
    }

    for (let y = 0; y < sequence.length; y++) {
      matrix[yshift + y][xshift] = sequence[y].id
      dict[sequence[y].id] = [xshift, yshift + y]
    }

    let lastSequenceNode = sequence.slice(-1)[0]

    for (let k = 0; k < lastSequenceNode.children.length; k++) {
      let child = lastSequenceNode.children[k]
      inner(child, matrix, dict, xshift + k, yshift + sequence.length)
    }

    return [matrix, dict]
  }

  return inner(tree.root, matrix, dict, 0, 0)
}

export const getMatrixWidth = (y, matrix) => {
  let keys = [...Array(10)]
    .map((_, i) => i + y - 4)
    .filter(i => i >= 0 && i < matrix.length)

  let padding = Math.min(
    ...keys.map(i => {
      for (let j = 0; j < matrix[i].length; j++)
        if (matrix[i][j] != null) return j
      return 0
    })
  )

  let width = Math.max(...keys.map(i => matrix[i].length)) - padding

  return [width, padding]
}
