import { render, FunctionalComponent, h } from 'preact'

import { Confirm, ConfirmProps } from './components/Confirm'
import { InputPopup, InputPopupProps } from './components/InputPopup'
import { DisplaySetting, DisplaySettingProps } from './components/DisplaySetting'

interface ModalApiExtProps {
  onFinish: (unMountReady?: Promise<void>) => Promise<void>
}

interface ModalApiParams<K extends object> {
  props: K
  id: string | number
}

interface Config {
  uniqKey?: string
}

const mountedUniqModals = new Map<string, { mountedDiv: HTMLDivElement }>()

function createMountDiv(cssSelector: string) {
  const div = document.createElement('div')
  ;(document.querySelector(cssSelector) || document.body).appendChild(div)
  return div
}

function modalApi<T extends object = {}>(
  Comp: FunctionalComponent<T & ModalApiExtProps>,
  config?: Config
) {
  const { uniqKey } = config || {}

  return async function (params: ModalApiParams<T>) {
    if (uniqKey && mountedUniqModals.get(uniqKey)) {
      return
    }
    let resolveFunc: (value?: any) => void
    const toResolve = async (unMountReady?: Promise<void>) => {
      let v = undefined
      if (unMountReady) {
        v = await unMountReady
      }
      resolveFunc(v)
    }
    const modalPromise = new Promise((resolve: (value?: any) => void) => {
      resolveFunc = resolve
    })
    const mountDiv = createMountDiv(`.goban-sgf-plugin-pop-layer-${params.id.toString()}`)
    const renderComp = () => {
      render(
        h(Comp, {
          ...params.props,
          onFinish: toResolve,
        }),
        mountDiv
      )
    }
    try {
      renderComp()
      uniqKey && mountedUniqModals.set(uniqKey, { mountedDiv: mountDiv })
      return await modalPromise
    } catch {
      // ignore
    } finally {
      mountDiv.remove()
      uniqKey && mountedUniqModals.delete(uniqKey)
    }
  }
}

const modals = {
  Confirm: modalApi<ConfirmProps>(Confirm, {
    uniqKey: 'Confirm',
  }),
  InputPopup: modalApi<InputPopupProps>(InputPopup, {
    uniqKey: 'InputPopup',
  }),
  DisplaySetting: modalApi<DisplaySettingProps>(DisplaySetting, {
    uniqKey: 'DisplaySetting',
  }),
}

export default modals
