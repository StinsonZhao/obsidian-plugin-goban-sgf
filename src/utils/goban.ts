import { moment } from 'obsidian'
import sgf from '@sabaki/sgf'
import GameTree from '@sabaki/immutable-gametree'
import { errorlog } from './utils'

export const getId = () => {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return S4() + S4() + '-' + S4() + '-' + S4()
}

export const genMarkdownSGFSection = (sgfString: string) => {
  return `\x60\x60\x60sgf\n${sgfString}\n\x60\x60\x60`
}

export const sgf2Games = (data: string) => {
  let games: any[] = []
  try {
    const rootNodes = sgf.parse(data, { getId })
    const gs = rootNodes.map((root: any) => new GameTree({ getId, root }))
    games = gs
  } catch (e) {
    errorlog({
      where: 'sgf2Games(goban.ts): sgf.parse',
      error: e,
    })
    games = []
  }
  return games
}

export const genInitSGF = (size: number, handicap: number, komi: number) => {
  return `(;GM[1]FF[4]CA[UTF-8]AP[Obsidian Goban SGF Plugin:${
    process.env.PLUGIN_VERSION
  }]KM[${komi}]SZ[${size}]HA[${handicap}]DT[${moment().format('YYYY-MM-DD')}])`
}

