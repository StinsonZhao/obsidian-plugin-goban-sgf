import { useContext, useState, useRef, useEffect, useCallback, useLayoutEffect } from 'preact/hooks'
import { GobanContext } from '@/store/store'
import {
  setCurrentTreePosition,
  makeMainVariation,
  shiftVariation,
  removeNode,
  goToComment,
  goToBE,
  goToPrevBranch,
  goToNextBranch,
  goToFocus,
} from '@/store/actions'
import { BODY_DATA_HTML_TOKEN } from '@/consts/consts'
import { getMatrixWidth } from '@/store/common'
import { useMeasure } from '@/hooks/useMeasure'
import { h } from 'preact'
import { t } from '@/lang/helper'
import modals from '@/modals/modals'
import Goto from '@/icons/goto'

const GRID_SIZE = 24
const NODE_SIZE = 5
const PADDING = 8

const GameGraphNode = ({
  position,
  type,
  current,
  fill,
  nodeSize,
  onCurrentTrack,
  node,
  onNodeClick,
  onNodeMenu,
  onToggleHover,
}) => {
  const store = useContext(GobanContext)
  const [left, top] = position
  const ref = useRef<any>()
  const [hover, setHover] = useState(false)

  const handleMouseEnter = (evt) => {
    if (hover) {
      return
    }
    setHover(true)
    const { left, top } = ref.current.getBoundingClientRect()
    onToggleHover(true, node, {
      x: left,
      y: top,
    })
  }

  const handleMouseLeave = () => {
    if (!hover) {
      return
    }
    setHover(false)
    onToggleHover(false, node)
  }

  const handleClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    onNodeClick()

    if (e.button === 0) {
      setCurrentTreePosition(store, node.id)
    }
  }

  const handleContextMenuClick = (e) => {
    const { clientX, clientY } = e
    onNodeMenu(node, {
      x: clientX,
      y: clientY,
    })
  }

  return (
    <path
      ref={ref}
      onClick={handleClick}
      onContextMenu={handleContextMenuClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${
        current
          ? 'stroke-[3px] stroke-[var(--text-accent)]'
          : hover
          ? 'stroke-[3px] stroke-[var(--text-accent-hover)]'
          : onCurrentTrack
          ? 'stroke-1 stroke-gray-600 dark:stroke-gray-300'
          : 'stroke-1 stroke-gray-400 dark:stroke-gray-500'
      } ${
        fill
          ? ''
          : onCurrentTrack
          ? 'fill-gray-600 dark:fill-gray-300'
          : 'fill-gray-400 dark:fill-gray-500'
      } cursor-pointer`}
      fill={fill || 'none'}
      d={(() => {
        let nodeSize2 = nodeSize * 2

        if (type === 'square') {
          return `M ${left - nodeSize} ${top - nodeSize}
                      h ${nodeSize2} v ${nodeSize2} h ${-nodeSize2} Z`
        } else if (type === 'circle') {
          return `M ${left} ${top} m ${-nodeSize} 0
                      a ${nodeSize} ${nodeSize} 0 1 0 ${nodeSize2} 0
                      a ${nodeSize} ${nodeSize} 0 1 0 ${-nodeSize2} 0`
        } else if (type === 'diamond') {
          let diamondSide = Math.round(Math.sqrt(2) * nodeSize)

          return `M ${left} ${top - diamondSide}
                      L ${left - diamondSide} ${top} L ${left} ${top + diamondSide}
                      L ${left + diamondSide} ${top} Z`
        } else if (type === 'bookmark') {
          return `M ${left - nodeSize} ${top - nodeSize * 1.3}
                      h ${nodeSize2} v ${nodeSize2 * 1.3}
                      l ${-nodeSize} ${-nodeSize} l ${-nodeSize} ${nodeSize} Z`
        }

        return ''
      })()}
    ></path>
  )
}
const GameGraphEdge = ({
  positionAbove: [left1, top1],
  positionBelow: [left2, top2],
  length,
  gridSize,
  current,
}) => {
  let points

  if (left1 === left2) {
    points = `${left1},${top1} ${left1},${top2 + length}`
  } else {
    points = `${left1},${top1} ${left2 - gridSize},${top2 - gridSize}
                ${left2},${top2} ${left2},${top2 + length}`
  }
  return (
    <polyline
      points={points}
      fill="none"
      className={`${
        current
          ? 'stroke-[2px] stroke-gray-600 dark:stroke-gray-300'
          : 'stroke-1 stroke-gray-400 dark:stroke-gray-500'
      }`}
    />
  )
}

const renderNodes = ({
  gridSize,
  cameraPosition: [cx, cy],
  width,
  height,
  gameTree,
  gameCurrents,
  matrixDict,
  commentProperties,
  treePosition,
  nodeSize,
  onNodeClick,
  onNodeMenu,
  onToggleHover,
}: any) => {
  const [matrix, dict] = matrixDict
  let nodeColumns = []
  let edges = []

  let [minX, minY] = [cx, cy].map((z) => Math.max(Math.ceil(z / gridSize) - 2, 0))
  let [maxX, maxY] = [cx, cy].map((z, i) => (z + [width, height][i]) / gridSize + 2)
  minY -= 3
  maxY += 3

  let doneTreeBones = []
  let currentTrack = [...gameTree.listCurrentNodes(gameCurrents)]

  // Render only nodes that are visible

  for (let x = minX; x <= maxX; x++) {
    let column = []

    for (let y = minY; y <= maxY; y++) {
      if (matrix[y] == null || matrix[y][x] == null) continue

      let id = matrix[y][x]
      let node = gameTree.get(id)
      let parent = gameTree.get(node.parentId)
      let onCurrentTrack = currentTrack.includes(node)

      // Render node

      let isCurrentNode = treePosition === id
      let opacity = onCurrentTrack ? 1 : 0.5
      let fillRGB =
        node.data.BM != null
          ? [241, 59, 59]
          : node.data.DO != null
          ? [207, 26, 183]
          : node.data.IT != null
          ? [26, 177, 124]
          : node.data.TE != null
          ? [10, 228, 58]
          : commentProperties.some((x) => node.data[x] != null)
          ? [255, 174, 61]
          : ''

      let left = x * gridSize
      let top = y * gridSize

      column.push(
        h(GameGraphNode, {
          key: y,
          position: [left, top],
          type:
            node.data.HO != null
              ? 'bookmark' // Bookmark node
              : (node.data.B != null && node.data.B[0] === '') ||
                (node.data.W != null && node.data.W[0] === '')
              ? 'square' // Pass node
              : node.data.B == null && node.data.W == null
              ? 'diamond' // Non-move node
              : 'circle', // Normal node
          current: isCurrentNode,
          onCurrentTrack,
          fill: fillRGB ? `rgb(${(fillRGB as any).map((x) => x * opacity).join(',')})` : '',
          nodeSize: nodeSize + 1,
          node,
          onNodeClick,
          onNodeMenu,
          onToggleHover,
        })
      )

      if (!doneTreeBones.includes(id)) {
        // A *tree bone* denotes a straight edge through the tree

        let positionAbove, positionBelow

        if (parent != null) {
          // Render parent edge with tree bone

          let [px, py] = dict[parent.id]

          positionAbove = [px * gridSize, py * gridSize]
          positionBelow = [left, top]
        } else {
          // Render tree bone only

          positionAbove = [left, top]
          positionBelow = positionAbove
        }

        let sequence = [...gameTree.getSequence(id)]

        if (positionAbove != null && positionBelow != null) {
          edges[!onCurrentTrack ? 'unshift' : 'push'](
            h(GameGraphEdge, {
              key: id,
              positionAbove,
              positionBelow,
              length: (sequence.length - 1) * gridSize,
              current: onCurrentTrack,
              gridSize,
            })
          )

          doneTreeBones.push(...sequence.map((node) => node.id))
        }
      }

      if (node.children.length > 1) {
        // Render successor edges with subtree bones

        for (let child of node.children) {
          let current = onCurrentTrack && currentTrack.includes(child)
          let [nx, ny] = dict[child.id]
          let subsequence = [...gameTree.getSequence(child.id)]

          edges[!current ? 'unshift' : 'push'](
            h(GameGraphEdge, {
              key: child.id,
              positionAbove: [left, top],
              positionBelow: [nx * gridSize, ny * gridSize],
              length: (subsequence.length - 1) * gridSize,
              current,
              gridSize,
            })
          )

          doneTreeBones.push(...subsequence.map((node) => node.id))
        }
      }
    }

    if (column.length > 0) nodeColumns.push(h('g', { key: x }, column))
  }

  return [
    h(
      'g',
      {
        class: `transition-transform duration-300 group-active:transition-none`,
        style: {
          transform: `translate(${-cx}px, ${-cy}px)`,
        },
      },
      edges
    ),
    h(
      'g',
      {
        class: `transition-transform duration-300 group-active:transition-none`,
        style: {
          transform: `translate(${-cx}px, ${-cy}px)`,
        },
      },
      nodeColumns
    ),
  ]
}

const GameGraph = () => {
  const store = useContext(GobanContext)
  const { curGame, curTreePositionNodeID, currents, matrixDict, id } = store
  const [graphRef, { width, height, left, top }] = useMeasure()
  const vWidth = width !== null ? width - 2 * PADDING : null
  const vHeight = height !== null ? height - 2 * PADDING : null
  const [cameraPosition, setCameraPosition] = useState([-GRID_SIZE, -GRID_SIZE])
  const svgRef = useRef<SVGSVGElement>()
  const mouseDownRef = useRef(null)
  const dragRef = useRef(false)
  const menuRef = useRef(null)

  const [nodeMenu, setNodeMenu] = useState(null)
  const handleNodeMenu = useCallback(
    (node, { x, y }) => {
      setNodeMenu({
        node,
        position: {
          x,
          y,
        },
      })
    },
    [left, top]
  )

  const updateCameraPosition = useCallback(() => {
    const matrix = matrixDict.value[0]
    const dict = matrixDict.value[1]

    let [x, y] = dict[curTreePositionNodeID.value]
    let [width, padding] = getMatrixWidth(y, matrix)

    let relX = width === 1 ? 0 : 1 - (2 * (x - padding)) / (width - 1)
    let diff = ((width - 1) * GRID_SIZE) / 2
    diff = Math.min(diff, vWidth / 2 - GRID_SIZE)

    setCameraPosition(
      [x * GRID_SIZE + relX * diff - vWidth / 2, y * GRID_SIZE - vHeight / 2].map((z) =>
        Math.round(z)
      )
    )
  }, [matrixDict.value, curTreePositionNodeID.value, vWidth, vHeight])

  useEffect(() => {
    updateCameraPosition()
    setNodeMenu(null)
  }, [curTreePositionNodeID.value, matrixDict.value, vWidth, vHeight])

  const nodeMenuRef = useRef(nodeMenu)
  nodeMenuRef.current = nodeMenu
  const accMovementRef = useRef([0, 0])
  useEffect(() => {
    const handleMouseMove = (evt) => {
      if (document.body.dataset[BODY_DATA_HTML_TOKEN] !== id.value) {
        return
      }
      if (!svgRef.current) {
        return
      }

      let { movementX, movementY } = evt

      if (mouseDownRef.current === 0) {
        dragRef.current = true
        accMovementRef.current = [
          accMovementRef.current[0] + movementX,
          accMovementRef.current[1] + movementY,
        ]
      } else {
        movementX = movementY = 0
        accMovementRef.current = [0, 0]
        dragRef.current = false
      }

      if (dragRef.current) {
        evt.preventDefault()
        window.requestAnimationFrame(() => {
          const [mx, my] = accMovementRef.current
          accMovementRef.current = [0, 0]
          setCameraPosition((pre) => [pre[0] - mx, pre[1] - my])
        })
      }
    }

    const handleMouseUp = (evt) => {
      if (document.body.dataset[BODY_DATA_HTML_TOKEN] !== id.value) {
        return
      }
      mouseDownRef.current = null
    }

    const hideNodeMenu = (evt) => {
      if (document.body.dataset[BODY_DATA_HTML_TOKEN] !== id.value) {
        return
      }
      const menuEl = menuRef.current
      if (
        nodeMenuRef.current !== null &&
        menuEl &&
        (!menuEl.contains(evt.target) || menuEl === evt.target)
      ) {
        setNodeMenu(null)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('click', hideNodeMenu)
    document.addEventListener('contextmenu', hideNodeMenu)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('click', hideNodeMenu)
      document.removeEventListener('contextmenu', hideNodeMenu)
    }
  }, [])

  const handleGraphMouseDown = (e) => {
    mouseDownRef.current = e.button
  }

  const handleNodeClick = useCallback(() => {
    if (dragRef.current) {
      dragRef.current = false
    }
  }, [])

  const [hoverNode, setHoverNode] = useState(null)
  const handleToggleNodeHover = useCallback(
    (isHover, node, position) => {
      if (isHover) {
        const hoverStep = curGame.value.getLevel(node.id)
        setHoverNode({
          node,
          position,
          hoverStep,
        })
      } else {
        setHoverNode((pre) => {
          if (pre.node.id === node.id) {
            return null
          }
          return pre
        })
      }
    },
    [curGame.value]
  )

  const handleSetMain = useCallback(
    (node) => {
      setNodeMenu(null)
      makeMainVariation(store, node.id)
    },
    [store]
  )

  const handleMove = useCallback(
    (node, sign = -1) => {
      setNodeMenu(null)
      shiftVariation(store, node.id, sign)
    },
    [store]
  )

  const delHandlingRef = useRef(false)
  const handleDelNode = useCallback(
    async (node) => {
      if (delHandlingRef.current) {
        return
      }
      let isConfirm = false
      try {
        delHandlingRef.current = true

        const res = await modals.Confirm({
          props: {
            title: t('DELETE_NODE'),
            msg: t('DELETE_NODE_CONFIRM'),
          },
          id: id.value,
        })

        isConfirm = res === 'confirm'
      } catch (e) {
        //
      } finally {
        delHandlingRef.current = false
      }

      setNodeMenu(null)
      if (!isConfirm) {
        return
      }
      removeNode(store, node)
    },
    [store]
  )

  const handleNav = useCallback(
    (cmd: string) => {
      switch (cmd) {
        case 'start':
          goToBE(store, -1)
          break
        case 'end':
          goToBE(store, 1)
          break
        case 'prevBranch':
          goToPrevBranch(store)
          break
        case 'nextBranch':
          goToNextBranch(store)
          break
        case 'prevComment':
          goToComment(store, -1)
          break
        case 'nextComment':
          goToComment(store, 1)
          break
        case 'prevFocus':
          goToFocus(store, -1)
          break
        case 'nextFocus':
          goToFocus(store, 1)
          break
        default:
      }
    },
    [store]
  )

  const [hide, setHide] = useState(true)
  const hideRef = useRef(hide)
  hideRef.current = hide
  useEffect(() => {
    if (vWidth < 0 && vHeight < 0 && !hideRef.current) {
      setHide(true)
    } else if (hideRef.current) {
      setTimeout(() => {
        setHide(false)
      }, 200)
    }
  }, [vWidth, vHeight])

  return (
    <div className="absolute inset-0 z-10 flex flex-col">
      <div className="relative z-30 flex items-center justify-between w-full h-10 px-4 mt-1 text-sm shrink-0">
        <div className="font-semibold grow">{t('VARIATION_BRANCH')}</div>
        <div className="relative ml-2 shrink-0 group">
          <div className="absolute -bottom-1 right-0 whitespace-pre mt-1 translate-y-[100%] py-2 px-3 bg-[var(--background-secondary-alt)] text-[var(--text-normal)] transition-all origin-bottom rounded shadow-md text-xs opacity-50 scale-0 border-[var(--background-modifier-border-hover)] border border-solid group-hover:opacity-100 group-hover:scale-100 hover:opacity-100 hover:scale-100 delay-100">
            <div
              className="flex items-center w-full h-8 cursor-pointer hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() => handleNav('start')}
            >
              {t('START')}
            </div>
            <div
              className="flex items-center w-full h-8 cursor-pointer hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() => handleNav('end')}
            >
              {t('ENDING')}
            </div>
            <div className="h-[1px] w-full border-t border-dashed border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] my-2" />
            <div
              className="flex items-center w-full h-8 cursor-pointer hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() => handleNav('prevBranch')}
            >
              {t('PREV_BRANCH')}
            </div>
            <div
              className="flex items-center w-full h-8 cursor-pointer hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() => handleNav('nextBranch')}
            >
              {t('NEXT_BRANCH')}
            </div>
            <div className="h-[1px] w-full border-t border-dashed border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] my-2" />
            <div
              className="flex items-center w-full h-8 cursor-pointer hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() => handleNav('prevComment')}
            >
              {t('PREV_COMMENT')}
            </div>
            <div
              className="flex items-center w-full h-8 cursor-pointer hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() => handleNav('nextComment')}
            >
              {t('NEXT_COMMENT')}
            </div>
            <div className="h-[1px] w-full border-t border-dashed border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] my-2" />
            <div
              className="flex items-center w-full h-8 cursor-pointer hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() => handleNav('prevFocus')}
            >
              {t('PREV_FOCUS')}
            </div>
            <div
              className="flex items-center w-full h-8 cursor-pointer hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() => handleNav('nextFocus')}
            >
              {t('NEXT_FOCUS')}
            </div>
          </div>
          <button className="relative z-20 rounded shrink-0 h-8 py-0 pr-1 pl-2 flex items-center justify-center text-[var(--text-muted)] bg-transparent transition shadow-none outline-none hover:bg-[var(--interactive-accent-hover)] hover:text-[var(--text-on-accent)] active:scale-90 border-none cursor-default">
            {t('NAV')}
            <div className="w-3 h-3 ml-1">
              <Goto />
            </div>
          </button>
        </div>
      </div>
      <div className="w-full px-4 mb-3 shrink-0">
        <div className="h-0.5 w-full bg-[rgba(0,0,0,0.05)] rounded" />
      </div>
      <div className="relative z-20 w-full grow">
        <div
          ref={graphRef}
          id="game-graph"
          className="absolute inset-0 z-10 flex flex-col w-full h-full wheel-nav"
          style={{ padding: PADDING }}
        >
          {height && width ? (
            <svg
              ref={svgRef}
              width={vWidth}
              height={vHeight}
              onMouseDown={handleGraphMouseDown}
              className={`relative z-30 active:cursor-grabbing ${
                hide ? 'opacity-0' : 'opacity-100'
              } group`}
            >
              {renderNodes({
                gridSize: GRID_SIZE,
                cameraPosition,
                width: vWidth,
                height: vHeight,
                gameTree: curGame.value,
                gameCurrents: currents.value,
                matrixDict: matrixDict.value,
                commentProperties: ['C', 'N', 'UC', 'GW', 'DM', 'GB', 'BM', 'TE', 'DO', 'IT'],
                treePosition: curTreePositionNodeID.value,
                nodeSize: NODE_SIZE,
                onNodeClick: handleNodeClick,
                onNodeMenu: handleNodeMenu,
                onToggleHover: handleToggleNodeHover,
              })}
            </svg>
          ) : null}

          {nodeMenu !== null ? (
            <div ref={menuRef} class="absolute inset-0 z-50">
              <div
                class="absolute whitespace-pre py-2 px-3 bg-[var(--background-secondary-alt)] text-[var(--text-normal)] transition-all rounded-l rounded-br shadow-md border-[var(--background-modifier-border-hover)] border border-solid text-xs origin-top-right transform -translate-x-full"
                style={{
                  left: nodeMenu.position.x - left - 20,
                  top: nodeMenu.position.y - top,
                }}
              >
                <span className="block absolute right-[-4px] top-[-1px] h-[6px] w-[6px] border-t border-r border-solid border-[var(--background-modifier-border-hover)] bg-[var(--background-secondary-alt)] transform skew-x-[-45deg]"></span>
                <div>
                  <div
                    className="flex items-center cursor-pointer h-8 hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)] text-[var(--text-normal)]"
                    onClick={() => handleSetMain(nodeMenu.node)}
                  >
                    {t('SET_TO_MAIN')}
                  </div>
                  <div
                    className="flex items-center cursor-pointer h-8 hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)] text-[var(--text-normal)]"
                    onClick={() => handleMove(nodeMenu.node, -1)}
                  >
                    {t('MOVE_LEFT')}
                  </div>
                  <div
                    className="flex items-center cursor-pointer h-8 hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)] text-[var(--text-normal)]"
                    onClick={() => handleMove(nodeMenu.node, 1)}
                  >
                    {t('MOVE_RIGHT')}
                  </div>
                  <div className="h-[1px] w-full border-t border-dashed border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] my-2" />
                  <div
                    className="flex items-center cursor-pointer h-8 hover:bg-[var(--background-modifier-error)] rounded px-2 dark:hover:bg-[var(--background-modifier-error)] text-[var(--text-normal)] hover:text-white"
                    onClick={() => handleDelNode(nodeMenu.node)}
                  >
                    {t('DELETE_NODE')}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div
            className={`absolute whitespace-pre z-40  flex items-center h-4 text-xs transform p-1 -translate-x-full transition opacity-0 ${
              hoverNode ? 'opacity-100' : ''
            }`}
            style={
              hoverNode
                ? {
                    left: hoverNode.position.x - left - NODE_SIZE - 4,
                    top: hoverNode.position.y - top - 1,
                  }
                : undefined
            }
          >
            {hoverNode !== null ? (
              <div className="p-1 text-right text-gray-200 bg-gray-800 rounded dark:text-gray-400 dark:bg-gray-700">
                {hoverNode.hoverStep}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameGraph
