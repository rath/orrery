import { useMemo } from 'react'
import { calculateSaju } from '@orrery/core/saju'
import PillarTable from './PillarTable.tsx'
import RelationList from './RelationList.tsx'
import SinsalList from './SinsalList.tsx'
import JwabeopChart from './JwabeopChart.tsx'
import InjongbeopChart from './InjongbeopChart.tsx'
import DaewoonTable from './DaewoonTable.tsx'
import TransitView from './TransitView.tsx'
import CopyButton from '../CopyButton.tsx'
import Section from '../ui/Section.tsx'
import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'

interface Props {
  input: BirthInput
}

export default function SajuView({ input }: Props) {
  const { t } = useLocale()
  const result = useMemo(() => calculateSaju(input), [input])
  const ganzis = useMemo(() => result.pillars.map(p => p.pillar.ganzi), [result]) // [시, 일, 월, 년]

  return (
    <div>
      <Section
        level={2}
        hanja
        title="四柱八字"
        action={<CopyButton getText={async () => (await import('../../utils/text-export.ts')).sajuToText(result)} label={t('copy.aiCopy')} />}
      >
        <PillarTable pillars={result.pillars} unknownTime={input.unknownTime} gongmang={result.gongmang} />
      </Section>
      <RelationList relations={result.relations} pillars={ganzis} />
      <SinsalList sals={result.specialSals} />
      <JwabeopChart jwabeop={result.jwabeop} pillars={result.pillars} unknownTime={input.unknownTime} />
      <InjongbeopChart injongbeop={result.injongbeop} pillars={result.pillars} />
      <DaewoonTable
        daewoon={result.daewoon}
        unknownTime={input.unknownTime}
        birthYear={input.year}
        dayStem={result.pillars[1].pillar.stem}
        yearBranch={result.pillars[3].pillar.branch}
        gongmangBranches={result.gongmang.branches}
      />
      <TransitView natalPillars={ganzis} />
    </div>
  )
}
