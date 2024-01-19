import { t } from '@/lang/helper'
import { noopAsync, WithFinishFC } from '../common'
import BaseModal from './BaseModal'

export interface ConfirmProps {
  title: any
  msg: any
  onConfirm?: () => void
  onCancel?: () => void
}

export const Confirm: WithFinishFC<ConfirmProps> = ({ onFinish, title, msg }) => {
  const handleCancel = () => {
    onFinish(Promise.resolve('cancel'))
  }

  const handleConfirm = () => {
    onFinish(Promise.resolve('confirm'))
  }

  return (
    <BaseModal onFinish={onFinish} title={title} width={360}>
      <div className="w-full px-6 pb-6">
        <div className="text-sm">{msg}</div>
        <div className="flex items-center justify-end mt-6">
          <button
            className="rounded shrink-0 h-8 py-0 px-3 flex items-center justify-center text-[var(--text-on-accent)] bg-[var(--interactive-accent)] transition shadow-none outline-none border-none cursor-pointer hover:bg-[var(--interactive-accent-hover)] hover:text-[var(--text-on-accent)] mr-4 active:scale-90"
            onClick={handleConfirm}
          >
            {t('CONFIRM')}
          </button>

          <button
            className="rounded shrink-0 h-8 py-0 px-3 flex items-center justify-center text-[var(--text-muted)] bg-[var(--interactive-normal)]transition shadow-none outline-none cursor-pointer hover:bg-[var(--interactive-hover)] hover:text-[var(--text-normal)] active:scale-90 border border-solid border-[var(--background-modifier-border)]"
            onClick={handleCancel}
          >
            {t('CANCEL')}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}
