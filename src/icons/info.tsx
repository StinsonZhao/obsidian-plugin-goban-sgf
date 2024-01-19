const GameInfo = (props) => {
  const fill = props.fill || 'currentColor'
  const stroke = props.stroke || fill
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16">
      <g
        stroke-width="1"
        fill="none"
        stroke={stroke}
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="12,4.5 8,0.5 4,4.5 "></polyline>{' '}
        <path d="M14.5,15.5h-13 c-0.552,0-1-0.448-1-1v-9c0-0.552,0.448-1,1-1h13c0.552,0,1,0.448,1,1v9C15.5,15.052,15.052,15.5,14.5,15.5z"></path>
      </g>
    </svg>
  )
}

export default GameInfo
