const Mark = (props) => {
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
        <polygon points=".5 13.5 2.5 15.5 11.487 6.487 9.513 4.487 .5 13.5"></polygon>
        <line x1="7.513" y1="6.487" x2="9.513" y2="8.487"></line>
        <path d="M3.5,2.5c1.105,0,2-.895,2-2,0,1.105,.895,2,2,2-1.105,0-2,.895-2,2,0-1.105-.895-2-2-2"></path>
        <path d="M11.5,2.5c1.105,0,2-.895,2-2,0,1.105,.895,2,2,2-1.105,0-2,.895-2,2,0-1.105-.895-2-2-2"></path>
        <path d="M11.5,10.493c1.105,0,2-.895,2-2,0,1.105,.895,2,2,2-1.105,0-2,.895-2,2,0-1.105-.895-2-2-2"></path>
      </g>
    </svg>
  )
}

export default Mark
