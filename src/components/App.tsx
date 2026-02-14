import { useRef, useState } from 'react'
import BirthForm from './BirthForm.tsx'
import Guide from './Guide.tsx'
import CopyButton from './CopyButton.tsx'
import SajuView from './saju/SajuView.tsx'
import ZiweiView from './ziwei/ZiweiView.tsx'
import NatalView from './natal/NatalView.tsx'
import { calculateSaju } from '../core/saju.ts'
import { createChart } from '../core/ziwei.ts'
import { calculateNatal } from '../core/natal.ts'
import { sajuToText, ziweiToText, natalToText } from '../utils/text-export.ts'
import type { BirthInput } from '../core/types.ts'

type Tab = 'saju' | 'ziwei' | 'natal'

export default function App() {
  const [tab, setTab] = useState<Tab>('saju')
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  function handleSubmit(input: BirthInput) {
    setBirthInput(input)
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <a
        href="https://github.com/rath/orrery"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-0 right-0 z-50"
        aria-label="View source on GitHub"
      >
        <svg width="60" height="60" viewBox="0 0 250 250" className="fill-gray-700 text-white" aria-hidden="true">
          <path d="M0 0l115 115h15l12 27 108 108V0z" />
          <path d="M128.3 109c-14.5-9.3-9.3-19.4-9.3-19.4 3-6.9 1.5-11 1.5-11-1.3-6.6 2.9-2.3 2.9-2.3 3.9 4.6 2.1 11 2.1 11-2.6 10.3 5.1 14.6 8.9 15.9" fill="currentColor" style={{ transformOrigin: '130px 106px' }} />
          <path d="M115 115c-.1.1 3.7 1.5 4.8.4l13.9-13.8c3.2-2.4 6.2-3.2 8.5-3 -8.4-10.6-14.7-24.2 1.6-40.6 4.7-4.6 10.2-6.8 15.9-7 .6-1.6 3.5-7.4 11.7-10.9 0 0 4.7 2.4 7.4 16.1 4.3 2.4 8.4 5.6 12.1 9.2 3.6 3.6 6.8 7.8 9.2 12.2 13.7 2.6 16.2 7.3 16.2 7.3-3.6 8.2-9.4 11.1-10.9 11.7-.3 5.8-2.4 11.2-7.1 15.9-16.4 16.4-29.4 11.6-36.4 8.8 .2 2.8-1 6.8-5 10.8L141 136.5c-1.2 1.2.6 5.4.8 5.3z" fill="currentColor" />
        </svg>
      </a>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 tracking-wide">
            서버 없이 브라우저에서 동작하는 <span className="font-medium text-gray-700">사주팔자 · 자미두수 · 서양 점성술</span> 계산기
          </p>
          <p className="text-xs text-gray-400 mt-1">십신, 대운, 명반, 사화, 출생차트까지 한 번에</p>
        </div>
        <BirthForm onSubmit={handleSubmit} />

        {birthInput && (
          <>
            {/* 탭 네비게이션 */}
            <div ref={resultsRef} className="flex items-center border-b border-gray-200 mt-6 mb-4">
              <button
                className={`px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                  tab === 'saju'
                    ? 'border-gray-800 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setTab('saju')}
              >
                사주팔자
              </button>
              <button
                className={`px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                  tab === 'ziwei'
                    ? 'border-gray-800 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setTab('ziwei')}
              >
                자미두수
              </button>
              <button
                className={`px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                  tab === 'natal'
                    ? 'border-gray-800 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setTab('natal')}
              >
                출생차트
              </button>
              <div className="ml-auto pb-1">
                <CopyButton
                  label="AI 해석용 전부 복사"
                  getText={async () => {
                    const saju = calculateSaju(birthInput)
                    const parts = [sajuToText(saju)]
                    if (!birthInput.unknownTime) {
                      const chart = createChart(birthInput.year, birthInput.month, birthInput.day, birthInput.hour, birthInput.minute, birthInput.gender === 'M')
                      parts.push(ziweiToText(chart))
                      const natal = await calculateNatal(birthInput)
                      parts.push(natalToText(natal))
                    }
                    return parts.join('\n\n')
                  }}
                />
              </div>
            </div>

            {tab === 'saju' && <SajuView input={birthInput} />}
            {tab === 'ziwei' && <ZiweiView input={birthInput} />}
            {tab === 'natal' && <NatalView input={birthInput} />}
          </>
        )}

        <Guide />
      </main>
      <footer className="text-center text-xs text-gray-400 py-6">
        <p>&copy; 2026 Jang-Ho Hwang &middot; <a href="https://x.com/xrath" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">@xrath</a></p>
      </footer>
    </div>
  )
}
