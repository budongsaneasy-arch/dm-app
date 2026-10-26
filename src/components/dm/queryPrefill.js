// queryPrefill.js — 본 서비스(bdseasy.com)에서 넘어온 사무소 정보를 폼에 미리 채웁니다.
// 사양: docs/querystring-prefill.md
//
// 값은 쿼리스트링(?)이 아니라 프래그먼트(#)로 받습니다.
//   https://dmapp.bdseasy.com/#bizName=...&regNo=...&repName=...&phone1=...&phone2=...&address=...
//
// 왜 # 인가: ? 뒤의 쿼리스트링은 HTTP 요청라인의 일부라서 페이지를 받아오는 첫 요청에
// 그대로 실려 나갑니다. 이 앱은 GitHub Pages(앞단 Fastly CDN)에 올라가 있어, 개인 휴대전화번호가
// 양쪽 접근 로그에 남을 수 있습니다. # 뒤의 프래그먼트는 브라우저가 서버로 보내지 않으므로
// 값이 단말을 벗어나지 않습니다. 자세한 내용은 docs/security-review.md 참고.
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
 * 프래그먼트(#) 값을 모델에 덮어씁니다.
 * sampleData() → (세션 복원) → 이 함수 순서로 호출해야 합니다.
 * 넘어오지 않은 파라미터와 그 외 필드는 건드리지 않습니다.
 *
 * @param {object} m DM 모델 (DmGenerator 의 this.m)
 * @param {string} [fragment] 테스트용. 생략하면 현재 주소의 # 뒤를 씁니다.
 * @returns {string[]} 실제로 채워진 키 목록 (아무것도 안 채웠으면 빈 배열)
 */
export function applyQueryPrefill(m, fragment) {
  const raw = fragment ?? (typeof location === 'undefined' ? '' : location.hash);

  // 쿼리스트링은 받지 않습니다. location.hash 에는 '?' 가 들어올 수 없으므로
  // 이 가드는 나중에 누군가 실수로 location.search 를 넘기는 경우를 막기 위한 것입니다.
  // 그대로 동작해 버리면 값이 서버 로그에 남는 경로가 되살아납니다.
  if (raw.startsWith('?')) {
    console.warn('[DM] 프리필 값은 프래그먼트(#)로만 받습니다. 쿼리스트링(?)은 무시합니다.');
    return [];
  }

  // '#' 이 붙어 있으면 떼고 읽습니다. 테스트에서 '#' 없이 넘겨도 동작합니다.
  const params = new URLSearchParams(raw.startsWith('#') ? raw.slice(1) : raw);
  const applied = [];

  for (const key of PREFILL_KEYS) {
    const value = params.get(key);
    if (value == null) continue; // 파라미터 자체가 없음 → 기존 값 유지

    const limit = LIMITS[LIMIT_KEY[key] ?? key];
    const trimmed = String(value).trim().slice(0, limit ?? undefined);
    if (!trimmed) continue; // 공백만 들어온 경우 → 기존 값 유지

    m[key] = trimmed;
    applied.push(key);
  }

  return applied;
}

/**
 * 주소창에서 프래그먼트를 지웁니다.
 * 이걸 안 하면 사용자가 값을 고친 뒤 새로고침할 때 URL 값으로 되돌아갑니다.
 */
export function clearPrefillFromUrl() {
  try {
    history.replaceState(null, '', location.pathname);
  } catch {
    // iframe·file:// 등에서 막힐 수 있습니다. 프리필 자체는 이미 끝났으므로 무시합니다.
  }
}
