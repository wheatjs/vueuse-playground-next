import names from '../../data/names.json'

export function removeEmpty(obj: any) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null))
}

export function randomUsername() {
  return names[Math.floor(Math.random() * names.length)]
}

export function insertAt(source: string, index: number, text: string) {
  return source.substr(0, index) + text + source.substr(index)
}

export function deleteAt(source: string, index: number, length: number) {
  return source.substr(0, index) + source.substr(index + length)
}

export function getExtensionFromFilename(name: string) {
  const split = name.split('.')
  return split[split.length - 1]
}
