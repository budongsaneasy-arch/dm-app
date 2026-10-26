# 부동산 DM 생성기 · Vue 3 컴포넌트

웹사이트에서 **데이터 입력 → A4 앞·뒤 DM 자동 생성 → PDF 저장/인쇄**까지 처리하는 Vue 3 컴포넌트입니다.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `DmGenerator.vue` | **메인 컴포넌트** — 입력 폼 + 라이브 미리보기 + 인쇄 버튼 |
| `DmFrontPage.vue` | DM 앞면 (A4) — 사무소정보·인사말·시세표·시장동향·CTA |
| `DmBackPage.vue` | DM 뒷면 (A4) — 정보 3종·이웃 사례·연락처 |
| `VField.vue` | 글자수 카운터가 있는 재사용 입력 필드 |
| `dmModel.js` | 기본 데이터(`sampleData`) + **항목별 글자수 제한(`LIMITS`)** |
| `dmPages.css` | 앞·뒤 페이지 공용 스타일 + 인쇄(@page A4) 규칙 |

## 설치

Vite / Vue CLI 프로젝트의 `src/components/dm/` 등에 위 파일을 모두 복사한 뒤:

```vue
<template>
  <DmGenerator />
</template>

<script>
import DmGenerator from '@/components/dm/DmGenerator.vue';
export default { components: { DmGenerator } };
</script>
```

### 폰트 (필수)

`index.html` `<head>` 에 한글 폰트를 로드하세요. (고딕 + 명조 혼용)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Noto+Serif+KR:wght@500;600;700&display=swap" rel="stylesheet">
```

## PDF / 인쇄

상단 **"PDF 저장 / 인쇄"** 버튼 → `window.print()` 호출. 인쇄 대화상자에서
**"PDF로 저장(Save as PDF)"** 을 고르면 정확한 **A4 컬러 2페이지** 파일이 생성됩니다.

- 페이지는 정확히 `794 × 1123px` (96dpi 기준 210 × 297mm)
- `@page { size: A4; margin: 0 }` + 페이지별 `page-break` 적용
- 인쇄 시 폼·툴바는 자동으로 숨겨지고 DM 두 장만 출력됩니다
- 인쇄 대화상자에서 **"배경 그래픽(Background graphics)"** 옵션을 켜야 네이비/골드 배경이 인쇄됩니다

### 서버에서 PDF 파일로 자동 생성하려면 (선택)

브라우저 인쇄 대신 서버에서 PDF 파일을 떨어뜨리려면 Puppeteer 사용을 권장합니다:

```js
// Node.js (puppeteer)
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(dmUrl, { waitUntil: 'networkidle0' });
await page.pdf({ path: 'dm.pdf', format: 'A4', printBackground: true });
await browser.close();
```

## 데이터 연동

`DmGenerator.vue` 는 내부 `data().m` 으로 모델을 관리하며 `localStorage('dm_model')` 에
자동 임시저장합니다. 서버 저장/불러오기로 바꾸려면 `mounted()` 의 로드 로직과
`watch.m` 의 저장 로직을 API 호출로 교체하세요.

각 페이지(`DmFrontPage` / `DmBackPage`)는 `:m` prop 만 받는 **표시 전용** 컴포넌트라,
폼 없이 미리보기·인쇄만 띄우는 화면에도 그대로 재사용할 수 있습니다.

```vue
<DmFrontPage :m="model" />
<DmBackPage :m="model" />
```

## 글자수 제한

`dmModel.js` 의 `LIMITS` 객체에 항목별 권장 글자수가 정의돼 있고,
폼의 모든 입력칸에 `maxlength` 와 카운터로 적용됩니다. 값만 바꾸면 전체에 반영됩니다.
