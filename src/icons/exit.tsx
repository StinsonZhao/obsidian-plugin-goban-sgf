const Exit = (props) => {
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
        <line x1="5.5" y1="8" x2="15.5" y2="8"></line>
        <polyline points="11.5 4 15.5 8 11.5 12"></polyline>
        <path d="M8.5,15.5H2A1.5,1.5,0,0,1,.5,14V2A1.5,1.5,0,0,1,2,.5H8.5"></path>
      </g>
    </svg>
  )
}

export default Exit
