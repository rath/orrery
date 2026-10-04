 import React, { useState } from 'react'
import { useLocale } from '../i18n/index.ts'

function ExampleBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 rounded border border-dashed border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
      {children}
    </div>
  )
}

export default function Guide() {
  const { t } = useLocale()

  // 1. 유저 상담 입력값 상태 저장 주머니
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    userMessage: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 2. 상담 신청 전송 버튼을 누를 때 실행되는 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      alert('성함과 연락처는 필수 항목입니다.')
      return
    }

    setIsSubmitting(true)

    // 🌟 법진님의 Make.com 우체통 주소입니다.
    const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/vra3xbshsebs6z06af9g9l4a2o853xvl'

    // 현재 화면의 사주 데이터를 클립보드에서 자동으로 긁어오는 임시 연동 포장
    let clipboardData = ''
    try {
      clipboardData = await navigator.clipboard.readText()
    } catch (err) {
      clipboardData = '클립보드 데이터 가져오기 실패(권한 필요)'
    }

    const payload = {
      customerName: formData.name,
      customerPhone: formData.phone,
      message: formData.userMessage,
      fortuneData: clipboardData, // 사용자가 '전부 복사' 버튼을 누른 데이터가 자동으로 담깁니다.
      submittedAt: new Date().toLocaleString()
    }

    try {
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setIsSuccess(true)
        alert('법진 선생님께 상담 신청서가 안전하게 전달되었습니다.')
        setFormData({ name: '', phone: '', userMessage: '' })
      } else {
        alert('전송에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      }
    } catch (error) {
      console.error(error)
      alert('서버 연결 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      <section className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-5 bg-gray-50/50 dark:bg-gray-900/50">
        <h3 className="text-base font-medium text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1.5">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {t('guide.title')}
        </h3>
        <ol className="text-base text-gray-500 dark:text-gray-400 space-y-2 list-none pl-0">
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-400 dark:text-gray-500">1.</span>
            <span>{t('guide.step1')}</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-400 dark:text-gray-500">2.</span>
            <span><strong className="text-gray-600 dark:text-gray-300">{t('guide.step2a')}</strong>{t('guide.step2b')}</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-400 dark:text-gray-500">3.</span>
            <span>
              {t('guide.step3a')}<strong className="text-gray-600 dark:text-gray-300">{t('guide.step3bold')}</strong>{t('guide.step3b')}<strong className="text-gray-600 dark:text-gray-300">{t('guide.step3bold2')}</strong>{t('guide.step3c')}
            </span>
          </li>
        </ol>

        <hr className="my-4 border-gray-200 dark:border-gray-700" />

        {/* 🛠️ AI 고민상담 영역을 덮어쓰고, 법진님 1:1 상담 신청 폼으로 변경한 영역 */}
        <h4 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">AI 분석 또는 전문가 상담 연동</h4>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">{t('guide.personality')}</p>
            <ExampleBox>
              {t('guide.personalityEx')}<br />
              <span className="text-gray-400 dark:text-gray-500">{t('guide.pasteData')}</span>
            </ExampleBox>
          </div>

          {/* 🌟 기존 '고민 상담' 자리에 들어간 1:1 심층 신청 양식 상자 */}
          <div className="p-4 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <h5 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">
              🔮 AI 해석 대신, 전문가 법진 선생님께 직접 1:1 인생 조언 받기
            </h5>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              위의 3번 설명대로 <strong className="text-gray-700 dark:text-gray-300">'AI 해석용 전부 복사'를 누르신 후</strong>, 아래 양식을 채워 신청하시면 법진 선생님이 명조를 직접 정밀 분석해 드립니다.
            </p>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">성함 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">연락처 *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="010-1234-5678"
                  className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">집중 상담받고 싶은 큰 어려움이나 고민 내용</label>
                <textarea
                  name="userMessage"
                  value={formData.userMessage}
                  onChange={handleChange}
                  rows={3}
                  placeholder="올해 이직운이나 향후 3년 재물 흐름이 궁금합니다."
                  className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-vertical"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full p-2.5 rounded text-sm font-bold text-white transition-colors ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {isSubmitting ? '상담 신청서 전송 중...' : '내 사주 차트 데이터와 함께 인생 조언 상담 신청하기'}
              </button>
            </div>

            {isSuccess && (
              <p className="mt-2 text-xs font-bold text-green-600 dark:text-green-400 text-center">
                ✓ 신청서와 데이터가 법진 선생님께 안전하게 전달되었습니다!
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">{t('guide.compatibility')}</p>
            <ExampleBox>
              {t('guide.compatibilityEx')}<br /><br />
              <span className="text-gray-400 dark:text-gray-500">{t('guide.pasteA')}</span><br /><br />
              <span className="text-gray-400 dark:text-gray-500">{t('guide.pasteB')}</span>
            </ExampleBox>
          </div>
        </div>
      </section>
    </div>
  )
}
