# dmapp.bdseasy.com — 쿼리스트링 프리필 구현 지침

부동산이지(bdseasy.com) 본 서비스의 헤더 메뉴 **마케팅 > DM 템플릿**이 새 탭으로 `https://dmapp.bdseasy.com`을 엽니다.
이때 로그인한 사용자의 사무소 정보를 URL 쿼리스트링으로 함께 넘깁니다.
dmapp은 이 값을 읽어 DM 생성기 입력 폼의 해당 필드에 **초기값으로 채워** 주세요.

## 1. 전달 URL 형식

```
https://dmapp.bdseasy.com/?bizName=...&regNo=...&repName=...&phone1=...&phone2=...&address=...
```

- 모든 값은 `URLSearchParams`로 인코딩되어 있습니다 (UTF-8, 공백은 `+`). 브라우저 표준 `new URLSearchParams(location.search)`로 읽으면 자동 디코딩됩니다.
- 값이 비어 있는 파라미터는 **아예 포함되지 않습니다.** 6개 중 일부만 올 수 있습니다.
- 본 서비스에서 계정 정보를 아직 못 불러온 경우 파라미터 없이 `https://dmapp.bdseasy.com` 으로만 열립니다. 이 경우 기존 동작(샘플 데이터 또는 localStorage 복원)을 그대로 유지하세요.
- 예시(디코딩 후):

```
bizName = 예시부동산
regNo   = 11110-2024-00001
repName = 홍길동
phone1  = 02-1234-5678
phone2  = 010-1234-5678
address = 서울특별시 종로구 세종대로 1 101호
```

## 2. 파라미터 → 폼 필드 매핑

| 파라미터 | 의미 | DM 모델 키 (`dmModel.js` 기준) | 글자수 제한 키 |
|---|---|---|---|
| `bizName` | 상호(브랜드) | `m.bizName` | `LIMITS.bizName` |
| `regNo` | 개설등록번호 | `m.regNo` | `LIMITS.regNo` |
| `repName` | 대표명 | `m.repName` | `LIMITS.repName` |
| `phone1` | 사무소 전화 | `m.phone1` | `LIMITS.phone` |
| `phone2` | 대표(개인) 휴대전화 | `m.phone2` | `LIMITS.phone` |
| `address` | 사무소 주소 (기본주소 + 상세주소를 공백으로 합친 값) | `m.address` | `LIMITS.address` |

파라미터 이름은 DM 모델 키와 동일하게 맞춰 두었으므로, 키 이름 그대로 대입하면 됩니다.
`bizType`(상호 접미사), `issue`(발행 호수), `repTitle`(대표 직함), 프로필 사진은 **전달되지 않습니다.** 기존 기본값/저장값을 유지하세요.

## 3. 적용 규칙

1. **페이지 로드 직후 한 번만** 읽습니다. (Vue라면 `mounted`, 일반 JS면 `DOMContentLoaded`.)
2. 적용 순서: `sampleData()` → localStorage 저장값 복원 → **쿼리스트링 값 덮어쓰기**.
   사용자가 본 서비스에서 방금 클릭해 들어온 것이므로, 위 6개 필드에 한해서는 쿼리스트링 값이 localStorage 저장값보다 우선합니다. 나머지 필드는 건드리지 않습니다.
3. 값은 **신뢰하지 않는 외부 입력**으로 다룹니다.
   - 문자열로만 사용하고 `innerHTML`에 넣지 않습니다 (Vue 템플릿 보간 `{{ }}`이면 자동 이스케이프).
   - 각 필드의 `LIMITS` 글자수 제한을 초과하면 잘라서 넣습니다.
   - 앞뒤 공백은 `trim()` 합니다.
4. 적용이 끝나면 **주소창에서 쿼리스트링을 제거**합니다. 새로고침 시 사용자가 수정한 값이 다시 덮어써지는 것을 막기 위함입니다.

```js
history.replaceState(null, '', location.pathname);
```

5. 쿼리스트링을 적용한 뒤에는 기존 `watch`(m → localStorage 저장) 로직이 자연스럽게 저장하도록 둡니다. 별도 저장 코드는 필요 없습니다.

## 4. 참고 구현 (Vue, `mounted` 기준)

```js
const PREFILL_KEYS = ['bizName', 'regNo', 'repName', 'phone1', 'phone2', 'address'];
const LIMIT_KEY = { phone1: 'phone', phone2: 'phone' }; // 나머지는 키 이름 그대로

function applyQueryPrefill(m) {
  const params = new URLSearchParams(location.search);
  let applied = false;
  for (const key of PREFILL_KEYS) {
    const raw = params.get(key);
    if (raw == null) continue;
    const limit = LIMITS[LIMIT_KEY[key] ?? key];
    const value = raw.trim().slice(0, limit ?? raw.length);
    if (value) { m[key] = value; applied = true; }
  }
  if (applied) history.replaceState(null, '', location.pathname);
}
```

```js
// mounted()
try { const s = localStorage.getItem(STORAGE_KEY); if (s) this.m = Object.assign(sampleData(), JSON.parse(s)); } catch (e) {}
applyQueryPrefill(this.m); // ← localStorage 복원 다음, 그 외 초기화 전에
```

## 5. 확인 방법

아래 URL을 직접 열어 6개 필드가 채워지고, 주소창에서 쿼리가 사라지는지 확인하세요.

```
https://dmapp.bdseasy.com/?bizName=%ED%85%8C%EC%8A%A4%ED%8A%B8%EB%B6%80%EB%8F%99%EC%82%B0&regNo=11110-2024-00001&repName=%ED%99%8D%EA%B8%B8%EB%8F%99&phone1=02-1234-5678&phone2=010-1234-5678&address=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C+%EC%A2%85%EB%A1%9C%EA%B5%AC+%EC%84%B8%EC%A2%85%EB%8C%80%EB%A1%9C+1
```

추가 확인:
- 파라미터 없이 열었을 때 기존 동작과 동일한가
- `bizName`만 있는 등 일부 파라미터만 있을 때 나머지 필드가 유지되는가
- 적용 후 새로고침해도 사용자가 수정한 값이 되돌아가지 않는가
