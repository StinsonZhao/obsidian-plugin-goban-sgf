const Menu = (props) => {
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
        <circle cx="3.5" cy="3.5" r="2"></circle> <line x1="8.5" y1="2.5" x2="15.5" y2="2.5"></line>{' '}
        <line x1="8.5" y1="6.5" x2="15.5" y2="6.5"></line>{' '}
        <circle cx="3.5" cy="12.5" r="2"></circle>{' '}
        <line x1="8.5" y1="11.5" x2="15.5" y2="11.5"></line>{' '}
        <line x1="8.5" y1="15.5" x2="15.5" y2="15.5"></line>
      </g>
    </svg>
  )
}

export default Menu
