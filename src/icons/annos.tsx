export const EvenPosition = (props) => {
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <div className="w-full h-full text-black dark:text-white">
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16">
        <g fill="currentColor">
          <path d="M8,0C3.6,0,0,3.6,0,8s3.6,8,8,8s8-3.6,8-8S12.4,0,8,0z M2,8c0-3.3,2.7-6,6-6v12C4.7,14,2,11.3,2,8z"></path>
        </g>
      </svg>
    </div>
  )
}

export const GoodForBlack = (props) => {
  return (
    <div className="rounded-[100px] h-full w-full border border-solid border-black bg-black dark:border-white"></div>
  )
}

export const GoodForWhite = (props) => {
  return (
    <div className="rounded-[100px] h-full w-full border border-solid border-black bg-white dark:border-white"></div>
  )
}

export const UnclearPosition = (props) => {
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <div className="w-full h-full text-[rgba(0,0,0,0.4)] dark:text-[rgba(255,255,255,0.5)]">
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16">
        <g fill="currentColor">
          <path d="M8,0C3.6,0,0,3.6,0,8s3.6,8,8,8,8-3.6,8-8S12.4,0,8,0Zm0,13c-.552,0-1-.448-1-1s.448-1,1-1,1,.448,1,1-.448,1-1,1Zm1.623-4.908c-.497,.427-.623,.571-.623,.908,0,.553-.448,1-1,1s-1-.447-1-1c0-1.294,.795-1.976,1.322-2.427,.497-.425,.623-.57,.623-.906,0-.183,0-.667-.944-.667-.436,.024-.901,.224-1.258,.561-.401,.378-1.035,.359-1.414-.041-.379-.402-.361-1.035,.041-1.414,.702-.661,1.617-1.054,2.579-1.104h.003c1.812,0,2.993,1.071,2.993,2.666,0,1.293-.795,1.975-1.321,2.425Z"></path>
        </g>
      </svg>
    </div>
  )
}

export const GoodMove = (props) => {
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16">
      <g fill="#0AE43A">
        <path d="M2,7H1A.945.945,0,0,0,0,8v7a.945.945,0,0,0,1,1H2Z"></path>
        <path d="M14,6H9V2A1.89,1.89,0,0,0,7,0L4,7v9h8a2.908,2.908,0,0,0,2.9-2.4l1-5.2A1.937,1.937,0,0,0,14,6Z"></path>
      </g>
    </svg>
  )
}

export const BadMove = (props) => {
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <div className="w-full h-full origin-center rotate-180">
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16">
        <g fill="#F13B3B">
          <path d="M2,7H1A.945.945,0,0,0,0,8v7a.945.945,0,0,0,1,1H2Z"></path>
          <path d="M14,6H9V2A1.89,1.89,0,0,0,7,0L4,7v9h8a2.908,2.908,0,0,0,2.9-2.4l1-5.2A1.937,1.937,0,0,0,14,6Z"></path>
        </g>
      </svg>
    </div>
  )
}

export const IntMove = (props) => {
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16">
      <g fill="#1AB17C">
        <path d="M14.866,7.16l-6.5-7a.5.5,0,0,0-.732,0l-6.5,7A.5.5,0,0,0,1.5,8H5v7a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V8h3.5a.5.5,0,0,0,.366-.84Z"></path>
      </g>
    </svg>
  )
}

export const DouMove = (props) => {
  const width = props.width || '100%'
  const height = props.height || '100%'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16">
      <g fill="#CF1AB7">
        <path d="M14.958,8.3A.5.5,0,0,0,14.5,8H11V1a1,1,0,0,0-1-1H6A1,1,0,0,0,5,1V8H1.5a.5.5,0,0,0-.366.84l6.5,7a.5.5,0,0,0,.732,0l6.5-7A.5.5,0,0,0,14.958,8.3Z"></path>
      </g>
    </svg>
  )
}

export const Focus = (props) => {
  const width = props.width || '100%'
  const height = props.height || '100%'
  const opp = props.opposition || false

  return (
    <div className={`w-full h-full ${opp ? 'text-white' : 'text-[var(--text-accent)]'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16">
        <g fill="currentColor">
          <circle cx="8" cy="5" r="5"></circle>{' '}
          <path d="M8,12c-1.1,0-2.1-0.3-3-0.7V16l3-2l3,2v-4.7C10.1,11.7,9.1,12,8,12z"></path>
        </g>
      </svg>
    </div>
  )
}
