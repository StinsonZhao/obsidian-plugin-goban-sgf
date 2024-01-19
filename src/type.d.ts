declare module '@sabaki/sgf' {
  import sgf, {
    parseVertex as pv,
    parseCompressedVertices as pcv,
    stringifyVertex as sv,
    stringify as s,
  } from '@sabaki/sgf'
  export default sgf as any
  export const parseVertex = pv as any
  export const parseCompressedVertices = pcv as any
  export const stringifyVertex = sv as any
  export const stringify = s as any
}

declare module '@sabaki/immutable-gametree' {
  import GameTree from '@sabaki/immutable-gametree'
  export default GameTree as any
}

declare module '@sabaki/boardmatcher' {
  import boardmatcher from '@sabaki/boardmatcher'
  export default boardmatcher as any
}

declare module '@sabaki/go-board' {
  import { fromDimensions as fd } from '@sabaki/go-board'
  export const fromDimensions = fd as any
}
