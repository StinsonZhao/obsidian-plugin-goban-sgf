import { batch } from '@preact/signals'
import { stringifyVertex, parseVertex, parseCompressedVertices, stringify } from '@sabaki/sgf'
import { Store } from './store'
import { clearBoardCache, getBoard } from './common'
import modals from '@/modals/modals'
import { t } from '@/lang/helper'
import { shallowEquals } from '@/utils/utils'
import type { GobanSGFPluginFrontmatterSettings } from '@/settings'

export const switchGame = (store: Store, index: number) => {
  const {
    curGameIndex,
    gameTrees,
    curTreePositionNodeID,
    rootNode,
    currents,
    history,
    historyCursor,
  } = store

  batch(() => {
    curGameIndex.value = index >= 0 && index < gameTrees.value.length ? index : 0
    curTreePositionNodeID.value = rootNode.value?.id || ''
    currents.value = {}
    history.value = [
      {
        gameTrees: gameTrees.value,
        gameIndex: curGameIndex.value,
        treePosition: curTreePositionNodeID.value,
        timestamp: Date.now(),
      },
    ]
    historyCursor.value = 0
    clearBoardCache()
  })
}

export const setCurrentTreePosition = (store: Store, treePosition, newTree?, { clearCache = false } = {}) => {
  if (clearCache) {
    clearBoardCache()
  }

  const { curGame, currents, curTreePositionNodeID, gameTrees, curGameIndex } = store
  let tree = curGame.value
  if (newTree) {
    tree = newTree
    gameTrees.value = gameTrees.value.map((t, i) => (i === curGameIndex.value ? newTree : t))
  }
  let n = tree.get(treePosition)
  if (!tree.onCurrentLine(n.id, currents.value)) {
    currents.value = {}
  }
  while (n.parentId != null) {
    currents.value = {
      ...(currents.value || {}),
      [n.parentId]: n.id,
    }
    n = tree.get(n.parentId)
  }
  const prevTreePosition = curTreePositionNodeID.value
  curTreePositionNodeID.value = treePosition

  recordHistory(store, { prevGameIndex: curGameIndex.value, prevTreePosition })
}

export const goStep = (store: Store, step: number) => {
  let { curGame, curTreePositionNodeID, currents } = store
  let node = curGame.value?.navigate(curTreePositionNodeID.value, step, currents.value)
  if (node) {
    setCurrentTreePosition(store, node.id)
  }
}

let autoscrollId: NodeJS.Timeout | null = null
export const startAutoscrolling = (store: Store, step: number) => {
  if (autoscrollId != null) {
    return
  }

  let first = true
  let maxDelay = 200
  let minDelay = 50
  let diff = 10

  let scroll = (delay = null) => {
    goStep(store, step)

    clearTimeout(autoscrollId)
    autoscrollId = setTimeout(() => {
      scroll(first ? maxDelay : Math.max(minDelay, delay - diff))
      first = false
    }, delay)
  }

  scroll(320)
}

export const stopAutoscrolling = () => {
  clearTimeout(autoscrollId)
  autoscrollId = null
}

export const goToEnd = (store: Store) => {
  const { curGame, currents } = store
  const [node] = [...curGame.value?.listCurrentNodes(currents.value)].slice(-1)
  setCurrentTreePosition(store, node.id)
}

export const setPlayer = (store: Store, treePosition, sign) => {
  const { curGame } = store
  const newTree = curGame.value.mutate((draft) => {
    const node = draft.get(treePosition)
    const intendedSign =
      node.data.B != null || (node.data.HA != null && +node.data.HA[0] >= 1)
        ? -1
        : +(node.data.W != null)

    if (intendedSign === sign || sign === 0) {
      draft.removeProperty(treePosition, 'PL')
    } else {
      draft.updateProperty(treePosition, 'PL', [sign > 0 ? 'B' : 'W'])
    }
  })

  setCurrentTreePosition(store, treePosition, newTree)
}

export const setMode = (store: Store, m) => {
  const { mode } = store
  if (mode.value === m) {
    return
  }
  mode.value = m
}

export const setGameInfo = (store: Store, data) => {
  const { curGame, curTreePositionNodeID } = store
  const newTree = curGame.value.mutate((draft) => {
    if ('size' in data) {
      if (data.size) {
        let value = data.size
        value = value.map((x) => (isNaN(x) || !x ? 19 : Math.min(25, Math.max(2, x))))

        if (value[0] === value[1]) {
          value = value[0].toString()
        } else {
          value = value.join(':')
        }

        draft.updateProperty(draft.root.id, 'SZ', [value])
      } else {
        draft.removeProperty(draft.root.id, 'SZ')
      }
    }
  })

  const tree = newTree.mutate((draft) => {
    const props = {
      blackName: 'PB',
      blackRank: 'BR',
      whiteName: 'PW',
      whiteRank: 'WR',
      gameName: 'GN',
      eventName: 'EV',
      gameComment: 'GC',
      date: 'DT',
      result: 'RE',
      komi: 'KM',
      handicap: 'HA',
    }

    for (let key in props) {
      if (!(key in data)) continue
      let value = data[key]

      if (value && value.toString() !== '') {
        if (key === 'komi') {
          if (isNaN(value)) value = 0
        } else if (key === 'handicap') {
          let board = getBoard(newTree, newTree.root.id)
          let stones = board.getHandicapPlacement(+value)

          value = stones.length
          if (value <= 1) {
            draft.removeProperty(draft.root.id, props[key])
            draft.removeProperty(draft.root.id, 'AB')
            continue
          }

          draft.updateProperty(draft.root.id, 'AB', stones.map(stringifyVertex))
        }

        draft.updateProperty(draft.root.id, props[key], [value.toString()])
      } else {
        draft.removeProperty(draft.root.id, props[key])
      }
    }
  })

  setCurrentTreePosition(store, curTreePositionNodeID.value, tree)
}

export const setTool = (store: Store, tool) => {
  const { curTool } = store
  if (curTool.value === tool) {
    return
  }
  curTool.value = tool
}

export const toggleCurStoneTool = (store: Store) => {
  const { curStoneTool } = store
  curStoneTool.value = -curStoneTool.value
}

export const setCommentMode = (store: Store, m) => {
  const { commentMode } = store
  if (commentMode.value === m) {
    return
  }
  commentMode.value = m
}

export const setComment = (store: Store, treePosition, data) => {
  const { curGame } = store
  const newTree = curGame.value.mutate((draft) => {
    for (let [key, prop] of [
      ['title', 'N'],
      ['comment', 'C'],
    ]) {
      if (key in data) {
        if (data[key] && data[key] !== '') {
          draft.updateProperty(treePosition, prop, [data[key]])
        } else {
          draft.removeProperty(treePosition, prop)
        }
      }
    }

    if ('hotspot' in data) {
      if (data.hotspot) {
        draft.updateProperty(treePosition, 'HO', ['1'])
      } else {
        draft.removeProperty(treePosition, 'HO')
      }
    }

    let clearProperties = (properties) =>
      properties.forEach((p) => draft.removeProperty(treePosition, p))

    if ('moveAnnotation' in data) {
      let moveProps = { BM: '1', DO: '', IT: '', TE: '1' }
      clearProperties(Object.keys(moveProps))

      if (data.moveAnnotation != null) {
        draft.updateProperty(treePosition, data.moveAnnotation, [moveProps[data.moveAnnotation]])
      }
    }

    if ('positionAnnotation' in data) {
      let positionProps = { UC: '1', GW: '1', GB: '1', DM: '1' }
      clearProperties(Object.keys(positionProps))

      if (data.positionAnnotation != null) {
        draft.updateProperty(treePosition, data.positionAnnotation, [
          positionProps[data.positionAnnotation],
        ])
      }
    }
  })

  setCurrentTreePosition(store, treePosition, newTree)
}

export const setSelectedVertices = (store: Store, vs) => {
  const { selectedVertices } = store
  selectedVertices.value = vs
}

export const makeMainVariation = (store: Store, treePosition) => {
  const { currents, curGame } = store

  const newTree = curGame.value.mutate((draft) => {
    let id = treePosition

    while (id != null) {
      draft.shiftNode(id, 'main')
      id = draft.get(id).parentId
    }
  })

  currents.value = {}
  setCurrentTreePosition(store, treePosition, newTree)
}

export const shiftVariation = (store: Store, treePosition, sign) => {
  const { curGame } = store
  let shiftNode = null

  for (let node of curGame.value.listNodesVertically(treePosition, -1, {})) {
    let parent = curGame.value.get(node.parentId)

    if (parent.children.length >= 2) {
      shiftNode = node
      break
    }
  }

  if (shiftNode == null) {
    return
  }

  const newTree = curGame.value.mutate((draft) => {
    draft.shiftNode(shiftNode.id, sign >= 0 ? 'right' : 'left')
  })

  setCurrentTreePosition(store, treePosition, newTree)
}

export const removeNode = (store: Store, node) => {
  const { curGame, currents } = store
  const noParent = node.parentId == null

  const newTree = curGame.value.mutate((draft) => {
    if (!noParent) {
      draft.removeNode(node.id)
    } else {
      for (let child of node.children) {
        draft.removeNode(child.id)
      }
      for (let prop of ['AB', 'AW', 'AE', 'B', 'W']) {
        draft.removeProperty(node.id, prop)
      }
    }
  })

  if (!noParent) {
    if (currents.value?.[node.parentId] === node.id) {
      const crs = { ...(currents.value || {}) }
      delete crs?.[node.parentId]
      currents.value = crs
    }
  } else {
    const crs = { ...(currents.value || {}) }
    delete crs?.[node.id]
    currents.value = crs
  }

  setCurrentTreePosition(store, noParent ? node.id : node.parentId, newTree)
}

export const CommentProperties = ['C', 'N', 'UC', 'GW', 'DM', 'GB', 'BM', 'TE', 'DO', 'IT']

export const goToComment = (store: Store, step) => {
  const { curGame, curTreePositionNodeID, currents } = store
  let newTreePosition = null

  for (let node of curGame.value.listNodesVertically(
    curTreePositionNodeID.value,
    step,
    currents.value
  )) {
    if (
      node.id !== curTreePositionNodeID.value &&
      CommentProperties.some((prop) => node.data[prop] != null)
    ) {
      newTreePosition = node.id
      break
    }
  }

  if (newTreePosition != null) {
    setCurrentTreePosition(store, newTreePosition)
  }
}

export const goToFocus = (store: Store, step) => {
  const { curGame, curTreePositionNodeID, currents } = store
  let newTreePosition = null

  for (let node of curGame.value.listNodesVertically(
    curTreePositionNodeID.value,
    step,
    currents.value
  )) {
    if (node.id !== curTreePositionNodeID.value && node.data.HO !== null) {
      newTreePosition = node.id
      break
    }
  }

  if (newTreePosition != null) {
    setCurrentTreePosition(store, newTreePosition)
  }
}

export const goToBE = (store: Store, sign) => {
  const { curGame, rootNode, currents } = store
  if (sign < 0) {
    setCurrentTreePosition(store, rootNode.value.id)
    return
  }

  const [node] = [...curGame.value.listCurrentNodes(currents.value)].slice(-1)
  setCurrentTreePosition(store, node.id)
}

export const goToNextBranch = (store: Store) => {
  const { curGame, curTreePositionNodeID, currents } = store
  const next = curGame.value.navigate(curTreePositionNodeID.value, 1, currents.value)
  if (next == null) {
    return
  }
  const sequence = [...curGame.value.getSequence(next.id)]

  setCurrentTreePosition(store, sequence.slice(-1)[0].id)
}

export const goToPrevBranch = (store: Store) => {
  const { curGame, currents, curNode, rootNode } = store

  const prevNode = curGame.value.get(curNode.value.parentId)
  if (prevNode === null) {
    return
  }
  let newTreePosition = rootNode.value.id
  for (let node of curGame.value.listNodesVertically(prevNode.id, -1, currents.value)) {
    if (node.children.length > 1) {
      newTreePosition = node.id
      break
    }
  }

  setCurrentTreePosition(store, newTreePosition)
}

export const makeMove = (store: Store, vertex, { player = null } = {}) => {
  const { mode } = store
  if (mode.value !== 'play') {
    mode.value = 'play'
  }

  const { curGame, curTreePositionNodeID, curPlayer } = store
  const board = getBoard(curGame.value, curTreePositionNodeID.value)

  if (!player) {
    player = curPlayer.value
  }
  if (typeof vertex == 'string') {
    vertex = board.parseVertex(vertex)
  }

  const { pass, overwrite } = board.analyzeMove(player, vertex)
  if (!pass && overwrite) {
    return
  }

  const color = player > 0 ? 'B' : 'W'

  // Update data

  let nextTreePosition
  const newTree = curGame.value.mutate((draft) => {
    nextTreePosition = draft.appendNode(curTreePositionNodeID.value, {
      [color]: [stringifyVertex(vertex)],
    })
  })

  setCurrentTreePosition(store, nextTreePosition, newTree)
}

export const makeResign = (store: Store, { player = null } = {}) => {
  const { curGame, curPlayer, curTreePositionNodeID } = store
  if (player == null) {
    player = curPlayer.value
  }
  const color = player > 0 ? 'W' : 'B'

  let nextTreePosition
  const newTree = curGame.value.mutate((draft) => {
    draft.updateProperty(draft.root.id, 'RE', [`${color}+Resign`])

    nextTreePosition = draft.appendNode(curTreePositionNodeID.value, {
      N: [`${color}+Resign`],
    })
  })

  makeMainVariation(store, curTreePositionNodeID.value)
  setCurrentTreePosition(store, nextTreePosition, newTree)
}

export const clickVertex = async (store: Store, vertex, button, ctrlKey, x, y) => {
  const { curGame, board, curNode, curTreePositionNodeID, mode, curTool, curStoneTool, id } = store

  if (typeof vertex == 'string') {
    vertex = board.value.parseVertex(vertex)
  }

  const [vx, vy] = vertex
  if (mode.value === 'play') {
    if (button === 0) {
      if (board.value.get(vertex) === 0) {
        makeMove(store, vertex)
      } else if (
        board.value.markers[vy][vx] != null &&
        board.value.markers[vy][vx].type === 'point'
      ) {
        removeNode(store, curNode.value)
      }
    }
  } else if (mode.value === 'edit') {
    if (ctrlKey) {
      // Add coordinates to comment
      let coord = board.value.stringifyVertex(vertex)
      let commentText = curNode.value.data.C ? curNode.value.data.C[0] : ''

      let newTree = curGame.value.mutate((draft) => {
        draft.updateProperty(
          curTreePositionNodeID.value,
          'C',
          commentText !== '' ? [commentText.trim() + ' ' + coord] : [coord]
        )
      })

      setCurrentTreePosition(store, curTreePositionNodeID.value, newTree)

      return
    }

    if (button === 2) {
      // Right mouse click
      if (curTool.value === 'stone') {
        // Switch stone tool
        curStoneTool.value = -curStoneTool.value
      } else if (['number', 'label'].includes(curTool.value)) {
        // Show label editing context menu
        const res = await modals.InputPopup({
          props: {
            title: t('EDIT_LABEL'),
            initValue: board.value?.markers?.[vy]?.[vx]?.label || '',
          },
          id: id.value,
        })

        if (res) {
          useTool(store, 'label', vertex, res)
        }

        return
      }
    }

    useTool(store, curTool.value, vertex)
  }
}

export const useTool = (store: Store, tool, vertex, argument = null) => {
  const { curGame, curStoneTool, curPlayer, curTreePositionNodeID, curNode } = store
  let bd = getBoard(curGame.value, curTreePositionNodeID.value)
  let node = curNode.value

  if (typeof vertex == 'string') {
    vertex = bd.parseVertex(vertex)
  }

  const data = {
    cross: 'MA',
    triangle: 'TR',
    circle: 'CR',
    square: 'SQ',
    number: 'LB',
    label: 'LB',
  }

  const newTree = curGame.value.mutate((draft) => {
    if (tool === 'stone') {
      if (node.data.B != null || node.data.W != null || node.children.length > 0) {
        const id = draft.appendNode(curTreePositionNodeID.value, {
          PL: curPlayer.value > 0 ? ['B'] : ['W'],
        })
        node = draft.get(id)
      }

      const sign = curStoneTool.value
      const oldSign = bd.get(vertex)
      const properties = ['AW', 'AE', 'AB']
      const point = stringifyVertex(vertex)

      for (let prop of properties) {
        if (node.data[prop] == null) {
          continue
        }

        // Resolve compressed lists

        if (node.data[prop].some((x) => x.includes(':'))) {
          draft.updateProperty(
            node.id,
            prop,
            node.data[prop]
              .map((value) => parseCompressedVertices(value).map(stringifyVertex))
              .reduce((list, x) => [...list, x])
          )
        }

        // Remove residue

        draft.removeFromProperty(node.id, prop, point)
      }

      const prop = oldSign !== sign ? properties[sign + 1] : 'AE'
      draft.addToProperty(node.id, prop, point)
    } else {
      // Mutate board first, then apply changes to actual game tree

      const [x, y] = vertex

      if (tool === 'number') {
        if (bd.markers[y][x] != null && bd.markers[y][x].type === 'label') {
          bd.markers[y][x] = null
        } else {
          let number =
            node.data.LB == null
              ? 1
              : node.data.LB.map((x) => parseFloat(x.slice(3)))
                  .filter((x) => !isNaN(x))
                  .sort((a, b) => a - b)
                  .filter((x, i, arr) => i === 0 || x !== arr[i - 1])
                  .concat([null])
                  .findIndex((x, i) => i + 1 !== x) + 1

          argument = number.toString()
          bd.markers[y][x] = { type: tool, label: number.toString() }
        }
      } else if (tool === 'label') {
        let label = argument

        if (
          (label != null && label.trim() === '') ||
          (label == null && bd.markers[y][x] != null && bd.markers[y][x].type === 'label')
        ) {
          bd.markers[y][x] = null
        } else {
          if (label == null) {
            let alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            let letterIndex = Math.max(
              node.data.LB == null
                ? 0
                : node.data.LB.filter((x) => x.length === 4)
                    .map((x) => alpha.indexOf(x[3]))
                    .filter((x) => x >= 0)
                    .sort((a, b) => a - b)
                    .filter((x, i, arr) => i === 0 || x !== arr[i - 1])
                    .concat([null])
                    .findIndex((x, i) => i !== x),
              node.data.L == null ? 0 : node.data.L.length
            )

            label = alpha[Math.min(letterIndex, alpha.length - 1)]
            argument = label
          }

          bd.markers[y][x] = { type: 'label', label }
        }
      } else {
        if (bd.markers[y][x] != null && bd.markers[y][x].type === tool) {
          bd.markers[y][x] = null
        } else {
          bd.markers[y][x] = { type: tool }
        }
      }

      draft.removeProperty(node.id, 'L')
      for (let id in data) {
        draft.removeProperty(node.id, data[id])
      }

      // Now apply changes to game tree

      for (let x = 0; x < bd.width; x++) {
        for (let y = 0; y < bd.height; y++) {
          let v = [x, y]
          if (bd.markers[y][x] == null) {
            continue
          }

          let prop = data[bd.markers[y][x].type]
          let value = stringifyVertex(v)
          if (prop === 'LB') {
            value += ':' + bd.markers[y][x].label
          }

          draft.addToProperty(node.id, prop, value)
        }
      }
    }
  })

  setCurrentTreePosition(store, node.id, newTree)
}

export const recordHistory = (store: Store, { prevGameIndex = undefined, prevTreePosition = undefined } = {}) => {
  const { history, historyCursor, curTreePositionNodeID, gameTrees, curGameIndex } = store
  const currentEntry = history.value[historyCursor.value]

  const newEntry = {
    gameTrees: gameTrees.value,
    gameIndex: curGameIndex.value,
    treePosition: curTreePositionNodeID.value,
    timestamp: Date.now(),
  }

  if (currentEntry && shallowEquals(currentEntry.gameTrees, newEntry.gameTrees)) {
    return
  }

  history.value = history.value.slice(-666, historyCursor.value + 1)

  if (currentEntry && newEntry.timestamp - currentEntry.timestamp < 600) {
    const hs = [...history.value]
    hs[historyCursor.value] = newEntry
    history.value = hs
  } else {
    if (
      currentEntry &&
      prevGameIndex >= 0 &&
      prevTreePosition
    ) {
      currentEntry.gameIndex = prevGameIndex
      currentEntry.treePosition = prevTreePosition
    }

    history.value = [...history.value, newEntry]
    historyCursor.value = history.value.length - 1
  }
}

export const clearHistory = (store: Store) => {
  const { history, historyCursor, gameTrees, curGameIndex, curTreePositionNodeID } = store
  history.value = [
    {
      gameTrees: gameTrees.value,
      gameIndex: curGameIndex.value,
      treePosition: curTreePositionNodeID.value,
      timestamp: Date.now(),
    },
  ]
  historyCursor.value = 0
}

export const checkoutHistory = (store: Store, hc) => {
  const { history, historyCursor, currents, curGameIndex, gameTrees } = store
  
  let entry = history.value[hc]
  if (!entry) {
    return
  }

  const gameTree = entry.gameTrees[entry.gameIndex]

  historyCursor.value = hc
  curGameIndex.value = entry.gameIndex
  gameTrees.value = entry.gameTrees
  currents.value = {}

  setCurrentTreePosition(store, entry.treePosition, gameTree, { clearCache: true })
}

export const undo = (store: Store) => {
  const { historyCursor } = store
  checkoutHistory(store, historyCursor.value - 1)
}

export const redo = (store: Store) => {
  const { historyCursor } = store
  checkoutHistory(store, historyCursor.value + 1)
}


export const getSGF = (store: Store) => {
  const { gameTrees } = store
  let gts = gameTrees.value
  gts = gts.map(tree =>
    tree.mutate(draft => {
      draft.updateProperty(draft.root.id, 'AP', [
        `Obsidian Goban SGF Plugin:${process.env.PLUGIN_VERSION}`
      ])
      draft.updateProperty(draft.root.id, 'CA', ['UTF-8'])
    })
  )

  gameTrees.value = gts
  recordHistory(store)

  return stringify(
    gts.map(tree => tree.root),
    {
      linebreak: ''
    }
  )
}

export const setFrontmatterSetting = (store: Store, fm: GobanSGFPluginFrontmatterSettings) => {
  const { frontmatterData } = store
  const newFM = { ...frontmatterData.value }
  for (let k in fm) {
    if (fm[k] === undefined && newFM.hasOwnProperty(k)) {
      delete newFM[k]
    } else {
      newFM[k] = fm[k]
    }
  }

  frontmatterData.value = newFM
}
