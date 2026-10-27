# 부동산 DM 생성기 (dm-app)

입력 폼을 채우면 **A4 DM**이 실시간으로 만들어지고, 브라우저 인쇄로 PDF 저장까지 하는 Vue 3 웹앱입니다. 고정 양식(기본)과 블록을 쌓아 구성하는 양식(가변형), 두 가지 템플릿을 제공합니다.

- 배포 주소: **https://dmapp.bdseasy.com** (커스텀 도메인 루트)
- 스택: Vue 3 + Vite (기존 컴포넌트는 Options API, 신규는 <script setup>)

## 개발

```bash
npm install
npm run dev
```

빌드 결과를 그대로 확인하려면:

```bash
npm run build && npm run preview
```

## 배포

`main` 에 푸시하는 것만으로는 배포되지 않습니다. **`deploy-` 로 시작하는 태그**를 밀어야 합니다.

```bash
git tag deploy-0.1.0 && git push origin deploy-0.1.0
```

Actions 탭에서 수동 실행(`Run workflow`)도 가능합니다. 워크플로는 `npm ci → npm run build → dist 업로드 → Pages 배포` 순으로 돌아갑니다.

### 배포 설정에서 건드리면 안 되는 것

| 항목 | 값 | 이유 |
| --- | --- | --- |
| `vite.config.js` 의 `base` | `'/'` | 커스텀 도메인 **루트** 배포입니다. `'/dm-app/'` 로 두면 자산 경로가 `/dm-app/assets/...` 가 되어 전부 404 가 납니다 |
| `public/CNAME` | `dmapp.bdseasy.com` | 빌드 시 `dist/CNAME` 로 복사됩니다. 빠지면 커스텀 도메인 연결이 끊깁니다 |
| 업로드 경로 | `./dist` | Vite 산출물 폴더 |

워크플로에 **산출물 점검** 단계가 있어서 위 세 가지가 깨지면 배포 전에 빌드가 실패합니다.

## 폴더 구조

```
index.html               Vite 진입점 (한글 폰트 로드 — 필수)
vite.config.js           base: '/' 고정 + 프로덕션 CSP 주입
public/
  CNAME                  커스텀 도메인 (dist 루트로 복사됨)
src/
  main.js                앱 부트스트랩
  App.vue
  components/dm/
    DmStudio.vue         컨테이너 — 템플릿 전환, 공통 사무소 정보, 툴바
    TemplateSelector.vue 템플릿 전환 탭
    officeModel.js       템플릿이 공유하는 사무소 정보
    queryPrefill.js      본 서비스에서 넘어온 사무소 정보 프리필 (#)

    DmGenerator.vue      [기본] 편집기 — 입력 폼 + 미리보기
    DmFrontPage.vue      [기본] 앞면 A4 (시세표·시장동향·CTA)
    DmBackPage.vue       [기본] 뒷면 A4 (정보 3종·이웃 사례)
    dmModel.js           [기본] sampleData() + 글자수 제한 LIMITS

    DmCustomEditor.vue   [가변형] 편집기 — 블록 추가·삭제·순서 이동
    DmCustomPage.vue     [가변형] A4 한 장 렌더러 (앞/뒤 공용)
    customModel.js       [가변형] 블록 정의 + 샘플 + 뒷면 프리셋
    dmCustom.css         [가변형] 페이지 스타일

    VField.vue           글자수 카운터 입력 필드 (공용)
    dmPages.css          A4·레이아웃 공용 스타일 + 인쇄(@page A4) 규칙
    README.md            컴포넌트 상세 문서
docs/
  querystring-prefill.md 본 서비스(bdseasy.com) 연동 사양
  security-review.md     연동 방식 보안 점검 결과
  route-request.md       개발팀 전달용 연동 요청문
```

## 템플릿

두 템플릿은 같은 디자인 언어(네이비 그라데이션 헤더 + 골드 보더, Noto Serif KR 제목, 골드 사각형 섹션 라벨)를 공유합니다. 색 변수와 공용 클래스(`.hdr` `.strip`)는 `dmPages.css` 한 곳에 있습니다.

템플릿은 2종이며 상단 툴바의 탭으로 전환합니다. **전환해도 공통 사무소 정보(상호·등록번호·대표명·연락처·주소·주소보정 안내)는 유지**됩니다. 본문 렌더러만 바뀝니다.

| 템플릿 | 키 | 구성 |
| --- | --- | --- |
| 기본 템플릿 | `legacy` | A4 **앞·뒤 2페이지 고정** 양식. 시세 기준표, 시장 동향, CTA, 정보 카드 3종 |
| 가변형 템플릿 | `custom-v2` | A4 **단면 기본**(뒷면 선택). 본문을 블록으로 쌓아 구성 |

### 가변형 템플릿의 블록

본문이 고정 칸이 아니라 블록 배열입니다. 블록마다 **▲ 위로 / ▼ 아래로 / 삭제** 버튼과 글자 크기(작게·보통·크게)·정렬·굵기 조절이 붙습니다.

| 블록 | 용도 |
| --- | --- |
| 본문 단락 | 인사말·안내문 같은 장문 텍스트 (줄바꿈 유지) |
| 강조 리스트 | 앞머리를 굵게 쓰는 항목 나열 |
| 매물 요약 박스 | 단지명·면적·거래형태·가격 (항목 추가·삭제 가능) |
| 시장 동향 박스 | 최근 실거래가 요약 |
| 서명 · 연락처 | 작성일자 + 서명 줄. **추가하면 공통 사무소 정보로 자동 채워집니다** |

그 밖에:

- **로고**: 헤더 좌측에 이미지 업로드로 교체합니다. 올린 이미지는 브라우저 안에서만 쓰이고 서버로 가지 않습니다
- **수신인 토글**: 표시 여부를 끄고 켤 수 있고, 문구는 자유 입력입니다
- **A4 초과 경고**: 본문이 1페이지를 넘기면 미리보기와 폼 양쪽에 경고가 뜹니다. 경고 띠는 인쇄물에는 나오지 않습니다
- **뒷면**: 기본은 단면입니다. "뒷면 추가"를 누르면 매물 요약 + 시장 동향 프리셋이 들어가고, 삭제하면 다시 단면이 됩니다

### 템플릿을 더 추가하려면

1. `customModel.js` 처럼 모델 파일을 만들고
2. 페이지 렌더러(`DmCustomPage.vue` 참고)와 편집기(`DmCustomEditor.vue` 참고)를 만든 뒤
3. `TemplateSelector.vue` 의 `templates` 배열과 `DmStudio.vue` 의 분기에 추가합니다

페이지 렌더러의 최상위는 `<div class="a4">` 여야 합니다. 인쇄 규칙(`dmPages.css`)이 이 클래스를 기준으로 걸려 있습니다.

## PDF / 인쇄

상단 **"PDF 저장 / 인쇄"** → `window.print()`. 인쇄 대화상자에서 "PDF로 저장"을 고르면 A4 컬러로 저장됩니다. (기본 템플릿 2페이지 / 가변형 템플릿 1~2페이지)

- 페이지 크기는 정확히 `794 × 1123px` (96dpi 기준 210 × 297mm)
- 인쇄 시 폼·툴바는 자동으로 숨겨집니다
- 네이비/골드 배경은 **인쇄 대화상자의 "배경 그래픽" 옵션과 무관하게** 출력됩니다 (`print-color-adjust: exact`)

## 입력값 보관 정책

입력값은 **그 탭(세션) 안에서만** 보관됩니다. 서버로 전송되지 않고, 브라우저를 벗어나지 않습니다.

| 상황 | 동작 |
| --- | --- |
| 다시 들어옴 (새 탭) | **처음부터 입력** — 샘플 데이터로 시작 |
| 같은 탭에서 새로고침 | 입력값 복원 — 실수로 날아가지 않도록 |
| 탭을 닫음 | 입력값 삭제 |

`sessionStorage('dm_model')` 를 쓰기 때문입니다. 사무실 공용 PC 에 사무소 정보나 고객 정보가
기한 없이 남지 않습니다. 구버전이 `localStorage` 에 남긴 값은 앱이 로드될 때 자동으로 지웁니다.

서버 저장으로 바꾸려면 `DmGenerator.vue` 의 `mounted()` 로드 로직과 `watch.m` 저장 로직을
API 호출로 교체하세요.

**이 저장소는 공개(public) 입니다.** `dmModel.js` 의 `sampleData()` 는 전부 가상의 예시값(`예시부동산`, `홍길동`, `02-0000-0000`, `OO아파트` 등)이며, 실제 사무소 정보나 실거래가가 아닙니다. 실제 고객·사무소 정보를 `sampleData()` 에 넣어 커밋하지 마세요.

## 본 서비스 연동 (프래그먼트 프리필)

본 서비스 `bdseasy.com` 의 **마케팅 > DM 템플릿** 메뉴가 이 앱을 새 탭으로 열 때, 로그인한 중개사의
사무소 정보를 URL 로 넘겨줍니다. 앱은 그 값으로 입력 폼 6칸을 미리 채웁니다. 중개사가 DM 만들 때마다
사무소 정보를 다시 입력하지 않게 하는 것이 목적입니다.

```
https://dmapp.bdseasy.com/#bizName=...&regNo=...&repName=...&phone1=...&phone2=...&address=...
```

**값은 `?` 쿼리스트링이 아니라 `#` 프래그먼트로 받습니다.** `?` 뒤의 값은 HTTP 요청라인의 일부라서
페이지를 받아오는 첫 요청에 실려 나가고, 이 앱은 GitHub Pages(앞단 Fastly CDN)에 올라가 있어
개인 휴대전화번호가 양쪽 접근 로그에 남을 수 있습니다. `#` 뒤는 브라우저가 서버로 보내지 않습니다.
`?` 로 온 값은 **의도적으로 무시**하고 콘솔에 경고를 남깁니다. 배경은
[docs/security-review.md](docs/security-review.md) 참고.

| 파라미터 | 모델 키 | 글자수 제한 |
| --- | --- | --- |
| `bizName` | `m.bizName` | `LIMITS.bizName` (20) |
| `regNo` | `m.regNo` | `LIMITS.regNo` (22) |
| `repName` | `m.repName` | `LIMITS.repName` (10) |
| `phone1` | `m.phone1` | `LIMITS.phone` (20) |
| `phone2` | `m.phone2` | `LIMITS.phone` (20) |
| `address` | `m.address` | `LIMITS.address` (44) |

구현은 `src/components/dm/queryPrefill.js` 에 있고 `DmGenerator.vue` 의 `mounted()` 에서 호출합니다.

- 적용 순서: `sampleData()` → 같은 탭 세션 복원 → **프래그먼트 덮어쓰기** (URL 값이 저장값보다 우선)
- 값이 빈 파라미터는 아예 오지 않으므로 **6개 중 일부만** 올 수 있습니다. 안 온 칸은 기존 값을 유지합니다
- URL 값은 신뢰하지 않는 외부 입력으로 다룹니다 — `trim()` 후 `LIMITS` 제한으로 자르고, 위 6개 외의 파라미터는 무시합니다
- 적용 후 `history.replaceState` 로 주소창의 프래그먼트를 지웁니다. 안 지우면 사용자가 값을 고친 뒤 새로고침할 때 URL 값으로 되돌아갑니다
- `bizType`, `issue`, `repTitle`, 프로필 사진은 전달되지 않습니다 — 기존 기본값/저장값을 유지합니다
- ⚠️ 허용 목록에 `addrNote`·`closing` 은 **절대 추가하지 마세요.** 이 두 필드만 `v-html` 로 출력됩니다

현재 본 서비스에서 값을 넘기는 작업은 진행되지 않았고, 앱은 **독립적으로 운영** 중입니다.
파라미터 없이 열리면 샘플 데이터로 시작합니다.

사양 전문은 [docs/querystring-prefill.md](docs/querystring-prefill.md) 에 있습니다.

## 보안

- **CSP·Referrer-Policy**: 프로덕션 빌드에 `default-src 'none'` 기반 CSP 와 `strict-origin-when-cross-origin` referrer 정책을 `meta` 태그로 주입합니다 (`vite.config.js` 의 `injectCsp`). dev 서버는 HMR 때문에 제외됩니다.
- **한계**: GitHub Pages 는 정적 호스팅이라 응답 헤더를 설정할 수 없습니다. iframe 삽입 차단(`frame-ancestors`)은 `meta` 로 적용되지 않으므로, 필요하면 헤더를 설정할 수 있는 호스팅으로 옮겨야 합니다.
- 점검 결과 전문: [docs/security-review.md](docs/security-review.md)

## 광고 표시 관련 주의

중개대상물 정보를 담은 DM은 「표시·광고의 공정화에 관한 법률」과 중개대상물 표시·광고 규정의 적용을 받습니다. 중개사무소 명칭·개설등록번호·소재지 등 의무 표기 사항과 허위·과장 표현 여부를 발송 전에 반드시 확인하세요.
