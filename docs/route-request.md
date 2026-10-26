# [요청] 마케팅 > DM 템플릿 메뉴를 DM 생성기로 연결

- 요청일: 2026-10-26
- 대상 저장소: `budongsanEASY_Front` (본 서비스)
- 연계 저장소: [`budongsaneasy-arch/dm-app`](https://github.com/budongsaneasy-arch/dm-app) — 받는 쪽은 **구현 완료·배포 완료**
- 배포 주소: https://dmapp.bdseasy.com

## 요청 한 줄 요약

헤더 메뉴 **마케팅 > DM 템플릿**이 지금은 내부 프로토타입 페이지를 엽니다.
이것을 **`https://dmapp.bdseasy.com` 을 새 탭으로 열도록** 바꾸고, 로그인한 중개사의
사무소 정보 6개를 **`#` 프래그먼트**로 함께 넘겨 주세요.

## 1. 현재 상태 (확인 완료)

| 위치 | 현재 | 조치 |
| --- | --- | --- |
| `src/layouts/default-layout/config/MainMenuConfig.ts` | `마케팅 > DM 템플릿`, `route: '/dm-template'`, `target: '_blank'` | **수정 불필요** — 새 탭 열기까지 이미 되어 있습니다 |
| `src/router/index.ts` | `/dm-template` → `@/views/marketing/DmTemplateProto.vue` | **변경 필요** |
| `src/views/marketing/DmTemplateProto.vue` | 내부 프로토타입 렌더링 | 정리 여부 판단 필요 |
| `src/components/dm-template-proto/` (8개 파일) | DM 생성기 프로토타입 | 외부 앱으로 이관됨. 정리 여부 판단 필요 |

> 라우트 이름 `dm-template-proto` 는 `src/components/custom/chatbot/ChatbotWidget.vue:199` 에서
> 챗봇 숨김 조건으로 참조합니다. 이름을 바꾸시면 그쪽도 함께 고쳐 주세요.

## 2. 전달 규약

```
https://dmapp.bdseasy.com/#bizName=...&regNo=...&repName=...&phone1=...&phone2=...&address=...
```

### ⚠️ 반드시 `?` 가 아니라 `#` 입니다

`?` 쿼리스트링은 **HTTP 요청라인의 일부**라서 페이지를 받아오는 첫 요청에 그대로 실려 나갑니다.
dmapp 은 GitHub Pages(앞단 Fastly CDN)에 올라가 있어, **개인 휴대전화번호가 양쪽 접근 로그에
남을 수 있습니다.** `#` 뒤의 프래그먼트는 브라우저가 서버로 보내지 않습니다.

dmapp 은 `?` 로 온 값을 **의도적으로 무시**하고 콘솔에 경고를 남깁니다. 배경은
[docs/security-review.md](./security-review.md) 참고.

### 파라미터 매핑

본 서비스의 기존 `src/components/dm-template-proto/DmGenerator.vue` 의 `mounted()` 에
이미 같은 매핑이 있습니다. 그대로 쓰시면 됩니다.

```js
await mypageStore.searchAccountData();
const { company, jurirno, ceo, phone, addrDefault, addrDetail } = accountData.memberOffice;
const { phone: personalPhone } = accountData;
```

| 파라미터 | 출처 | 글자수 제한 |
| --- | --- | --- |
| `bizName` | `memberOffice.company` | 20 |
| `regNo` | `memberOffice.jurirno` | 22 |
| `repName` | `memberOffice.ceo` | 10 |
| `phone1` | `memberOffice.phone` (사무소) | 20 |
| `phone2` | `accountData.phone` (개인 휴대) | 20 |
| `address` | `addrDefault` + `' '` + `addrDetail` | 44 |

- 값이 **빈 항목은 파라미터에 넣지 마세요.** dmapp 이 해당 칸의 기존 값을 유지합니다.
- 전부 비었으면 파라미터 없이 `https://dmapp.bdseasy.com` 으로만 여셔도 됩니다. 샘플 데이터로 시작합니다.
- 인코딩은 `URLSearchParams` 표준(UTF-8, 공백은 `+`)을 씁니다.
- 글자수 제한은 받는 쪽에서도 한 번 더 자르므로 보내는 쪽은 참고만 하셔도 됩니다.

### `phone2` 는 한 번 검토해 주세요

6개 중 **`phone2`(대표 개인 휴대전화)만 개인정보**입니다. 나머지 5개는 중개대상물 광고에
의무 표기하는 공개 정보입니다. 꼭 필요하지 않다면 빼는 쪽을 권합니다 — 빼면 넘기는 값이
전부 공개 정보가 됩니다.

## 3. 구현 시 주의 4가지

1. **이동 목적지는 코드에 고정하세요.** URL 파라미터로 받으면 오픈 리다이렉트가 됩니다.
2. **`target="_blank"` 링크에 `rel="noopener"` 를 붙이세요.** 최신 브라우저는 기본 적용하지만 명시하는 편이 안전합니다.
3. **`await` 뒤에 `window.open()` 을 부르지 마세요.** 계정 정보 조회가 비동기라 사용자 제스처와 끊겨 팝업 차단에 걸립니다.
4. **허용 목록에 `addrNote` · `closing` 을 추가하지 마세요.** dmapp 에서 이 두 필드만 `v-html` 로 출력됩니다.

### 3번 때문에 생기는 구조적 제약

메뉴는 `<router-link :to>` 로 렌더링되는데 `router-link` 는 외부 절대주소를 처리하지 못하고,
넘길 사무소 정보는 비동기 API 조회가 필요해 정적 설정값으로 만들 수 없습니다.

**권장: 경유 페이지 방식.** `/dm-template` 을 그대로 두되 렌더링 대상만 바꿔서,
그 페이지가 마운트될 때 계정 정보를 조회하고 `location.replace()` 로 dmapp 으로 넘깁니다.

```
메뉴 클릭 → 새 탭에서 /dm-template 열림 → 계정 정보 조회
         → dmapp.bdseasy.com/#bizName=... 으로 location.replace
```

- 전사 공용 헤더 컴포넌트(`MenuPages.vue`)를 건드리지 않습니다 — 모든 페이지의 메뉴를 그리는 파일이라 리스크가 큽니다
- 새 탭은 실제 링크 클릭으로 열리므로 팝업 차단에 걸리지 않습니다
- `location.replace` 라서 뒤로 가기 했을 때 경유 페이지로 돌아오지 않습니다

`MenuPages.vue` 를 고쳐 외부 URL 을 직접 여는 방식도 가능하지만, 비동기 조회 문제는
그대로 남습니다. 판단은 맡기겠습니다.

## 4. 확인 방법

아래 URL 을 직접 열어 6개 필드가 채워지고 주소창에서 프래그먼트가 사라지는지 확인하세요.

```
https://dmapp.bdseasy.com/#bizName=%EC%98%88%EC%8B%9C%EB%B6%80%EB%8F%99%EC%82%B0&regNo=11110-2024-00001&repName=%ED%99%8D%EA%B8%B8%EB%8F%99&phone1=02-1234-5678&phone2=010-1234-5678&address=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C+%EC%A2%85%EB%A1%9C%EA%B5%AC+%EC%84%B8%EC%A2%85%EB%8C%80%EB%A1%9C+1
```

연동 후 확인할 것:

- [ ] 로그인 상태에서 메뉴를 누르면 새 탭에 사무소 정보 6개가 채워져 열리는가
- [ ] 일부 항목이 비어 있어도 나머지가 정상으로 채워지는가
- [ ] 주소창에서 `#` 뒤가 사라지는가
- [ ] 값을 고친 뒤 새로고침해도 고친 값이 유지되는가
- [ ] 로그인하지 않았거나 계정 정보 조회에 실패해도 앱이 정상으로 열리는가 (샘플 데이터로 시작)

## 5. 참고 — dmapp 쪽 현황

- 받는 쪽 구현: `src/components/dm/queryPrefill.js` (구현·배포 완료)
- 입력값은 **그 탭(세션) 안에서만** 보관됩니다. 새 탭으로 들어오면 처음부터 입력하고, 탭을 닫으면 사라집니다. 서버로 전송되지 않습니다.
- 템플릿 2종(고정 양식 / 블록 가변형)을 제공하며, 공통 사무소 정보는 템플릿을 바꿔도 유지됩니다.
- 전체 사양: [docs/querystring-prefill.md](./querystring-prefill.md)
- 보안 점검 결과: [docs/security-review.md](./security-review.md)

## 문의

연동 중 사양이나 받는 쪽 동작에 확인할 점이 생기면 알려 주세요. dmapp 쪽은 바로 수정 가능합니다.
