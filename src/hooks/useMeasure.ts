import { useState, useRef, useCallback } from 'preact/hooks'

export const useMeasure = () => {
  const [dimensions, setDimensions] = useState({
    width: null,
    height: null,
    left: null,
    top: null,
  })

  const previousObserver = useRef(null)

  const customRef = useCallback((node: any) => {
    if (previousObserver.current) {
      previousObserver.current.disconnect()
      previousObserver.current = null
    }

    if (node?.nodeType === Node.ELEMENT_NODE) {
      const observer = new ResizeObserver(([entry]) => {
        if (entry && entry.borderBoxSize) {
          const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0]
          const { left, top } = node.getBoundingClientRect()
          setDimensions({ width, height, left, top })
        }
      })

      observer.observe(node)
      previousObserver.current = observer
    }
  }, [])

  return [customRef, dimensions] as [
    (node: any) => void,
    { width: number | null; height: number | null; left: number | null; top: number | null }
  ]
}
