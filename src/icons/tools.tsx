export const Cross = (props) => {
  const fill = props.fill || 'currentColor'
  const stroke = props.stroke || fill
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
      <g
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        fill="none"
        stroke={stroke}
      >
        <line x1="19" y1="5" x2="5" y2="19"></line> <line x1="19" y1="19" x2="5" y2="5"></line>
      </g>
    </svg>
  )
}

export const Square = (props) => {
  const fill = props.fill || 'currentColor'
  const stroke = props.stroke || fill
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
      <g
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        fill="none"
        stroke={stroke}
      >
        <rect x="2" y="2" width="20" height="20"></rect>
      </g>
    </svg>
  )
}

export const Triangle = (props) => {
  const fill = props.fill || 'currentColor'
  const stroke = props.stroke || fill
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
      <g
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        fill="none"
        stroke={stroke}
      >
        <polygon points="12 3 2 21 22 21 12 3"></polygon>
      </g>
    </svg>
  )
}

export const Circle = (props) => {
  const fill = props.fill || 'currentColor'
  const stroke = props.stroke || fill
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
      <g
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        fill="none"
        stroke={stroke}
      >
        <circle cx="12" cy="12" r="10"></circle>
      </g>
    </svg>
  )
}

export const Alpha = (props) => {
  const fill = props.fill || 'currentColor'
  const stroke = props.stroke || fill
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
      <g
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        fill="none"
        stroke={stroke}
      >
        <polyline points="3 22 11.499 2 12.499 2 21 22"></polyline>
        <line x1="5.974" y1="15" x2="18.024" y2="15"></line>
      </g>
    </svg>
  )
}

export const Number = (props) => {
  const fill = props.fill || 'currentColor'
  const stroke = props.stroke || fill
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
      <g
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        fill="none"
        stroke={stroke}
      >
        <polyline points="7 6 12 2 13 2 13 22"></polyline>
      </g>
    </svg>
  )
}


