declare module '@sabaki/sgf' {
  import sgf, {
    parseVertex as pv,
    parseCompressedVertices as pcv,
    stringifyVertex as sv,
    stringify as s,
  } from '@sabaki/sgf'
  export default sgf
  export const parseVertex = pv
  export const parseCompressedVertices = pcv
  export const stringifyVertex = sv
  export const stringify = s
}

declare module '@sabaki/immutable-gametree' {
  import GameTree from '@sabaki/immutable-gametree'
  export default GameTree
}

declare module '@sabaki/boardmatcher' {
  import boardmatcher from '@sabaki/boardmatcher'
  export default boardmatcher
}

declare module '@sabaki/go-board' {
  import { fromDimensions as fd } from '@sabaki/go-board'
  export const fromDimensions = fd
}
