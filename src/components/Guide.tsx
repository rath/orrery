function ExampleBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded border border-gray-200 px-3 py-2 text-xs text-gray-600 leading-relaxed">
      {children}
    </div>
  )
}

export default function Guide() {
  return (
    <div className="mt-8 space-y-4">
      {/* 사용 방법 + AI 질문 예시 */}
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-3">사용 방법</h3>
        <ol className="text-sm text-gray-600 space-y-2 list-none pl-0">
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-400">1.</span>
            <span>위 폼에 생년월일, 태어난 시간, 성별을 입력합니다.</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-400">2.</span>
            <span><strong className="text-gray-700">계산</strong> 버튼을 누르면 사주팔자와 자미두수 결과가 나타납니다.</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-400">3.</span>
            <span>
              탭 우측의 <strong className="text-gray-700">AI 해석용 전부 복사</strong>를 누르면 사주팔자 + 자미두수 데이터가 한 번에 복사됩니다.
              각 탭의 <strong className="text-gray-700">AI 해석용 복사</strong> 버튼으로 개별 복사도 가능합니다.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-400">4.</span>
            <span>Claude, ChatGPT, Gemini 등 AI 채팅에 붙여넣고 해석을 요청하세요.</span>
          </li>
        </ol>

        <hr className="my-4 border-gray-100" />

        <h4 className="text-xs font-medium text-gray-500 mb-3">AI에게 이렇게 물어보세요</h4>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">성격 분석</p>
            <ExampleBox>
              다음은 내 사주팔자와 자미두수 명반이야. 성격적 강점과 약점을 분석해줘.<br />
              <span className="text-gray-400">[복사한 데이터 붙여넣기]</span>
            </ExampleBox>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">고민 상담</p>
            <ExampleBox>
              아래 명반 데이터를 기반으로, 내가 살면서 힘들 수 있는 부분 Top 3를 뽑고 조언해줘.<br />
              <span className="text-gray-400">[복사한 데이터 붙여넣기]</span>
            </ExampleBox>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">궁합 보기</p>
            <ExampleBox>
              두 사람의 명반 데이터를 보내줄게. 성격적으로 잘 맞는 부분과 부딪힐 수 있는 부분을 분석해줘.<br /><br />
              <span className="text-gray-400">[A의 데이터 붙여넣기]</span><br /><br />
              <span className="text-gray-400">[B의 데이터 붙여넣기]</span>
            </ExampleBox>
          </div>
        </div>
      </section>

      {/* 용어 설명 */}
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-3">사주팔자·자미두수란?</h3>
        <dl className="text-sm text-gray-600 space-y-2">
          <div>
            <dt className="font-medium text-gray-700 inline">四柱八字(사주팔자)</dt>
            <dd className="inline ml-1">— 태어난 연·월·일·시를 네 기둥(四柱), 여덟 글자(八字)로 표현하는 동양 명리학의 기본 체계입니다.</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700 inline">紫微斗數(자미두수)</dt>
            <dd className="inline ml-1">— 태어난 시간을 바탕으로 12궁의 별 배치를 산출하여 운명을 분석하는 중국 전통 점성술입니다.</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
