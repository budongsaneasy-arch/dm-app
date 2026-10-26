<!-- VField.vue — 글자수 제한 카운터가 있는 재사용 입력 필드 -->
<template>
  <div class="field">
    <label>
      <span>{{ label }}</span>
      <span v-if="max" class="count" :class="{ over }">{{ len }}/{{ max }}</span>
    </label>
    <textarea
      v-if="rows"
      :rows="rows"
      :maxlength="max"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <input
      v-else
      type="text"
      :maxlength="max"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    >
    <div v-if="hint" class="hint">{{ hint }}</div>
  </div>
</template>

<script>
export default {
  name: 'VField',
  props: {
    label: String,
    modelValue: [String, Number],
    max: Number,
    rows: Number,
    hint: String,
  },
  emits: ['update:modelValue'],
  computed: {
    len() { return (this.modelValue || '').length; },
    over() { return this.max && this.len > this.max; },
  },
};
</script>

<style scoped>
.field { margin-bottom: 12px; }
.field label { display: flex; justify-content: space-between; align-items: baseline; font-size: 12px; font-weight: 700; color: #41506A; margin-bottom: 5px; }
.count { font-weight: 500; color: #9AA3B2; font-size: 10.5px; }
.count.over { color: #c0392b; }
input[type=text], textarea { width: 100%; border: 1px solid #d6dce5; border-radius: 6px; padding: 8px 10px; font-family: 'Noto Sans KR', sans-serif; font-size: 13px; color: #2A2F3A; background: #fff; resize: vertical; }
input:focus, textarea:focus { outline: none; border-color: #163766; box-shadow: 0 0 0 3px rgba(22,51,92,.1); }
.hint { font-size: 10.5px; color: #9AA3B2; margin-top: 4px; }
</style>
