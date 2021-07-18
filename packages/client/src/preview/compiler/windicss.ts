import { Processor } from 'windicss/lib'
import { HTMLParser } from 'windicss/utils/parser'
import { fs } from '~/store/filesystem'

export function generateStyles(html: string) {
  if (!fs.settings.windicss.enabled)
    return ''

  // Get windi processor
  const allowList = [
    'dark:text-light-300',
    'text-dark-100',
  ].join(' ')

  // Parse html to get array of class matches with location
  const parser = new HTMLParser(html)

  const processor = new Processor({
    darkMode: 'class',
    attributify: true,
  })

  // Parse all classes and put into one line to simplify operations
  const htmlClasses = parser
    .parseClasses()
    .map(i => i.result)
    .join(' ')

  // Generate preflight based on the html we input
  const preflightSheet = processor.preflight(html)

  // Process the html classes to an interpreted style sheet
  const interpretedSheet = processor.interpret(`${htmlClasses} ${allowList}`).styleSheet

  // Always returns array
  const castArray = (val: any) => (Array.isArray(val) ? val : [val])

  const attrs: { [key: string]: string | string[] } = parser
    .parseAttrs()
    .reduceRight((acc: { [key: string]: string | string[] }, curr) => {
      // get current match key
      const attrKey = curr.key

      // ignore class or className attributes
      if (attrKey === 'class' || attrKey === 'className') return acc

      // get current match value as array
      const attrValue = castArray(curr.value)

      // if current match key is already in accumulator
      if (attrKey in acc) {
        // get current attr key value as array
        const attrKeyValue = castArray(acc[attrKey])

        // append current value to accumulator value
        acc[attrKey] = [...attrKeyValue, ...attrValue]
      }
      else {
        // else add atrribute value array to accumulator
        acc[attrKey] = attrValue
      }

      return acc
    }, {})

  const attrsSheet = processor.attributify(attrs)

  // Build styles
  const APPEND = false
  const MINIFY = false
  const styles = fs.settings.windicss?.attributify
    ? attrsSheet.styleSheet.extend(interpretedSheet).extend(preflightSheet, APPEND).build(MINIFY)
    : interpretedSheet.extend(preflightSheet, APPEND).build(MINIFY)

  return styles
}
