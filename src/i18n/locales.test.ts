import { describe, expect, it } from 'vitest'
import { LOCALES, messages } from './index.ts'
import en from './locales/en.ts'

const REFERENCE_KEYS = Object.keys(en).sort()
/** Keys whose value is legitimately empty in some languages (CJK-only unit suffixes). */
const MAY_BE_EMPTY = /Suffix$/

describe('i18n locale parity', () => {
  it('has a message table for every locale in LOCALES', () => {
    for (const { code } of LOCALES) {
      expect(messages[code], `messages missing for '${code}'`).toBeDefined()
    }
  })

  it('has no message table for unknown locales', () => {
    const known = new Set<string>(LOCALES.map(l => l.code))
    for (const code of Object.keys(messages)) {
      expect(known.has(code), `unexpected locale '${code}' in messages`).toBe(true)
    }
  })

  for (const { code } of LOCALES) {
    it(`'${code}' has exactly the same key set as 'en'`, () => {
      const keys = Object.keys(messages[code]).sort()
      const missing = REFERENCE_KEYS.filter(k => !keys.includes(k))
      const extra = keys.filter(k => !REFERENCE_KEYS.includes(k))
      expect(missing, `missing in '${code}'`).toEqual([])
      expect(extra, `extra in '${code}'`).toEqual([])
    })

    it(`'${code}' has no empty values outside suffix keys`, () => {
      const empty = Object.entries(messages[code])
        .filter(([k, v]) => !MAY_BE_EMPTY.test(k) && v.trim() === '')
        .map(([k]) => k)
      expect(empty).toEqual([])
    })
  }

  it('date.monthDay contains both placeholders in every locale', () => {
    for (const { code } of LOCALES) {
      const tpl = messages[code]['date.monthDay']
      expect(tpl, `'${code}'`).toContain('{m}')
      expect(tpl, `'${code}'`).toContain('{d}')
    }
  })
})
