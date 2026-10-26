// queryPrefill.js — 본 서비스(bdseasy.com)에서 넘어온 사무소 정보를 폼에 미리 채웁니다.
// 사양: docs/querystring-prefill.md
//
// 본 서비스 헤더의 "마케팅 > DM 템플릿" 메뉴가 아래 형태로 새 탭을 엽니다.
//   https://dmapp.bdseasy.com/?bizName=...&regNo=...&repName=...&phone1=...&phone2=...&address=...
//
// 값이 빈 파라미터는 아예 오지 않으므로 6개 중 일부만 올 수 있습니다.
// URL 로 들어온 값은 신뢰하지 않는 외부 입력으로 다룹니다 — 문자열로만 쓰고,
// trim() 후 LIMITS 글자수 제한으로 잘라서 넣습니다. (화면 출력은 Vue 템플릿 보간이 이스케이프)

import { LIMITS } from './dmModel.js';

/** 본 서비스가 넘겨주는 파라미터. 이름이 DM 모델 키와 같아 그대로 대입합니다. */
export const PREFILL_KEYS = ['bizName', 'regNo', 'repName', 'phone1', 'phone2', 'address'];

/** 모델 키와 LIMITS 키가 다른 것만 지정 (phone1/phone2 → LIMITS.phone) */
const LIMIT_KEY = { phone1: 'phone', phone2: 'phone' };

/**
 * 쿼리스트링 값을 모델에 덮어씁니다.
 * sampleData() → localStorage 복원 → 이 함수 순서로 호출해야 합니다.
 * 넘어오지 않은 파라미터와 그 외 필드는 건드리지 않습니다.
 *
 * @param {object} m DM 모델 (DmGenerator 의 this.m)
 * @param {string} [search] 테스트용. 생략하면 현재 주소의 쿼리스트링을 씁니다.
 * @returns {string[]} 실제로 채워진 키 목록 (아무것도 안 채웠으면 빈 배열)
 */
export function applyQueryPrefill(m, search) {
  const qs = search ?? (typeof location === 'undefined' ? '' : location.search);
  const params = new URLSearchParams(qs);
  const applied = [];

  for (const key of PREFILL_KEYS) {
    const raw = params.get(key);
    if (raw == null) continue; // 파라미터 자체가 없음 → 기존 값 유지

    const limit = LIMITS[LIMIT_KEY[key] ?? key];
    const value = String(raw).trim().slice(0, limit ?? undefined);
    if (!value) continue; // 공백만 들어온 경우 → 기존 값 유지

    m[key] = value;
    applied.push(key);
  }

  return applied;
}

/**
 * 주소창에서 쿼리스트링을 지웁니다.
 * 이걸 안 하면 사용자가 값을 고친 뒤 새로고침할 때 URL 값으로 되돌아갑니다.
 */
export function clearQueryString() {
  try {
    history.replaceState(null, '', location.pathname);
  } catch {
    // iframe·file:// 등에서 막힐 수 있습니다. 프리필 자체는 이미 끝났으므로 무시합니다.
  }
}
