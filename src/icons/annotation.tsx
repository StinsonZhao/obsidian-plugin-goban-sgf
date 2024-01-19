const Annotaion = (props) => {
  const fill = props.fill || 'currentColor'
  const stroke = props.stroke || fill
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16">
      <g fill={fill}>
        <path fill={fill} d="M4,0C2.9,0,2,0.9,2,2v14l6-3l6,3V2c0-1.1-0.9-2-2-2H4z"></path>
      </g>
    </svg>
  )
}

export default Annotaion
