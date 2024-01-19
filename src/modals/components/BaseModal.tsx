import { WithFinishFC } from '../common'

interface BaseModalProps {
  title: any
  children: any
  width?: number
}

const BaseModal: WithFinishFC<BaseModalProps> = ({ title, onFinish, children, width = 640 }) => {
  return (
    <div className="absoulte inset-0 z-[2000]">
      <div className="transition-all absolute inset-0 z-1 bg-[rgba(0,2,10,0.3)] dark:bg-[rgba(0,2,10,0.6)] backdrop-import backdrop-blur-sm"></div>
      <div
        className="absolute inset-0 flex items-center justify-center px-32 pointer-events-auto z-2 pb-28"
        onClick={() => onFinish()}
      >
        <div
          className="box-border border rounded shadow-overlay bg-[var(--background-secondary-alt)] text-[var(--text-normal)] border-[var(--background-modifier-border-hover)]"
          style={{ width }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between w-full px-6 pt-4 mb-4">
            <div className="flex items-center font-semibold">{title}</div>
            <div
              className="flex items-center justify-center h-8 transition cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-accent)]"
              onClick={() => onFinish()}
            >
              <div class="w-3 h-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                  <g fill="currentColor">
                    <path d="M14.7,1.3c-0.4-0.4-1-0.4-1.4,0L8,6.6L2.7,1.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4L6.6,8l-5.3,5.3 c-0.4,0.4-0.4,1,0,1.4C1.5,14.9,1.7,15,2,15s0.5-0.1,0.7-0.3L8,9.4l5.3,5.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3 c0.4-0.4,0.4-1,0-1.4L9.4,8l5.3-5.3C15.1,2.3,15.1,1.7,14.7,1.3z"></path>
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <div className="w-full px-6 my-3">
            <div className="h-[1px] w-full border-t border-dashed border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]" />
          </div>
          <div
            className="relative z-10 overflow-y-auto"
            style={{ maxHeight: Math.min(640, window.innerHeight - 256) }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaseModal
