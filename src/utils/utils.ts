import jstr from 'json-stable-stringify'

export const errorlog = (data: {}) => {
  console.error({ plugin: 'Goban SGF', ...data })
}

export const isTextLikeElement = (element: any) => {
  return (
    ['textarea', 'select'].includes(element.tagName.toLowerCase()) ||
    (element.tagName.toLowerCase() === 'input' &&
      !['submit', 'reset', 'button', 'checkbox', 'radio', 'color', 'file'].includes(
        element?.type
      )) ||
    element.isContentEditable
  )
}

export const noop = () => {}

export const typographer = (input) => {
  return input
    .replace(/\.{3}/g, '…')
    .replace(/(\S)'/g, '$1’')
    .replace(/(\S)"/g, '$1”')
    .replace(/'(\S)/g, '‘$1')
    .replace(/"(\S)/g, '“$1')
    .replace(/(\s)-(\s)/g, '$1–$2')
}

export const shallowEquals = (a, b) => {
  return a == null || b == null
    ? a === b
    : a === b || (a.length === b.length && a.every((x, i) => x == b[i]))
}

export const shallowObjEquals = (a, b) => {
  if (a === b) {
    return true
  }
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false
  }

  for (const key in a) {
    if (typeof a[key] !== typeof b[key]) {
      return false
    } else if (typeof a[key] === 'object') {
      const aStr = jstr(a[key])
      const bStr = jstr(b[key])
      if (aStr !== bStr) {
        return false
      } else {
        continue
      }
    }
    if (a[key] !== b[key]) {
      return false
    }
  }

  return true
}

export const getAutoIncrID = (
  (id) => () =>
    id++
)(0)

export const convertBool = (v: any, convertUndefined = true): boolean | undefined => {
  if (!convertUndefined && v === undefined) {
    return undefined
  }
  const convertedFalse =
    (typeof v === 'string' &&
      (v.toLowerCase() === 'false' || v.toLowerCase() === 'null' || v.toLowerCase() === '0')) ||
    (typeof v === 'number' && v === 0)
  return convertedFalse ? false : Boolean(v)
}

export const convertKomi = (v: any): number | undefined => {
  const numV = Number(v)
  if (isNaN(numV)) {
    return undefined
  }
  const n = Math.floor(numV * 10) / 10
  return n > 361 ? 361 : n < -361 ? -361 : n
}

export const convertLastMoves = (v: any): number | undefined => {
  const numV = Number(v)
  if (isNaN(numV)) {
    return undefined
  }
  const n = Math.floor(numV)
  return n > 20 ? 20 : n < 0 ? 0 : n
}

export const convertHandicap = (v: any): number | undefined => {
  const numV = Number(v)
  if (isNaN(numV)) {
    return undefined
  }
  const n = Math.floor(numV)
  return n > 9 ? 9 : n < 2 ? 2 : n
}

export const convertSize = (v: any): number | undefined => {
  const numV = Number(v)
  if (isNaN(numV)) {
    return undefined
  }
  const n = Math.floor(numV)
  return n > 25 ? 25 : n < 2 ? 2 : n
}

export const convertGobanRange = (
  v: string,
  size: number
): { x: [number, number]; y: [number, number] } | undefined => {
  if (typeof v !== 'string') {
    return undefined
  }
  if (v.trim() === '') {
    return undefined
  }
  try {
    let { x = [], y = [] } = JSON.parse(v)
    x = x.map((xi, i) =>
      isNaN(Number(xi)) ? (i === 0 ? 0 : size - 1) : Number(xi) >= size ? size - 1 : Number(xi)
    )
    y = y.map((yi, i) =>
      isNaN(Number(yi)) ? (i === 0 ? 0 : size - 1) : Number(yi) >= size ? size - 1 : Number(yi)
    )
    return { x: x[0] > x[1] ? [x[1], x[0]] : x, y: y[0] > y[1] ? [y[1], y[0]] : y }
  } catch (e) {
    errorlog({
      where: 'convertGobanRange',
      error: e,
    })

    return undefined
  }
}

export const newLinkClick = (
  href: string,
  options?: {
    target?: string
    download?: string
  }
) => {
  const link = document.createElement('a')
  link.href = href
  if (options?.download) {
    link.download = options?.download
  }
  if (options?.target) {
    link.target = options?.target
  }
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export const emptyEl = (el: HTMLElement) => {
  while (el.firstChild) {
    el.removeChild(el.firstChild)
  }
}
