# 부동산 DM 생성기 (dm-app)

입력 폼에 사무소 정보·시세·시장동향을 채우면 **A4 앞·뒤 2페이지 DM**이 실시간으로 만들어지고, 브라우저 인쇄로 PDF 저장까지 하는 Vue 3 웹앱입니다.

- 배포 주소: **https://dmapp.bdseasy.com** (커스텀 도메인 루트)
- 스택: Vue 3 (Options API) + Vite

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
vite.config.js           base: '/' 고정
public/
  CNAME                  커스텀 도메인 (dist 루트로 복사됨)
src/
  main.js                앱 부트스트랩
  App.vue
  components/dm/
    DmGenerator.vue      메인 — 입력 폼 + 라이브 미리보기 + 인쇄 버튼
    DmFrontPage.vue      앞면 A4 (사무소정보·인사말·시세표·시장동향·CTA)
    DmBackPage.vue       뒷면 A4 (정보 3종·이웃 사례·연락처)
    VField.vue           글자수 카운터 입력 필드
    dmModel.js           sampleData() + 항목별 글자수 제한 LIMITS
    queryPrefill.js      본 서비스에서 넘어온 사무소 정보 프리필
    dmPages.css          앞·뒤 공용 스타일 + 인쇄(@page A4) 규칙
    README.md            컴포넌트 상세 문서
docs/
  querystring-prefill.md 본 서비스(bdseasy.com) 연동 사양
  security-review.md     연동 방식 보안 점검 결과
```

## PDF / 인쇄

상단 **"PDF 저장 / 인쇄"** → `window.print()`. 인쇄 대화상자에서 "PDF로 저장"을 고르면 A4 컬러 2페이지가 나옵니다.

- 페이지 크기는 정확히 `794 × 1123px` (96dpi 기준 210 × 297mm)
- 인쇄 시 폼·툴바는 자동으로 숨겨집니다
- **"배경 그래픽(Background graphics)" 옵션을 켜야** 네이비/골드 배경이 인쇄됩니다

## 데이터 저장

입력값은 `localStorage('dm_model')` 에 자동 임시저장됩니다. 서버 저장으로 바꾸려면 `DmGenerator.vue` 의 `mounted()` 로드 로직과 `watch.m` 저장 로직을 API 호출로 교체하세요.

**이 저장소는 공개(public) 입니다.** `dmModel.js` 의 `sampleData()` 는 전부 가상의 예시값(`예시부동산`, `홍길동`, `02-0000-0000`, `OO아파트` 등)이며, 실제 사무소 정보나 실거래가가 아닙니다. 실제 고객·사무소 정보를 `sampleData()` 에 넣어 커밋하지 마세요.

## 본 서비스 연동 (쿼리스트링 프리필)

본 서비스 `bdseasy.com` 의 **마케팅 > DM 템플릿** 메뉴가 이 앱을 새 탭으로 열 때, 로그인한 중개사의 사무소 정보를 URL 로 넘겨줍니다. 앱은 그 값으로 입력 폼 6칸을 미리 채웁니다. 중개사가 DM 만들 때마다 사무소 정보를 다시 입력하지 않게 하는 것이 목적입니다.

```
https://dmapp.bdseasy.com/?bizName=...&regNo=...&repName=...&phone1=...&phone2=...&address=...
```

| 파라미터 | 모델 키 | 글자수 제한 |
| --- | --- | --- |
| `bizName` | `m.bizName` | `LIMITS.bizName` (20) |
| `regNo` | `m.regNo` | `LIMITS.regNo` (22) |
| `repName` | `m.repName` | `LIMITS.repName` (10) |
| `phone1` | `m.phone1` | `LIMITS.phone` (20) |
| `phone2` | `m.phone2` | `LIMITS.phone` (20) |
| `address` | `m.address` | `LIMITS.address` (44) |

구현은 `src/components/dm/queryPrefill.js` 에 있고 `DmGenerator.vue` 의 `mounted()` 에서 호출합니다.

- 적용 순서: `sampleData()` → localStorage 복원 → **쿼리스트링 덮어쓰기** (URL 값이 저장값보다 우선)
- 값이 빈 파라미터는 아예 오지 않으므로 **6개 중 일부만** 올 수 있습니다. 안 온 칸은 기존 값을 유지합니다
- URL 값은 신뢰하지 않는 외부 입력으로 다룹니다 — `trim()` 후 `LIMITS` 제한으로 자르고, 위 6개 외의 파라미터는 무시합니다
- 적용 후 `history.replaceState` 로 주소창의 쿼리를 지웁니다. 안 지우면 사용자가 값을 고친 뒤 새로고침할 때 URL 값으로 되돌아갑니다
- `bizType`, `issue`, `repTitle`, 프로필 사진은 전달되지 않습니다 — 기존 기본값/저장값을 유지합니다

사양 전문은 `docs/querystring-prefill.md` 에 있습니다.

> **보안 검토 사항**: 현재 `?` 쿼리스트링 방식은 개인 휴대전화번호가 요청 URL 에 담겨 GitHub·Fastly 서버 로그에 남을 수 있습니다. `#` 프래그먼트로 바꾸면 해결됩니다. 자세한 내용은 [docs/security-review.md](docs/security-review.md) 참고.

## 광고 표시 관련 주의

중개대상물 정보를 담은 DM은 「표시·광고의 공정화에 관한 법률」과 중개대상물 표시·광고 규정의 적용을 받습니다. 중개사무소 명칭·개설등록번호·소재지 등 의무 표기 사항과 허위·과장 표현 여부를 발송 전에 반드시 확인하세요.
