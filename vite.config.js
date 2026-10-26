import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/**
 * 프로덕션 빌드에만 CSP 를 넣습니다.
 *
 * GitHub Pages 는 정적 호스팅이라 응답 헤더를 설정할 수 없어 meta 태그로 대신합니다.
 * dev 서버는 인라인 스크립트와 HMR 웹소켓을 쓰기 때문에, 같은 정책을 개발 중에 걸면
 * 앱이 뜨지 않습니다. 그래서 apply: 'build' 로 빌드 때만 주입합니다.
 *
 * frame-ancestors 는 meta 로는 적용되지 않아(브라우저가 무시하고 경고를 남김) 넣지 않았습니다.
 * iframe 삽입 차단이 필요하면 응답 헤더를 설정할 수 있는 호스팅으로 옮겨야 합니다.
 * 자세한 내용은 docs/security-review.md 참고.
 */
const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  // 'unsafe-inline' 은 :style 바인딩(미리보기 축소 transform) 때문에 필요합니다.
  // style-src-attr 로 좁히면 Safari 에서 미지원 시 축소가 깨지므로 style-src 에 둡니다.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // data: — 파비콘(인라인 SVG)과 사용자가 올린 프로필·사례 사진(FileReader 결과)
  "img-src 'self' data:",
  // 이 앱은 서버와 통신하지 않습니다.
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

const CHARSET_TAG = '<meta charset="UTF-8" />';

const injectCsp = {
  name: 'inject-csp',
  apply: 'build',
  // charset 바로 다음에 넣습니다. charset 은 문서 맨 앞이어야 하고,
  // CSP 는 자기보다 뒤에 파싱되는 자원에만 적용되므로 폰트 link 보다 앞이어야 합니다.
  transformIndexHtml(html) {
    if (!html.includes(CHARSET_TAG)) {
      throw new Error('index.html 에서 charset 메타를 찾지 못해 CSP 를 넣을 수 없습니다.');
    }
    const meta = `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`;
    return html.replace(CHARSET_TAG, `${CHARSET_TAG}\n    ${meta}`);
  },
};

// 최종 배포 주소: https://dmapp.bdseasy.com (커스텀 도메인 루트)
// base 는 반드시 '/' 여야 합니다. '/dm-app/' 처럼 저장소 이름으로 두면
// 커스텀 도메인에서 JS/CSS 경로가 /dm-app/assets/... 로 잡혀 전부 404 가 됩니다.
export default defineConfig({
  base: '/',
  plugins: [vue(), injectCsp],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});
