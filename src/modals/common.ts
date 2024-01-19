import { FunctionalComponent } from 'preact'

export type WithFinishFC<T> = FunctionalComponent<T & { onFinish: (unMountReady?: Promise<any>) => Promise<any> }>

export const noopAsync = async () => {}
