# dmapp.bdseasy.com — 프리필 구현 지침

부동산이지(bdseasy.com) 본 서비스의 헤더 메뉴 **마케팅 > DM 템플릿**이 새 탭으로 `https://dmapp.bdseasy.com`을 엽니다.
이때 로그인한 사용자의 사무소 정보를 URL로 함께 넘깁니다.
dmapp은 이 값을 읽어 DM 생성기 입력 폼의 해당 필드에 **초기값으로 채워** 줍니다.

> ### 변경 안내 — 쿼리스트링(`?`) → 프래그먼트(`#`)
>
> 최초 사양은 `?` 쿼리스트링이었으나 **`#` 프래그먼트로 변경**되었습니다.
> `?` 뒤의 값은 HTTP 요청라인의 일부라서 페이지를 받아오는 첫 요청에 그대로 실려 나갑니다.
> dmapp은 GitHub Pages(앞단 Fastly CDN)에 올라가 있어, 개인 휴대전화번호가 양쪽 접근 로그에
> 남을 수 있었습니다. `#` 뒤의 프래그먼트는 브라우저가 서버로 보내지 않으므로 값이 단말을 벗어나지 않습니다.
> 배경은 [security-review.md](./security-review.md) 참고.
>
> **받는 쪽(dmapp)은 구현 완료**입니다. 보내는 쪽에서 `?` 대신 `#`로 조립해 주세요.
> dmapp은 `?` 로 온 값을 **의도적으로 무시**합니다.

> ### 현재 운영 상태
>
> 본 서비스에서 값을 넘기는 작업은 아직 진행되지 않았고, dmapp은 **독립적으로 운영** 중입니다.
> 파라미터 없이 열리면 샘플 데이터로 시작하므로, 보내는 쪽 작업 전에도 앱은 정상 동작합니다.

## 1. 전달 URL 형식

```
https://dmapp.bdseasy.com/#bizName=...&regNo=...&repName=...&phone1=...&phone2=...&address=...
```

- 모든 값은 `URLSearchParams`로 인코딩합니다 (UTF-8, 공백은 `+`). 받는 쪽은 `new URLSearchParams(location.hash.slice(1))`로 읽어 자동 디코딩합니다.
- 값이 비어 있는 파라미터는 **아예 포함하지 않습니다.** 6개 중 일부만 올 수 있습니다.
- 본 서비스에서 계정 정보를 아직 못 불러온 경우 파라미터 없이 `https://dmapp.bdseasy.com` 으로만 엽니다. 이 경우 기존 동작(샘플 데이터 또는 같은 탭 세션 복원)을 그대로 유지합니다.
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
| `bizName` | 상호(브랜드) | `m.bizName` | `LIMITS.bizName` (20) |
| `regNo` | 개설등록번호 | `m.regNo` | `LIMITS.regNo` (22) |
| `repName` | 대표명 | `m.repName` | `LIMITS.repName` (10) |
| `phone1` | 사무소 전화 | `m.phone1` | `LIMITS.phone` (20) |
| `phone2` | 대표(개인) 휴대전화 | `m.phone2` | `LIMITS.phone` (20) |
| `address` | 사무소 주소 (기본주소 + 상세주소를 공백으로 합친 값) | `m.address` | `LIMITS.address` (44) |

파라미터 이름은 DM 모델 키와 동일하게 맞춰 두었으므로, 키 이름 그대로 대입하면 됩니다.
`bizType`(상호 접미사), `issue`(발행 호수), `repTitle`(대표 직함), 프로필 사진은 **전달되지 않습니다.** 기존 기본값/저장값을 유지합니다.

`phone2`는 6개 중 유일한 개인정보입니다. 나머지 5개는 중개대상물 광고에 의무 표기하는 공개 정보입니다.
전달이 꼭 필요하지 않다면 빼는 쪽을 권합니다 — 빼면 넘기는 값이 전부 공개 정보가 됩니다.

## 3. 적용 규칙 (받는 쪽 — 구현 완료)

1. **페이지 로드 직후 한 번만** 읽습니다. (`DmGenerator.vue` 의 `mounted`)
2. 적용 순서: `sampleData()` → **같은 탭 세션 복원** → **프래그먼트 값 덮어쓰기**.
   사용자가 본 서비스에서 방금 클릭해 들어온 것이므로, 위 6개 필드에 한해서는 URL 값이 저장값보다 우선합니다. 나머지 필드는 건드리지 않습니다.
3. 값은 **신뢰하지 않는 외부 입력**으로 다룹니다.
   - 문자열로만 사용하고 `innerHTML`에 넣지 않습니다 (Vue 템플릿 보간 `{{ }}`이면 자동 이스케이프).
   - 각 필드의 `LIMITS` 글자수 제한을 초과하면 잘라서 넣습니다.
   - 앞뒤 공백은 `trim()` 합니다.
   - **허용 목록 6개 외의 파라미터는 무시합니다.** 특히 `addrNote`·`closing` 은 `v-html` 로 출력되는 유일한 필드이므로 **절대 허용 목록에 추가하지 마세요.**
4. 적용이 끝나면 **주소창에서 프래그먼트를 제거**합니다. 새로고침 시 사용자가 수정한 값이 다시 덮어써지는 것을 막기 위함입니다.

```js
history.replaceState(null, '', location.pathname);
```

5. 프래그먼트를 적용한 뒤에는 기존 `watch`(m → 세션 저장) 로직이 자연스럽게 저장하도록 둡니다. 별도 저장 코드는 필요 없습니다.

## 4. 구현 (dmapp 쪽)

`src/components/dm/queryPrefill.js` 에 있습니다.

```js
const PREFILL_KEYS = ['bizName', 'regNo', 'repName', 'phone1', 'phone2', 'address'];
const LIMIT_KEY = { phone1: 'phone', phone2: 'phone' }; // 나머지는 키 이름 그대로

export function applyQueryPrefill(m, fragment) {
  const raw = fragment ?? location.hash;
  if (raw.startsWith('?')) return [];           // 쿼리스트링은 받지 않습니다
  const params = new URLSearchParams(raw.startsWith('#') ? raw.slice(1) : raw);
  const applied = [];
  for (const key of PREFILL_KEYS) {
    const value = params.get(key);
    if (value == null) continue;
    const limit = LIMITS[LIMIT_KEY[key] ?? key];
    const trimmed = String(value).trim().slice(0, limit ?? undefined);
    if (trimmed) { m[key] = trimmed; applied.push(key); }
  }
  return applied;
}
```

호출 지점 (`DmGenerator.vue` 의 `mounted`):

```js
try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}   // 구버전 잔류 데이터 정리
try { const s = sessionStorage.getItem(STORAGE_KEY); if (s) this.m = Object.assign(sampleData(), JSON.parse(s)); } catch (e) {}
if (applyQueryPrefill(this.m).length) clearPrefillFromUrl();
```

## 5. 입력값 보관 정책

입력값은 **그 탭(세션) 안에서만** 보관됩니다. 서버로 전송되지 않습니다.

| 상황 | 동작 |
|---|---|
| 메뉴를 눌러 새 탭으로 들어옴 | **처음부터 입력** (샘플 데이터로 시작) |
| 같은 탭에서 새로고침 | 입력값 복원 (실수로 날아가지 않도록) |
| 탭을 닫음 | 입력값 삭제 |

`sessionStorage` 를 쓰므로 공용 PC 에 사무소 정보나 고객 정보가 기한 없이 남지 않습니다.
구버전이 `localStorage` 에 남긴 값은 앱 로드 시 자동으로 지웁니다.

## 6. 확인 방법

아래 URL을 직접 열어 6개 필드가 채워지고, 주소창에서 프래그먼트가 사라지는지 확인하세요.

```
https://dmapp.bdseasy.com/#bizName=%EC%98%88%EC%8B%9C%EB%B6%80%EB%8F%99%EC%82%B0&regNo=11110-2024-00001&repName=%ED%99%8D%EA%B8%B8%EB%8F%99&phone1=02-1234-5678&phone2=010-1234-5678&address=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C+%EC%A2%85%EB%A1%9C%EA%B5%AC+%EC%84%B8%EC%A2%85%EB%8C%80%EB%A1%9C+1
```

추가 확인:

- 파라미터 없이 열었을 때 샘플 데이터로 시작하는가
- `bizName`만 있는 등 일부 파라미터만 있을 때 나머지 필드가 유지되는가
- 적용 후 새로고침해도 사용자가 수정한 값이 되돌아가지 않는가
- **새 탭으로 열면 처음부터 입력하게 되는가**
- `?` 를 `#` 대신 썼을 때 값이 무시되는가 (콘솔에 경고가 남습니다)

## 7. 보내는 쪽 작업 시 주의

- 이동 목적지는 **코드에 고정**하세요. URL 파라미터로 받으면 오픈 리다이렉트가 됩니다.
- `target="_blank"` 링크에 `rel="noopener"` 를 붙이세요. 최신 브라우저는 기본 적용하지만 명시하는 편이 안전합니다.
- 계정 정보 조회가 비동기이므로 `await` 뒤에 `window.open` 을 부르면 팝업 차단에 걸립니다. 링크의 `href` 를 미리 계산해 두거나 경유 페이지를 쓰세요.
