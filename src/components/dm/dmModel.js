// dmModel.js — DM 데이터 모델 · 글자수 제한 정의
// 부동산 DM 생성기 (Vue 3)

/** 항목별 권장 글자수 제한 (폼 maxlength 에 사용) */
export const LIMITS = {
  bizName: 20,        // 상호(브랜드)
  bizType: 14,        // 상호 접미사 (부동산중개법인 / 공인중개사사무소 등)
  regNo: 22,          // 개설등록번호
  issue: 14,          // 발행 호수
  repName: 10,        // 대표명
  repTitle: 16,       // 대표 직함
  phone: 20,          // 전화번호
  address: 44,        // 사무소 주소
  addrNote: 80,       // 주소보정 안내
  greetTarget: 26,    // 인사말 대상 (단지명(지역명) + 소유주님께)
  greetBody: 120,     // 인사말 본문
  tableTitle: 12,     // 시세표 제목
  baseDate: 24,       // 기준일
  tableFoot: 60,      // 시세표 각주
  rowPyeong: 8,       // 평형
  rowArea: 12,        // 전용면적
  rowSale: 16,        // 매매 (하한~상한)
  rowJeonse: 14,      // 전세
  rowWolse: 14,       // 월세
  rowNote: 24,        // 특이사항
  trendHeadPre: 16,   // 시장동향 헤드라인 앞
  trendHeadHi: 16,    // 강조 부분
  trendHeadPost: 8,   // 헤드라인 끝
  statNum: 8,         // 지표 수치
  statLabel: 18,      // 지표 라벨
  trendBody: 110,     // 시장동향 본문
  ctaBadge: 14,       // CTA 배지
  ctaHead: 26,        // CTA 헤드라인
  ctaSub: 32,         // CTA 서브문구
  backTitle: 24,      // 뒷면 제목
  backSub: 26,        // 뒷면 부제
  backNote: 60,       // 뒷면 변동 고지
  cardTitle: 28,      // 정보카드 제목
  cardBody: 90,       // 정보카드 본문
  cardCell: 12,       // 비교표 셀
  cardExample: 70,    // 예시 박스
  caseTitle: 16,      // 사례 제목
  caseBody: 80,       // 사례 본문
  closing: 60,        // 마무리 문구
};

/** 기본(샘플) 데이터 — 신규 작성 시 초기값
 *  아래 값은 전부 가상의 예시입니다. 실제 사무소 정보·단지명·실거래가가 아닙니다.
 *  레이아웃 확인용 더미 데이터이므로 실제 발송 전 모든 항목을 교체하세요. */
export function sampleData() {
  return {
    // 사무소 정보
    bizName: '예시부동산', bizType: '공인중개사사무소', regNo: '00000-0000-00000',
    issue: '2026. 1월호', repName: '홍길동', repTitle: '대표 공인중개사',
    phone1: '02-0000-0000', phone2: '010-0000-0000',
    address: '서울 OO구 OO대로 00길 00, OO빌딩 000호',
    profilePhoto: null, showProfile: true, showQR: true,
    // 후킹 / 인사말
    addrNote: '등기부 소유자 주소로 발송됩니다. 주소 변경 시 연락 주시면 새 주소로 보내드리고 모바일 쿠폰을 드립니다.',
    greetTarget: 'OO아파트(OO동) 소유주님께',
    greetBody: 'OO동 단지 거래만 전문으로 다뤄온 예시부동산입니다. 소유하신 집의 정확한 가치와 지금의 시장 흐름을, 가장 가까운 이웃 전문가가 정직하게 전해드리겠습니다. 늘 마음의 문을 활짝 열고 기다리겠습니다.',
    // 시세표
    tableTitle: '시세 기준표', baseDate: '2026. 1월 기준 · 단위 만원/억',
    tableFoot: '※ 국토교통부 실거래가 및 단지 호가 기준. 실제 시세는 동·층·향에 따라 차이가 큽니다.',
    rows: [
      { pyeong: '25평', area: '전용 59㎡', sale: '0 ~ 0억', jeonse: '0 ~ 0억', wolse: '0억 / 000', note: '최근 실거래 00억 (고층)' },
      { pyeong: '33평', area: '전용 84㎡', sale: '0 ~ 0억', jeonse: '0 ~ 0억', wolse: '0억 / 000', note: '최근 실거래 00억 (고층)' },
      { pyeong: '45평', area: '전용 114㎡', sale: '0 ~ 0억', jeonse: '0 ~ 0억', wolse: '0억 / 000', note: '최근 실거래 00억 (고층)' },
      { pyeong: '53평', area: '전용 137㎡', sale: '0 ~ 0억', jeonse: '—', wolse: '0억 / 000', note: '최근 실거래 00억 (중층)' },
    ],
    // 시장 동향
    trendHeadPre: '지금, OO동은 ', trendHeadHi: '매도를 준비할 시점', trendHeadPost: '입니다.',
    stats: [
      { num: '▲ 00%', label: '최근 3개월\n거래량 증가' },
      { num: '00일', label: '로열층 평균\n매도 소요 기간' },
      { num: '00건', label: '현재 단지 내\n대기 매수 문의' },
    ],
    trendBody: 'OO 재건축 구역의 진행과 신축 거래가 회복이 맞물리며, 거래 가능 물량이 적은 OO아파트의 희소가치가 다시 주목받고 있습니다. 매물이 귀한 지금이 협상에 유리한 시점입니다.',
    // CTA
    ctaBadge: '내 집 시세 무료 진단', ctaHead: '내 집 실거래가, 무료로 확인하세요',
    ctaSub: '전화 한 통이면 우리 집 정확한 시세를 알려드립니다.',
    // 뒷면
    backTitle: '소유주님이 꼭 아셔야 할 부동산 정보', backSub: '2026년 1월 · 제도 · 세금 · 시장 이슈',
    backNote: '아래 정보는 시장 상황에 따라 매월 업데이트되어 발송됩니다.',
    card1: {
      title: '달라지는 보유세 · 양도세 핵심',
      body: '1주택 장기보유 공제 요건과 다주택자 중과 기준이 조정됩니다. 보유 기간과 거주 요건에 따라 세 부담 차이가 크니 매도 전 반드시 점검이 필요합니다.',
      h2: '현행', h3: '변경 예정',
      rows: [['장특공제 한도', '000%', '요건 변경'], ['다주택 중과', '한시 배제', '기준 재조정']],
    },
    card2: {
      title: '상속 · 증여, 미리 준비하면 세금이 달라집니다',
      body: '증여 시점과 평가 방법에 따라 세액이 크게 달라집니다. 보유 자산 규모가 큰 단지일수록 사전 설계가 중요합니다.',
      example: '예시 · 33평 보유 00년, 매도 00억 기준 — 준비 여부에 따라 차이가 발생할 수 있습니다.',
      photo: null,
    },
    caseTitle: '이웃 거래 성사 사례',
    caseBody: '본 단지 84㎡, 게재 00일 만에 00억 매매 완료 — 최근 거래 사례입니다. 우리 집은 지금 얼마일까요?',
    closing: '개인 맞춤 상담은 언제든 환영합니다 — 02-0000-0000 으로 편하게 문의주세요.',
  };
}

export const BLANK_ROW = () => ({ pyeong: '', area: '', sale: '', jeonse: '', wolse: '', note: '' });
