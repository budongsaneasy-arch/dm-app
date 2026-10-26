<!-- DmStudio.vue — DM 생성기 컨테이너
     템플릿을 고르고, 공통 사무소 정보를 들고 있으면서 본문 렌더러만 교체합니다.
     툴바(샘플 초기화 / PDF 인쇄)도 여기서 관리합니다.

     보관 정책: 입력값은 그 탭(세션) 안에서만 남습니다. 새 탭으로 들어오면 처음부터입니다.
     자세한 내용은 README 의 '입력값 보관 정책' 참고. -->
<template>
  <div class="dm">
    <div class="toolbar">
      <div class="brand">
        부동산 DM 생성기
        <small>데이터 입력 → A4 자동 생성 → PDF 인쇄</small>
      </div>
      <div class="actions">
        <TemplateSelector v-model="templateType" />
        <button class="btn btn-ghost" @click="resetActive">샘플로 초기화</button>
        <button class="btn btn-gold" @click="printDM">PDF 저장 / 인쇄</button>
      </div>
    </div>

    <DmGenerator v-if="templateType === 'legacy'" ref="legacyRef" :office="office" />
    <DmCustomEditor v-else :office="office" :model="custom" />
  </div>
</template>

<script setup>
import './dmPages.css';
import { reactive, ref, watch } from 'vue';
import TemplateSelector from './TemplateSelector.vue';
import DmGenerator from './DmGenerator.vue';
import DmCustomEditor from './DmCustomEditor.vue';
import { OFFICE_KEYS, officeDefaults } from './officeModel.js';
import { customSampleData } from './customModel.js';
import { applyQueryPrefill, clearPrefillFromUrl } from './queryPrefill.js';

const KEY_TEMPLATE = 'dm_template';
const KEY_OFFICE = 'dm_office';
const KEY_CUSTOM = 'dm_custom';

/* ---------- 보관 (탭 세션 단위) ---------- */
function load(key, fallback) {
  try {
    const s = sessionStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장이 막혀도 화면 동작에는 지장이 없습니다.
  }
}

// 이전 버전이 localStorage 에 남겨 둔 입력값을 지웁니다.
// 공용 PC 에 사무소 정보나 고객 정보가 기한 없이 남아 있지 않도록 하는 정리 작업입니다.
['dm_model', KEY_OFFICE, KEY_CUSTOM, KEY_TEMPLATE].forEach((k) => {
  try { localStorage.removeItem(k); } catch { /* 무시 */ }
});

const templateType = ref(load(KEY_TEMPLATE, 'legacy'));
const office = reactive(Object.assign(officeDefaults(), load(KEY_OFFICE, null)));
const custom = reactive(Object.assign(customSampleData(), load(KEY_CUSTOM, null)));

// 본 서비스에서 넘어온 사무소 정보로 덮어씁니다 (세션 복원값보다 우선).
// 적용 후 주소창의 프래그먼트를 지워, 새로고침 때 사용자가 고친 값이 되돌아가지 않게 합니다.
if (applyQueryPrefill(office).length) clearPrefillFromUrl();

watch(templateType, (v) => save(KEY_TEMPLATE, v));
watch(office, (v) => save(KEY_OFFICE, { ...v }), { deep: true });
watch(custom, (v) => save(KEY_CUSTOM, JSON.parse(JSON.stringify(v))), { deep: true });

/* ---------- 툴바 ---------- */
const legacyRef = ref(null);

function resetActive() {
  if (templateType.value === 'legacy') {
    legacyRef.value?.resetSample();
    return;
  }
  if (!confirm('입력 내용을 샘플 데이터로 초기화할까요?')) return;
  const fresh = customSampleData();
  Object.keys(custom).forEach((k) => { delete custom[k]; });
  Object.assign(custom, fresh);
}

function printDM() {
  window.print();
}

/* 공통 사무소 정보 키는 officeModel.js 한 곳에서만 정의합니다. */
void OFFICE_KEYS;
</script>
