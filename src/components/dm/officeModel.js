// officeModel.js — 템플릿이 공유하는 중개사무소 정보
//
// 템플릿을 바꿔도 이 값들은 유지됩니다. DmStudio 가 들고 있다가 각 편집기로 내려줍니다.
// 본 서비스에서 넘어오는 프리필(queryPrefill.js)도 이 모델을 채웁니다.

/** 공통으로 쓰는 키 목록. 기존 템플릿의 모델에서 이 키만 떼어 쓸 때도 씁니다. */
export const OFFICE_KEYS = [
  'bizName',
  'bizType',
  'regNo',
  'repName',
  'repTitle',
  'phone1',
  'phone2',
  'address',
  'addrNote',
];

/**
 * 공통 정보 기본값.
 * 전부 가상의 예시입니다. 실제 사무소 정보가 아닙니다.
 */
export function officeDefaults() {
  return {
    bizName: '예시부동산',
    bizType: '공인중개사사무소',
    regNo: '00000-0000-00000',
    repName: '홍길동',
    repTitle: '대표 공인중개사',
    phone1: '02-0000-0000',
    phone2: '010-0000-0000',
    address: '서울 OO구 OO대로 00길 00, OO빌딩 000호',
    addrNote: '등기부 소유자 주소로 발송됩니다. 주소 변경 시 연락 주시면 새 주소로 보내드리고 모바일 쿠폰을 드립니다.',
  };
}

/** 어떤 모델에서든 공통 키만 뽑아냅니다. */
export function pickOffice(model) {
  const out = {};
  OFFICE_KEYS.forEach((k) => {
    if (model[k] !== undefined) out[k] = model[k];
  });
  return out;
}
