import {
  errorlog,
  convertBool,
  convertLastMoves,
  convertKomi,
  convertHandicap,
  convertSize,
} from './utils/utils'
import * as matter from 'hexo-front-matter'

export interface GobanSGFPluginSettings {
  folder: string
  gotoEndAtBeginning: boolean
  fuzzyStonePlacement: boolean
  dftShowNextMoves: boolean
  dftShowSiblings: boolean
  dftShowMoveNumbers: boolean
  dftKomi: number
  dftHandicap: number
  dftSize: number
}

export const DEFAULT_SETTINGS: GobanSGFPluginSettings = {
  folder: 'Goban',
  gotoEndAtBeginning: true,
  fuzzyStonePlacement: true,
  dftShowNextMoves: true,
  dftShowSiblings: true,
  dftShowMoveNumbers: false,
  dftKomi: 5.5,
  dftHandicap: 0,
  dftSize: 19,
}

export interface GobanSGFPluginFrontmatterSettings {
  gotoEndAtBeginning?: boolean | null
  fuzzyStonePlacement?: boolean | null
  showNextMoves?: boolean | null
  showSiblings?: boolean | null
  showMoveNumbers?: boolean | null
  showLastMoves?: number
  gobanRange?: string // like: JSON.stringify({ x: [0, 18], y: [0, 18] })
  initMode?: 'play' | 'edit'
  initCommentMode?: 'edit' | 'view'
  komi?: number
  handicap?: number
  size?: number
  [key: string]: any
}

export interface FinalSettings {
  folder: string
  gotoEndAtBeginning: boolean
  fuzzyStonePlacement: boolean
  showNextMoves: boolean
  showSiblings: boolean
  showMoveNumbers: boolean
  showLastMoves: number
  gobanRange: {
    x: [number, number]
    y: [number, number]
  }
  initMode: 'play' | 'edit'
  initCommentMode: 'edit' | 'view'
  komi: number
  handicap: number
  size: number
}

export const mergeSettings = (
  pa: GobanSGFPluginFrontmatterSettings,
  pl: GobanSGFPluginSettings
) => {
  const res: FinalSettings = {
    folder: pl.folder,
    gotoEndAtBeginning: pl.gotoEndAtBeginning,
    fuzzyStonePlacement: pl.fuzzyStonePlacement,
    showNextMoves: pl.dftShowNextMoves,
    showSiblings: pl.dftShowSiblings,
    showMoveNumbers: pl.dftShowMoveNumbers,
    showLastMoves: 0,
    gobanRange: {
      x: [0, pl.dftSize - 1],
      y: [0, pl.dftSize - 1],
    },
    initMode: 'play',
    initCommentMode: 'view',
    komi: pl.dftKomi,
    handicap: pl.dftHandicap,
    size: pl.dftSize,
  }

  if (
    pa.size !== undefined &&
    !isNaN(Number(pa.size)) &&
    Number(pa.size) > 1 &&
    Number(pa.size) < 26
  ) {
    const s = Math.floor(Number(pa.size))
    res.size = s
    if (res.gobanRange.x[1] >= s) {
      res.gobanRange.x[1] = s - 1
    }
    if (res.gobanRange.y[1] >= s) {
      res.gobanRange.y[1] = s - 1
    }
  }

  for (let k in pa) {
    if (k === 'size' || pa[k] === undefined) {
      continue
    } else if (k === 'gobanRange') {
      try {
        let { x = [], y = [] } = JSON.parse(pa[k])
        x = x.map((xi, i) =>
          isNaN(Number(xi))
            ? i === 0
              ? 0
              : res.size - 1
            : Number(xi) >= res.size
            ? res.size - 1
            : Number(xi)
        )
        y = y.map((yi, i) =>
          isNaN(Number(yi))
            ? i === 0
              ? 0
              : res.size - 1
            : Number(yi) >= res.size
            ? res.size - 1
            : Number(yi)
        )
        res.gobanRange = { x: x[0] > x[1] ? [x[1], x[0]] : x, y: y[0] > y[1] ? [y[1], y[0]] : y }
      } catch (e) {
        errorlog({
          where: 'mergeSettings',
          error: e,
        })
      }
    } else if (
      [
        'gotoEndAtBeginning',
        'fuzzyStonePlacement',
        'showNextMoves',
        'showSiblings',
        'showMoveNumbers',
      ].includes(k)
    ) {
      res[k] = convertBool(pa[k])
    } else if (['showLastMoves', 'komi', 'handicap'].includes(k)) {
      const num = Number(pa[k])
      if (isNaN(num)) {
        continue
      }

      if (k === 'showLastMoves') {
        res.showLastMoves = convertLastMoves(pa[k])
      }

      if (k === 'komi') {
        res.komi = convertKomi(pa[k])
      }

      if (k === 'handicap') {
        res.handicap = convertHandicap(pa[k])
      }

      if (k === 'size') {
        res.size = convertSize(pa[k])
      }
    } else if (k === 'initMode' && ['play', 'edit'].includes(pa[k])) {
      res.initMode = pa[k]
    } else if (k === 'initCommentMode' && ['view', 'edit'].includes(pa[k])) {
      res.initCommentMode = pa[k]
    } else if (res[k] === undefined) {
      res[k] = pa[k]
    }
  }

  return res
}

export const stringifyFrontmatterData = (st: GobanSGFPluginFrontmatterSettings) => {
  const r = st
  Object.keys(r).forEach((k) => {
    if (r[k] === null || r[k] === undefined) {
      delete r[k]
    }
  })

  try {
    const str = matter.stringify(r, { prefixSeparator: true })
    return str
  } catch (e) {
    errorlog({
      where: 'stringifyFrontmatterData',
      error: e,
    })
    return ''
  }
}
