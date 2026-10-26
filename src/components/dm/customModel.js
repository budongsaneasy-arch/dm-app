// customModel.js — 가변형 템플릿(custom-v2) 데이터 모델
//
// 기존 템플릿(legacy)은 칸이 고정되어 있지만, 이 템플릿은 본문이 '블록' 배열입니다.
// 사용자가 블록을 추가·삭제하고 순서를 바꿔 A4 한 장을 구성합니다.
//
// 공통 사무소 정보(상호·등록번호·대표명·연락처 등)는 템플릿 바깥(DmStudio)에서
// 관리하므로 이 모델에는 들어 있지 않습니다. 템플릿을 바꿔도 유지됩니다.

/** 블록별 글자수 제한. 넘으면 입력칸에 경고 표시가 뜹니다. */
export const CUSTOM_LIMITS = {
  recipient: 40, //      수신인 한 줄
  blockTitle: 30, //     박스형 블록 제목
  paragraph: 400, //     일반 단락
  itemLabel: 24, //      강조 리스트의 앞머리 (예: '번거로운 절차를 도와드립니다')
  itemText: 90, //       강조 리스트의 설명
  rowLabel: 14, //       표 한 칸의 항목명
  rowValue: 30, //       표 한 칸의 값
  sigLine: 60, //        서명 푸터 한 줄
};

/** 블록 종류. key 가 모델에 저장되는 값입니다. */
export const BLOCK_TYPES = [
  { key: 'paragraph', label: '본문 단락', desc: '인사말·안내문 같은 장문 텍스트' },
  { key: 'highlight', label: '강조 리스트', desc: '앞머리를 굵게 쓰는 항목 나열' },
  { key: 'listing', label: '매물 요약 박스', desc: '단지명·면적·거래형태·가격' },
  { key: 'market', label: '시장 동향 박스', desc: '최근 실거래가 요약' },
  { key: 'signature', label: '서명 · 연락처', desc: '작성일자, 대표 공인중개사, 주소, 전화' },
];

/** 블록 공통 스타일 기본값 */
const baseStyle = () => ({ size: 'md', bold: false, align: 'left' });

export const SIZE_OPTIONS = [
  { key: 'sm', label: '작게' },
  { key: 'md', label: '보통' },
  { key: 'lg', label: '크게' },
];

export const ALIGN_OPTIONS = [
  { key: 'left', label: '왼쪽' },
  { key: 'center', label: '가운데' },
  { key: 'right', label: '오른쪽' },
];

// id 는 순번으로만 만듭니다. Date.now()/Math.random() 을 쓰지 않는 이유는
// 같은 입력이면 같은 결과가 나오도록 두기 위함입니다.
let seq = 0;
const nextId = () => `b${(seq += 1)}`;

/** 종류별 빈 블록을 만듭니다. 블록 추가 버튼이 이걸 씁니다. */
export function createBlock(type) {
  const common = { id: nextId(), type, style: baseStyle() };

  switch (type) {
    case 'paragraph':
      return { ...common, text: '' };

    case 'highlight':
      return {
        ...common,
        items: [
          { label: '', text: '' },
          { label: '', text: '' },
        ],
      };

    case 'listing':
      return {
        ...common,
        title: '매물 요약',
        rows: [
          { label: '단지명', value: '' },
          { label: '면적', value: '' },
          { label: '거래형태', value: '' },
          { label: '가격', value: '' },
        ],
      };

    case 'market':
      return { ...common, title: '최근 시장 동향', text: '' };

    case 'signature':
      return {
        ...common,
        date: '',
        lines: ['', '', ''],
      };

    default:
      throw new Error(`알 수 없는 블록 종류: ${type}`);
  }
}

/**
 * 신규 작성 시 초기값.
 * 아래 값은 전부 가상의 예시입니다. 실제 사무소·고객·지번 정보가 아닙니다.
 * 레이아웃 확인용 더미 데이터이므로 실제 발송 전 모든 항목을 교체하세요.
 */
export function customSampleData() {
  seq = 0;
  return {
    // 상단 헤더
    logo: null, //                       사용자가 올린 로고 (data URI)
    showAddrNote: true, //               주소보정 안내 띠 표시 여부

    // 수신인
    showRecipient: true,
    recipient: 'OO시 OO동 000-00 소유자님께',

    // 본문 (앞면)
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        style: baseStyle(),
        text: '안녕하십니까. 저는 OO시에서 부동산중개사무소를 운영하는 공인중개사 홍길동입니다. 처음 연락드려 실례가 많습니다.\n\n선생님께서 가지고 계신 위 토지(지목: 전, 면적 000㎡)를 사고 싶어 하는 매수 희망자가 있어 이렇게 편지를 드립니다.',
      },
      {
        id: 'b2',
        type: 'paragraph',
        style: baseStyle(),
        text: '멀리 계셔서 직접 관리하기 어려우시다면 향후 조치에 대해 고민이 많으셨을 것으로 생각합니다. 상황에 따라 임대나 위탁경영 같은 예외가 인정되기도 하지만, 서둘러 파시면 시간에 쫓겨 제값을 받기 어려울 수 있습니다.',
      },
      {
        id: 'b3',
        type: 'highlight',
        style: baseStyle(),
        items: [
          { label: '번거로운 절차를 도와드립니다', text: '멀리 계셔도 계약 일정, 서류 준비, 잔금까지 저희 사무소에서 챙기겠습니다.' },
          { label: '조건은 함께 맞춰 갑니다', text: '매매가와 지급 일정 등은 선생님의 사정을 충분히 들은 뒤 조율하겠습니다.' },
          { label: '부담 없이 상담하실 수 있습니다', text: '당장 파실 생각이 없으셔도 현재 시세나 궁금하신 점을 편하게 물어보셔도 됩니다.' },
        ],
      },
      {
        id: 'b4',
        type: 'paragraph',
        style: baseStyle(),
        text: '오래 지켜 오신 소중한 땅인 만큼 쉽게 결정하실 일은 아니라는 것을 잘 알고 있습니다. 다만 이번 소식이 선생님께 도움이 될 수 있겠다는 생각에 조심스럽게 연락드렸습니다. 관심이 있으시면 아래 연락처로 편하게 전화나 문자 주십시오.',
      },
      {
        id: 'b5',
        type: 'signature',
        style: baseStyle(),
        date: '2026년 00월 00일',
        lines: [
          'OO부동산 공인중개사사무소 대표 공인중개사 홍길동',
          '주소: OO시 OO구 OO로 00, 0층 000호',
          '전화: 010-0000-0000 / 사무실 00-000-0000',
        ],
      },
    ],

    // 뒷면 (기본은 끔)
    hasBackPage: false,
    backBlocks: [],
  };
}

/** 뒷면을 켤 때 넣어 주는 기본 프리셋 */
export function backPagePreset() {
  return [
    {
      id: nextId(),
      type: 'listing',
      style: baseStyle(),
      title: '보유 매물 요약',
      rows: [
        { label: '단지명', value: 'OO아파트' },
        { label: '면적', value: '전용 00㎡' },
        { label: '거래형태', value: '매매' },
        { label: '가격', value: '0억 0,000만원' },
      ],
    },
    {
      id: nextId(),
      type: 'market',
      style: baseStyle(),
      title: '최근 시장 동향',
      text: '최근 3개월 실거래 기준으로 정리한 내용입니다. 실제 시세는 동·층·향에 따라 차이가 큽니다.',
    },
  ];
}
