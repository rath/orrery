import { useRef, useState } from 'react'
import BirthForm from './BirthForm.tsx'
import SajuView from './saju/SajuView.tsx'
import ZiweiView from './ziwei/ZiweiView.tsx'
import type { BirthInput } from '../core/types.ts'

type Tab = 'saju' | 'ziwei'

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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-6">
        <BirthForm onSubmit={handleSubmit} />

        {birthInput && (
          <>
            {/* 탭 네비게이션 */}
            <div ref={resultsRef} className="flex border-b border-gray-200 mt-6 mb-4">
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'saju'
                    ? 'border-gray-800 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setTab('saju')}
              >
                四柱八字
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'ziwei'
                    ? 'border-gray-800 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setTab('ziwei')}
              >
                紫微斗數
              </button>
            </div>

            {tab === 'saju' && <SajuView input={birthInput} />}
            {tab === 'ziwei' && <ZiweiView input={birthInput} />}
          </>
        )}
      </main>
    </div>
  )
}
