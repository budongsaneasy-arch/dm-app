<!-- DmCustomEditor.vue — 가변형 템플릿(custom-v2) 편집기
     왼쪽 입력 폼 + 오른쪽 A4 라이브 미리보기.
     본문은 블록 배열이라 사용자가 순서를 바꾸고 추가·삭제할 수 있습니다. -->
<template>
  <div class="app">
    <!-- ============ 입력 폼 ============ -->
    <div class="form-pane">
      <details class="sec" open>
        <summary><span class="dot"></span>중개사무소 정보<span class="chev">▶</span></summary>
        <div class="body">
          <p class="note">템플릿을 바꿔도 이 값은 그대로 유지됩니다.</p>
          <VField label="상호 (브랜드)" :max="L.bizName" v-model="office.bizName" hint="예: OO부동산" />
          <VField label="상호 접미사" :max="L.bizType" v-model="office.bizType" hint="예: 공인중개사사무소" />
          <VField label="개설등록번호" :max="L.regNo" v-model="office.regNo" />
          <VField label="주소보정 안내" :max="L.addrNote" :rows="3" v-model="office.addrNote" />

          <div class="field">
            <label><span>로고 이미지</span></label>
            <div class="logo-row">
              <div class="logo-prev">
                <img v-if="model.logo" :src="model.logo" alt="로고 미리보기">
                <span v-else>없음</span>
              </div>
              <div class="logo-btns">
                <input ref="logoInput" type="file" accept="image/*" hidden @change="onLogo">
                <button type="button" class="mini" @click="logoInput.click()">이미지 선택</button>
                <button type="button" class="mini danger" :disabled="!model.logo" @click="model.logo = null">제거</button>
              </div>
            </div>
            <div class="hint">업로드한 이미지는 이 브라우저 안에서만 쓰입니다. 서버로 전송되지 않습니다.</div>
          </div>

          <label class="chk">
            <input type="checkbox" v-model="model.showAddrNote">
            <span>주소보정 안내 띠 표시</span>
          </label>
        </div>
      </details>

      <details class="sec" open>
        <summary><span class="dot"></span>수신인<span class="chev">▶</span></summary>
        <div class="body">
          <label class="chk">
            <input type="checkbox" v-model="model.showRecipient">
            <span>수신인 표시</span>
          </label>
          <VField
            v-if="model.showRecipient"
            label="수신인 문구"
            :max="CL.recipient"
            v-model="model.recipient"
            hint="예: OO시 OO동 000-00 소유자님께"
          />
        </div>
      </details>

      <details class="sec" open>
        <summary><span class="dot"></span>본문 블록<span class="chev">▶</span></summary>
        <div class="body">
          <!-- 앞면 / 뒷면 전환 -->
          <div v-if="model.hasBackPage" class="side-tabs">
            <button type="button" :class="{ on: side === 'front' }" @click="side = 'front'">앞면</button>
            <button type="button" :class="{ on: side === 'back' }" @click="side = 'back'">뒷면</button>
          </div>

          <p v-if="overflow[side]" class="warn-line">
            A4 1페이지 규격을 초과했습니다. 내용을 줄여주세요
          </p>

          <p v-if="!activeBlocks.length" class="note">
            블록이 없습니다. 아래에서 추가하세요.
          </p>

          <div v-for="(blk, i) in activeBlocks" :key="blk.id" class="blk">
            <div class="blk-head">
              <span class="blk-type">{{ typeLabel(blk.type) }}</span>
              <div class="blk-ctrl">
                <button type="button" class="mini" :disabled="i === 0" title="위로" @click="move(i, -1)">▲</button>
                <button type="button" class="mini" :disabled="i === activeBlocks.length - 1" title="아래로" @click="move(i, 1)">▼</button>
                <button type="button" class="mini danger" title="삭제" @click="remove(i)">삭제</button>
              </div>
            </div>

            <div class="blk-style">
              <select v-model="blk.style.size" aria-label="글자 크기">
                <option v-for="o in SIZE_OPTIONS" :key="o.key" :value="o.key">{{ o.label }}</option>
              </select>
              <select v-model="blk.style.align" aria-label="정렬">
                <option v-for="o in ALIGN_OPTIONS" :key="o.key" :value="o.key">{{ o.label }}</option>
              </select>
              <label class="chk inline">
                <input type="checkbox" v-model="blk.style.bold">
                <span>굵게</span>
              </label>
            </div>

            <!-- 본문 단락 -->
            <template v-if="blk.type === 'paragraph'">
              <VField label="내용" :max="CL.paragraph" :rows="6" v-model="blk.text" />
            </template>

            <!-- 강조 리스트 -->
            <template v-else-if="blk.type === 'highlight'">
              <div v-for="(it, k) in blk.items" :key="k" class="sub">
                <div class="sub-head">
                  <span>항목 {{ k + 1 }}</span>
                  <button type="button" class="mini danger" @click="blk.items.splice(k, 1)">삭제</button>
                </div>
                <VField label="앞머리 (굵게)" :max="CL.itemLabel" v-model="it.label" />
                <VField label="설명" :max="CL.itemText" :rows="2" v-model="it.text" />
              </div>
              <button type="button" class="mini" @click="blk.items.push({ label: '', text: '' })">+ 항목 추가</button>
            </template>

            <!-- 매물 요약 박스 -->
            <template v-else-if="blk.type === 'listing'">
              <VField label="박스 제목" :max="CL.blockTitle" v-model="blk.title" />
              <div v-for="(r, k) in blk.rows" :key="k" class="sub row2">
                <VField label="항목" :max="CL.rowLabel" v-model="r.label" />
                <VField label="값" :max="CL.rowValue" v-model="r.value" />
                <button type="button" class="mini danger" @click="blk.rows.splice(k, 1)">삭제</button>
              </div>
              <button type="button" class="mini" @click="blk.rows.push({ label: '', value: '' })">+ 항목 추가</button>
            </template>

            <!-- 시장 동향 박스 -->
            <template v-else-if="blk.type === 'market'">
              <VField label="박스 제목" :max="CL.blockTitle" v-model="blk.title" />
              <VField label="내용" :max="CL.paragraph" :rows="4" v-model="blk.text" />
            </template>

            <!-- 서명 · 연락처 -->
            <template v-else-if="blk.type === 'signature'">
              <VField label="작성일자" :max="CL.sigLine" v-model="blk.date" hint="예: 2026년 00월 00일" />
              <VField
                v-for="(ln, k) in blk.lines"
                :key="k"
                :label="`${k + 1}번째 줄`"
                :max="CL.sigLine"
                :model-value="ln"
                @update:modelValue="blk.lines[k] = $event"
              />
              <button type="button" class="mini" @click="blk.lines.push('')">+ 줄 추가</button>
            </template>
          </div>

          <div class="add-blk">
            <div class="add-title">블록 추가</div>
            <button
              v-for="t in BLOCK_TYPES"
              :key="t.key"
              type="button"
              class="mini"
              :title="t.desc"
              @click="add(t.key)"
            >+ {{ t.label }}</button>
          </div>
        </div>
      </details>

      <details class="sec" open>
        <summary><span class="dot"></span>뒷면 (2페이지)<span class="chev">▶</span></summary>
        <div class="body">
          <p class="note">
            기본은 A4 단면입니다. 뒷면을 추가하면 매물 요약과 시장 동향 프리셋이 들어갑니다.
          </p>
          <button v-if="!model.hasBackPage" type="button" class="mini" @click="addBack">+ 뒷면 추가</button>
          <button v-else type="button" class="mini danger" @click="removeBack">뒷면 삭제</button>
        </div>
      </details>
    </div>

    <!-- ============ 미리보기 ============ -->
    <div class="preview-pane">
      <div class="pglabel">앞면 (Front) · A4</div>
      <div class="pgwrap" :style="scaleStyle">
        <DmCustomPage :office="office" :model="model" page="front" @update:overflow="overflow.front = $event" />
      </div>

      <template v-if="model.hasBackPage">
        <div class="pglabel">뒷면 (Back) · A4</div>
        <div class="pgwrap" :style="scaleStyle">
          <DmCustomPage :office="office" :model="model" page="back" @update:overflow="overflow.back = $event" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import './dmPages.css';
import './dmCustom.css';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import VField from './VField.vue';
import DmCustomPage from './DmCustomPage.vue';
import { LIMITS } from './dmModel.js';
import {
  ALIGN_OPTIONS,
  BLOCK_TYPES,
  CUSTOM_LIMITS,
  SIZE_OPTIONS,
  backPagePreset,
  createBlock,
} from './customModel.js';

const props = defineProps({
  office: { type: Object, required: true },
  model: { type: Object, required: true },
});

const L = LIMITS;
const CL = CUSTOM_LIMITS;

const side = ref('front');
const logoInput = ref(null);
const overflow = reactive({ front: false, back: false });

const activeBlocks = computed(() =>
  side.value === 'front' ? props.model.blocks : props.model.backBlocks
);

const typeLabel = (key) => BLOCK_TYPES.find((t) => t.key === key)?.label ?? key;

/* ---------- 블록 조작 ---------- */
function move(i, dir) {
  const list = activeBlocks.value;
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  const [item] = list.splice(i, 1);
  list.splice(j, 0, item);
}

function remove(i) {
  const blk = activeBlocks.value[i];
  if (!confirm(`"${typeLabel(blk.type)}" 블록을 삭제할까요?`)) return;
  activeBlocks.value.splice(i, 1);
}

function add(type) {
  const blk = createBlock(type);
  // 서명 블록은 공통 사무소 정보로 미리 채워 둡니다. 그대로 두거나 고쳐 쓰면 됩니다.
  if (type === 'signature') {
    const o = props.office;
    blk.lines = [
      [o.bizName, o.bizType, o.repTitle, o.repName].filter(Boolean).join(' '),
      o.address ? `주소: ${o.address}` : '',
      [o.phone2, o.phone1].filter(Boolean).join(' / '),
    ].filter(Boolean);
  }
  activeBlocks.value.push(blk);
}

/* ---------- 뒷면 ---------- */
function addBack() {
  props.model.backBlocks = backPagePreset();
  props.model.hasBackPage = true;
  side.value = 'back';
}

function removeBack() {
  if (!confirm('뒷면을 삭제할까요? 뒷면에 입력한 내용이 사라집니다.')) return;
  props.model.hasBackPage = false;
  props.model.backBlocks = [];
  side.value = 'front';
  overflow.back = false;
}

/* ---------- 로고 ---------- */
function onLogo(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => { props.model.logo = r.result; };
  r.readAsDataURL(f);
  e.target.value = '';
}

/* ---------- 미리보기 축소 ---------- */
const scale = ref(0.86);
const scaleStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  marginBottom: `${-(1123 * (1 - scale.value)) + 20}px`,
}));

function fitScale() {
  const avail = window.innerWidth - 380 - 68;
  scale.value = Math.min(0.92, Math.max(0.4, avail / 794));
}

onMounted(() => {
  fitScale();
  window.addEventListener('resize', fitScale);
});
onBeforeUnmount(() => window.removeEventListener('resize', fitScale));
</script>

<style scoped>
.note { font-size: 11.5px; color: #8a93a5; margin: 0 0 10px; line-height: 1.6; }
.hint { font-size: 10.5px; color: #9aa3b2; margin-top: 4px; }

.chk { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: #41506a; margin-bottom: 10px; cursor: pointer; }
.chk.inline { margin-bottom: 0; font-size: 11.5px; }

.warn-line {
  background: #fdecea; color: #a3301f; border: 1px solid #f1bdb5;
  font-size: 11.5px; font-weight: 700; border-radius: 5px;
  padding: 8px 11px; margin: 0 0 10px; line-height: 1.5;
}

.side-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
.side-tabs button {
  flex: 1; padding: 7px 0; font-size: 12px; font-weight: 700;
  border: 1px solid #d6dce5; border-radius: 6px; background: #fff;
  color: #6b7490; cursor: pointer;
}
.side-tabs button.on { background: #163766; border-color: #163766; color: #fff; }

.blk { border: 1px solid #dde3ec; border-radius: 7px; padding: 11px 12px; margin-bottom: 11px; background: #fbfcfe; }
.blk-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.blk-type { font-size: 11.5px; font-weight: 800; color: #163766; }
.blk-ctrl { display: flex; gap: 4px; }

.blk-style { display: flex; align-items: center; gap: 6px; margin-bottom: 9px; }
.blk-style select {
  font-size: 11px; padding: 3px 5px; border: 1px solid #d6dce5;
  border-radius: 5px; background: #fff; color: #2a2f3a; font-family: inherit;
}

.sub { border-top: 1px dashed #dde3ec; padding-top: 8px; margin-top: 8px; }
.sub-head { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #8a93a5; margin-bottom: 5px; }
.sub.row2 { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: end; }

.mini {
  font-size: 11px; font-weight: 700; padding: 5px 9px; cursor: pointer;
  border: 1px solid #d6dce5; border-radius: 5px; background: #fff; color: #41506a;
}
.mini:hover:not(:disabled) { border-color: #163766; }
.mini:disabled { opacity: 0.4; cursor: not-allowed; }
.mini.danger { color: #b4231b; }

.add-blk { border-top: 1px solid #e4e9f0; padding-top: 11px; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 5px; }
.add-title { width: 100%; font-size: 11px; font-weight: 700; color: #8a93a5; margin-bottom: 3px; }

.logo-row { display: flex; align-items: center; gap: 10px; }
.logo-prev {
  width: 54px; height: 54px; flex: 0 0 auto; border: 1px solid #d6dce5;
  border-radius: 6px; background: #f3f5f9; display: flex; align-items: center;
  justify-content: center; font-size: 10px; color: #9aa3b2; overflow: hidden;
}
.logo-prev img { width: 100%; height: 100%; object-fit: contain; }
.logo-btns { display: flex; flex-direction: column; gap: 5px; }
</style>
