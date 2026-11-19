import { useEffect, useRef } from 'react'
import { useLocale } from '../i18n/index.ts'
import { iconButtonClass } from './ui/classes.ts'

interface Props {
  onClose: () => void
  children: React.ReactNode
}

/** 좁은 화면에서 프로필 목록을 띄우는 대화상자. 넓은 화면에서는 목록이 옆 단에 늘 보인다. */
export default function PeopleDialog({ onClose, children }: Props) {
  const { t } = useLocale()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-label={t('profile.listTitle')}
      onClick={e => { if (e.target === dialogRef.current) onClose() }}
      className="m-auto mb-0 max-h-[85dvh] w-full max-w-none rounded-t-xl border border-line bg-bg p-0 sm:mb-auto sm:w-[26rem] sm:rounded-xl"
    >
      <div className="flex max-h-[85dvh] flex-col p-5">
        <div className="-mt-2 -mr-2 flex justify-end">
          <button type="button" onClick={onClose} className={iconButtonClass} aria-label={t('profile.close')}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
