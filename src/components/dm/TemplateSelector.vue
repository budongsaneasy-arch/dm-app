<!-- TemplateSelector.vue — 템플릿 전환 탭
     v-model 로 templateType('legacy' | 'custom-v2') 을 주고받습니다. -->
<template>
  <div class="tsel" role="tablist" aria-label="템플릿 선택">
    <button
      v-for="t in templates"
      :key="t.key"
      type="button"
      role="tab"
      class="tsel-btn"
      :class="{ on: t.key === modelValue }"
      :aria-selected="t.key === modelValue"
      :title="t.desc"
      @click="$emit('update:modelValue', t.key)"
    >{{ t.label }}</button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true },
});
defineEmits(['update:modelValue']);

const templates = [
  { key: 'legacy', label: '기본 템플릿', desc: 'A4 앞·뒤 2페이지 고정 양식 (시세표·시장동향 포함)' },
  { key: 'custom-v2', label: '가변형 템플릿', desc: '본문을 블록으로 구성하는 A4 단면 양식 (뒷면 선택)' },
];
</script>

<style scoped>
.tsel { display: flex; gap: 4px; background: rgba(255, 255, 255, 0.08); padding: 3px; border-radius: 8px; }

.tsel-btn {
  font-size: 12.5px;
  font-weight: 700;
  padding: 7px 15px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #c9d6ea;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
}
.tsel-btn:hover { color: #fff; }
.tsel-btn.on { background: #fff; color: #0e2546; }
.tsel-btn:focus-visible { outline: 2px solid #e7c778; outline-offset: 2px; }
</style>
