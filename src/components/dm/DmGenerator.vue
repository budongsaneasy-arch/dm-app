<!-- DmGenerator.vue — 기본 템플릿(legacy) 편집기 (입력 폼 + 라이브 미리보기)
     DmStudio 안에서만 씁니다. 툴바와 공통 사무소 정보는 DmStudio 가 관리합니다. -->
<template>
  <div class="app">
    <!-- ============ 입력 폼 ============ -->
    <div class="form-pane">
      <details class="sec" open>
        <summary><span class="dot"></span>중개사무소 정보<span class="chev">▶</span></summary>
        <div class="body">
          <VField label="상호 (브랜드)" :max="L.bizName" v-model="m.bizName" hint="예: OO부동산" />
          <VField label="상호 접미사" :max="L.bizType" v-model="m.bizType" hint="예: 부동산중개법인 / 공인중개사사무소" />
          <VField label="개설등록번호" :max="L.regNo" v-model="m.regNo" />
          <div class="row2">
            <VField label="발행 호수" :max="L.issue" v-model="m.issue" />
            <VField label="대표명" :max="L.repName" v-model="m.repName" />
          </div>
          <VField label="대표 직함" :max="L.repTitle" v-model="m.repTitle" />
          <div class="row2">
            <VField label="전화 1" :max="L.phone" v-model="m.phone1" />
            <VField label="전화 2" :max="L.phone" v-model="m.phone2" />
          </div>
          <VField label="사무소 주소" :max="L.address" v-model="m.address" />
          <div class="subhead">프로필 사진</div>
          <div class="file-row">
            <img class="thumb" :src="m.profilePhoto || transparent">
            <label class="file-btn">사진 업로드<input type="file" accept="image/*" hidden @change="upload($event, 'profilePhoto')"></label>
            <button v-if="m.profilePhoto" class="file-btn" @click="m.profilePhoto = null">삭제</button>
          </div>
          <div style="margin-top:12px;display:flex;gap:18px;">
            <label class="toggle"><input type="checkbox" v-model="m.showProfile">프로필 표시</label>
            <label class="toggle"><input type="checkbox" v-model="m.showQR">QR 표시</label>
          </div>
        </div>
      </details>

      <details class="sec">
        <summary><span class="dot"></span>주소보정 안내 (후킹)<span class="chev">▶</span></summary>
        <div class="body"><VField label="안내 문구" :max="L.addrNote" :rows="3" v-model="m.addrNote" /></div>
      </details>

      <details class="sec">
        <summary><span class="dot"></span>인사말<span class="chev">▶</span></summary>
        <div class="body">
          <VField label="대상 (단지명(지역명) + 소유주님께)" :max="L.greetTarget" v-model="m.greetTarget" />
          <VField label="인사말 본문" :max="L.greetBody" :rows="5" v-model="m.greetBody" />
        </div>
      </details>

      <details class="sec">
        <summary><span class="dot"></span>시세 기준표<span class="chev">▶</span></summary>
        <div class="body">
          <div class="row2">
            <VField label="표 제목" :max="L.tableTitle" v-model="m.tableTitle" />
            <VField label="기준일" :max="L.baseDate" v-model="m.baseDate" />
          </div>
          <div class="subhead">평형별 시세 (행)</div>
          <div class="rowcard" v-for="(r, i) in m.rows" :key="i">
            <div class="rt">{{ i + 1 }}번 행</div>
            <div class="row2">
              <VField label="평형" :max="L.rowPyeong" v-model="r.pyeong" />
              <VField label="전용면적" :max="L.rowArea" v-model="r.area" />
            </div>
            <VField label="매매 (하한~상한)" :max="L.rowSale" v-model="r.sale" />
            <div class="row2">
              <VField label="전세" :max="L.rowJeonse" v-model="r.jeonse" />
              <VField label="월세" :max="L.rowWolse" v-model="r.wolse" />
            </div>
            <VField label="특이사항" :max="L.rowNote" v-model="r.note" />
            <button class="file-btn" v-if="m.rows.length > 1" @click="m.rows.splice(i, 1)" style="margin-top:2px;">행 삭제</button>
          </div>
          <button class="file-btn" v-if="m.rows.length < 6" @click="addRow">+ 행 추가</button>
          <VField label="표 하단 각주" :max="L.tableFoot" :rows="2" v-model="m.tableFoot" />
        </div>
      </details>

      <details class="sec">
        <summary><span class="dot"></span>시장 동향<span class="chev">▶</span></summary>
        <div class="body">
          <div class="row2">
            <VField label="헤드라인 앞부분" :max="L.trendHeadPre" v-model="m.trendHeadPre" />
            <VField label="강조 부분" :max="L.trendHeadHi" v-model="m.trendHeadHi" />
          </div>
          <VField label="헤드라인 끝부분" :max="L.trendHeadPost" v-model="m.trendHeadPost" />
          <div class="subhead">지표 3개</div>
          <div class="rowcard" v-for="(s, i) in m.stats" :key="i">
            <div class="rt">지표 {{ i + 1 }}</div>
            <div class="row2">
              <VField label="수치" :max="L.statNum" v-model="s.num" />
              <VField label="라벨" :max="L.statLabel" :rows="2" v-model="s.label" />
            </div>
          </div>
          <VField label="시장 동향 본문" :max="L.trendBody" :rows="4" v-model="m.trendBody" />
        </div>
      </details>

      <details class="sec">
        <summary><span class="dot"></span>전화 유도 (CTA)<span class="chev">▶</span></summary>
        <div class="body">
          <VField label="배지 문구" :max="L.ctaBadge" v-model="m.ctaBadge" />
          <VField label="CTA 헤드라인" :max="L.ctaHead" v-model="m.ctaHead" />
          <VField label="CTA 서브문구" :max="L.ctaSub" v-model="m.ctaSub" />
        </div>
      </details>

      <div class="divider">━ 뒷면 ━</div>

      <details class="sec">
        <summary><span class="dot"></span>뒷면 헤더<span class="chev">▶</span></summary>
        <div class="body">
          <VField label="제목" :max="L.backTitle" v-model="m.backTitle" />
          <VField label="부제" :max="L.backSub" v-model="m.backSub" />
          <VField label="상단 안내 (변동 고지)" :max="L.backNote" :rows="2" v-model="m.backNote" />
        </div>
      </details>

      <details class="sec">
        <summary><span class="dot"></span>정보 01 (표 포함)<span class="chev">▶</span></summary>
        <div class="body">
          <VField label="제목" :max="L.cardTitle" v-model="m.card1.title" />
          <VField label="본문" :max="L.cardBody" :rows="4" v-model="m.card1.body" />
          <div class="subhead">비교표</div>
          <div class="row2"><VField label="열2 헤더" :max="L.cardCell" v-model="m.card1.h2" /><VField label="열3 헤더" :max="L.cardCell" v-model="m.card1.h3" /></div>
          <div class="rowcard" v-for="(r, i) in m.card1.rows" :key="i">
            <div class="row2"><VField label="구분" :max="L.cardCell" v-model="r[0]" /><VField label="현행" :max="L.cardCell" v-model="r[1]" /></div>
            <VField label="변경" :max="L.cardCell" v-model="r[2]" />
          </div>
        </div>
      </details>

      <details class="sec">
        <summary><span class="dot"></span>정보 02 (사진 포함)<span class="chev">▶</span></summary>
        <div class="body">
          <VField label="제목" :max="L.cardTitle" v-model="m.card2.title" />
          <VField label="본문" :max="L.cardBody" :rows="3" v-model="m.card2.body" />
          <VField label="예시 박스" :max="L.cardExample" :rows="3" v-model="m.card2.example" />
          <div class="subhead">보충 설명 사진</div>
          <div class="file-row">
            <img class="thumb" :src="m.card2.photo || transparent">
            <label class="file-btn">사진 업로드<input type="file" accept="image/*" hidden @change="upload($event, 'card2photo')"></label>
            <button v-if="m.card2.photo" class="file-btn" @click="m.card2.photo = null">삭제</button>
          </div>
        </div>
      </details>

      <details class="sec">
        <summary><span class="dot"></span>정보 03 (이웃 사례)<span class="chev">▶</span></summary>
        <div class="body">
          <VField label="제목" :max="L.caseTitle" v-model="m.caseTitle" />
          <VField label="본문" :max="L.caseBody" :rows="3" v-model="m.caseBody" />
          <VField label="마무리 상담 문구" :max="L.closing" :rows="2" v-model="m.closing" />
        </div>
      </details>
    </div>

    <!-- ============ 미리보기 ============ -->
    <div class="preview-pane">
      <div class="pglabel">앞면 (Front) · A4</div>
      <div class="pgwrap" :style="scaleStyle"><DmFrontPage :m="m" /></div>
      <div class="pglabel">뒷면 (Back) · A4</div>
      <div class="pgwrap" :style="scaleStyle"><DmBackPage :m="m" /></div>
    </div>
  </div>
</template>

<script>
import './dmPages.css';
import VField from './VField.vue';
import DmFrontPage from './DmFrontPage.vue';
import DmBackPage from './DmBackPage.vue';
import { sampleData, LIMITS, BLANK_ROW } from './dmModel.js';
import { pickOffice } from './officeModel.js';

// 입력값은 탭(세션) 단위로만 보관합니다. 탭을 닫으면 사라지고,
// 메뉴를 다시 눌러 새 탭으로 들어오면 처음부터 입력하게 됩니다.
// 같은 탭에서 새로고침한 경우에만 복원되어, 실수로 입력이 날아가지 않습니다.
const STORAGE_KEY = 'dm_model';

export default {
  name: 'DmGenerator',
  components: { VField, DmFrontPage, DmBackPage },
  props: {
    // 템플릿을 바꿔도 유지되는 공통 사무소 정보. DmStudio 가 들고 있습니다.
    office: { type: Object, required: true },
  },
  data() {
    return {
      m: sampleData(),
      L: LIMITS,
      scale: 0.86,
      transparent: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    };
  },
  computed: {
    // 공통 사무소 정보만 떼어낸 값. 이 키들이 바뀔 때만 다시 계산됩니다.
    officeSubset() { return pickOffice(this.m); },
    scaleStyle() {
      return { transform: `scale(${this.scale})`, marginBottom: `${-(1123 * (1 - this.scale)) + 20}px` };
    },
  },
  methods: {
    addRow() { this.m.rows.push(BLANK_ROW()); },
    resetSample() {
      if (confirm('입력 내용을 샘플 데이터로 초기화할까요?')) {
        this.m = sampleData();
        try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
      }
    },
    printDM() { window.print(); },
    upload(e, key) {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { if (key === 'card2photo') this.m.card2.photo = r.result; else this.m[key] = r.result; };
      r.readAsDataURL(f);
      e.target.value = '';
    },
    fitScale() {
      const avail = window.innerWidth - 380 - 68;
      this.scale = Math.min(0.92, Math.max(0.4, avail / 794));
    },
  },
  watch: {
    m: { deep: true, handler(v) { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch (e) {} } },
    // 여기서 사무소 정보를 고치면 공통 모델에도 반영해, 템플릿을 바꿔도 그대로 보이게 합니다.
    officeSubset(v) { Object.assign(this.office, v); },
  },
  mounted() {
    // 같은 탭에서 새로고침한 경우에만 복원됩니다. 새 탭이면 비어 있어 샘플 데이터로 시작합니다.
    // (구버전 localStorage 정리와 프래그먼트 프리필은 DmStudio 가 담당합니다)
    try { const s = sessionStorage.getItem(STORAGE_KEY); if (s) this.m = Object.assign(sampleData(), JSON.parse(s)); } catch (e) {}

    // 공통 사무소 정보를 덮어씁니다. 다른 템플릿에서 고친 값도 여기에 그대로 반영됩니다.
    Object.assign(this.m, pickOffice(this.office));

    this.fitScale();
    window.addEventListener('resize', this.fitScale);
  },
  beforeUnmount() {
    // 템플릿을 바꿀 때 워처가 돌기 전에 언마운트될 수 있어, 여기서 한 번 더 맞춰 둡니다.
    Object.assign(this.office, pickOffice(this.m));
    window.removeEventListener('resize', this.fitScale);
  },
};
</script>

<style scoped>
.dm { font-family: 'Noto Sans KR', sans-serif; color: #2A2F3A; background: #e7e5df; }

/* 툴바 */
.toolbar { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; justify-content: space-between; background: #0E2546; color: #fff; padding: 12px 22px; box-shadow: 0 2px 12px rgba(0,0,0,.18); }
.brand { font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: 17px; }
.brand small { font-family: 'Noto Sans KR', sans-serif; font-weight: 400; font-size: 12px; color: #A9BBD6; margin-left: 8px; }
.actions { display: flex; gap: 10px; align-items: center; }
.btn { font-size: 13px; font-weight: 700; border: none; border-radius: 7px; padding: 9px 16px; cursor: pointer; }
.btn-gold { background: #C29B45; color: #0E2546; }
.btn-gold:hover { background: #E7C778; }
.btn-ghost { background: transparent; color: #C9D6EA; border: 1px solid #2c4a72; }
.btn-ghost:hover { background: #16335C; }

.app { display: grid; grid-template-columns: 380px 1fr; align-items: start; }

/* 폼 */
.form-pane { position: sticky; top: 49px; height: calc(100vh - 49px); overflow-y: auto; background: #fff; border-right: 1px solid #d8d5cd; padding: 18px 18px 60px; }
.sec { border: 1px solid #e7e9ee; border-radius: 10px; margin-bottom: 14px; overflow: hidden; }
.sec > summary { cursor: pointer; list-style: none; padding: 12px 14px; background: #F7FAFD; font-weight: 700; font-size: 13.5px; color: #0E2546; display: flex; align-items: center; gap: 8px; user-select: none; }
.sec > summary::-webkit-details-marker { display: none; }
.sec > summary .dot { width: 8px; height: 8px; background: #C29B45; border-radius: 2px; }
.sec > summary .chev { margin-left: auto; color: #9AA3B2; font-size: 11px; transition: transform .2s; }
.sec[open] > summary .chev { transform: rotate(90deg); }
.sec .body { padding: 12px 14px; }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.toggle { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: #41506A; cursor: pointer; }
.toggle input { width: 16px; height: 16px; accent-color: #0E2546; }
.subhead { font-size: 11px; font-weight: 700; color: #C29B45; letter-spacing: .5px; margin: 14px 0 8px; }
.divider { font-size: 13px; font-weight: 700; color: #0E2546; border-top: 2px solid #eceef2; padding-top: 16px; margin: 18px 0 8px; }
.file-row { display: flex; align-items: center; gap: 10px; }
.file-row .thumb { width: 46px; height: 46px; border-radius: 6px; background: repeating-linear-gradient(45deg,#E6ECF4 0 6px,#EFF3F9 6px 12px); object-fit: cover; flex: none; }
.file-btn { font-size: 11.5px; font-weight: 700; color: #0E2546; background: #EEF3F9; border: 1px solid #DCE6F1; border-radius: 6px; padding: 7px 11px; cursor: pointer; }
.file-btn:hover { background: #e3ebf5; }
.rowcard { border: 1px solid #eceef2; border-radius: 8px; padding: 10px; margin-bottom: 9px; }
.rowcard .rt { font-size: 11px; font-weight: 700; color: #0E2546; margin-bottom: 7px; }

/* 미리보기 */
.preview-pane { padding: 34px 34px 60px; display: flex; flex-direction: column; align-items: center; gap: 30px; overflow-x: auto; }
.pglabel { font-size: 12px; color: #6B7280; font-weight: 600; align-self: flex-start; }
.pgwrap { transform-origin: top center; }

/* 인쇄 시 폼·툴바 숨김, 페이지만 출력 */
/* 인쇄 규칙은 dmPages.css 로 옮겼습니다.
   scoped 스타일은 이 컴포넌트가 그린 요소에만 걸리는데, 툴바는 DmStudio 가 그리고
   폼은 템플릿마다 다른 컴포넌트가 그리기 때문입니다. */
</style>
