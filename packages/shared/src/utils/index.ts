import names from '../../data/names.json'

export function removeEmpty(obj: any) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null))
}

export function randomUsername() {
  return names[Math.floor(Math.random() * names.length)]
}
