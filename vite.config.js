import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 최종 배포 주소: https://dmapp.bdseasy.com (커스텀 도메인 루트)
// base 는 반드시 '/' 여야 합니다. '/dm-app/' 처럼 저장소 이름으로 두면
// 커스텀 도메인에서 JS/CSS 경로가 /dm-app/assets/... 로 잡혀 전부 404 가 됩니다.
export default defineConfig({
  base: '/',
  plugins: [vue()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});
