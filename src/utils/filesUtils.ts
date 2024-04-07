import {
  loadPdfJs,
  normalizePath,
  Notice,
  requestUrl,
  RequestUrlResponse,
  TAbstractFile,
  TFile,
  TFolder,
  Vault,
} from 'obsidian'

import type GobanSGFPlugin from '../main'
import { GobanSGFPluginSettings } from '../settings'

export const checkAndCreateFolder = async (
  plugin: GobanSGFPlugin,
  folderpath: string
): Promise<TFolder> => {
  const vault = plugin.app.vault
  folderpath = normalizePath(folderpath)
  const folder = vault.getAbstractFileByPath(folderpath)
  if (folder && folder instanceof TFolder) {
    return
  }
  if (folder && folder instanceof TFile) {
    new Notice(`The folder cannot be created because it already exists as a file: ${folderpath}.`)
  }
  return await vault.createFolder(folderpath)
}

export const getNewUniqueFilepath = (
  vault: Vault,
  fullFilename: string,
  folderpath: string
): string => {
  let fname = normalizePath(`${folderpath}/${fullFilename}`)
  let file: TAbstractFile = vault.getAbstractFileByPath(fname)
  let i = 0
  const extension = fullFilename.slice(fullFilename.lastIndexOf('.'))
  const pureName = fullFilename.slice(0, fullFilename.lastIndexOf(extension))
  while (file) {
    let renamed = pureName + '_' + i
    if (pureName.endsWith('.sgf')) {
      renamed = pureName.slice(0, pureName.lastIndexOf('.sgf')) + '_' + i + '.sgf'
    }
    fname = normalizePath(
      `${folderpath}/${renamed}${extension}`
    )
    i++
    file = vault.getAbstractFileByPath(fname)
  }
  return fname
}

export const getGobanFilename = (settings: GobanSGFPluginSettings, baseName: string): string => {
  let fullName = baseName.trim()
  if (fullName.endsWith('.sgf')) {
    fullName = fullName + '.md'
  } else if (fullName.endsWith('.md') && !fullName.endsWith('.sgf.md')) {
    fullName = fullName.slice(0, fullName.lastIndexOf('.md')) + '.sgf.md'
  } else if (!fullName.endsWith('.sgf.md')) {
    fullName += '.sgf.md'
  }

  return fullName
}
