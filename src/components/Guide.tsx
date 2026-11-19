import { Fragment } from 'react'
import CopyButton from './CopyButton.tsx'
import { useLocale } from '../i18n/index.ts'

/** 문구 속 {이름} 자리에 굵은 글씨로 버튼 이름을 넣는다. */
function withNames(template: string, names: Record<string, string>): React.ReactNode {
  return template.split(/(\{\w+\})/).map((part, i) => {
    const name = /^\{(\w+)\}$/.exec(part)?.[1]
    if (!name || !(name in names)) return <Fragment key={i}>{part}</Fragment>
    return <strong key={i} className="font-semibold text-fg">{names[name]}</strong>
  })
}

function Example({ title, prompt, children }: { title: string; prompt: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-fg">{title}</h4>
        <CopyButton variant="ghost" getText={() => prompt} />
      </div>
      <div className="mt-1 rounded-md bg-sunken px-3.5 py-3 text-base leading-relaxed text-fg-2">
        <p>{prompt}</p>
        {children}
      </div>
    </div>
  )
}

export default function Guide() {
  const { t } = useLocale()
  const steps = [
    t('guide.step1'),
    t('guide.step2'),
    withNames(t('guide.step3'), { copyAll: t('app.copyAll'), copy: t('copy.aiCopy') }),
    t('guide.step4'),
  ]

  return (
    <section className="mt-10 border-t border-line pt-8">
      <h2 className="text-lg font-semibold text-fg">{t('guide.title')}</h2>
      <ol className="mt-3 max-w-[65ch] space-y-2 text-base leading-relaxed text-fg-2">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="w-4 shrink-0 text-right font-medium text-muted tabular-nums">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <h3 className="mt-8 text-base font-semibold text-fg">{t('guide.askAI')}</h3>
      <div className="mt-3 grid max-w-[65ch] gap-5">
        <Example title={t('guide.personality')} prompt={t('guide.personalityEx')}>
          <p className="mt-1 text-muted">{t('guide.pasteData')}</p>
        </Example>
        <Example title={t('guide.counseling')} prompt={t('guide.counselingEx')}>
          <p className="mt-1 text-muted">{t('guide.pasteData')}</p>
        </Example>
        <Example title={t('guide.compatibility')} prompt={t('guide.compatibilityEx')}>
          <p className="mt-1 text-muted">{t('guide.pasteA')}</p>
          <p className="text-muted">{t('guide.pasteB')}</p>
        </Example>
      </div>
    </section>
  )
}
