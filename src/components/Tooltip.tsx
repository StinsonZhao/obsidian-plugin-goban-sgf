const Tooltip = ({ message, children, placement = '' }) => {
  const cls = (() => {
    switch (placement) {
      case 'top-end':
        return '-top-1 right-0 translate-y-[-100%]'
      case 'top-begin':
        return '-top-1 left-0 translate-y-[-100%]'
      case 'bottom-end':
        return '-bottom-1 right-0 translate-y-[100%]'
      case 'bottom-begin':
        return '-bottom-1 left-0 translate-y-[100%]'
      case 'bottom':
        return '-bottom-1 left-[50%] translate-y-[100%] -translate-x-[50%]'
      case 'left':
        return 'top-[50%] -left-1 translate-x-[-100%] -translate-y-[50%]'
      case 'right':
        return 'top-[50%] -right-1 translate-x-[100%] -translate-y-[50%]'
      case 'top':
      default:
        return '-top-1 left-[50%] translate-y-[-100%] -translate-x-[50%]'
    }
  })()

  return (
    <div className="relative flex group">
      {children}
      <div
        className={`absolute whitespace-pre p-2 text-xs text-white transition-all scale-0 bg-gray-800 rounded group-hover:scale-100 ${cls}`}
      >
        {message}
      </div>
    </div>
  )
}

export default Tooltip
