<!-- DmCustomPage.vue — 가변형 템플릿의 A4 한 장 (표시 전용)
     office(공통 사무소 정보) + model(블록 데이터) 만 받아 그립니다.

     헤더·주소보정 스트립은 기본 템플릿과 같은 공용 클래스(.hdr .strip)를 그대로 씁니다.
     값은 전부 템플릿 보간({{ }})으로만 출력합니다. v-html 을 쓰지 않으므로
     사용자가 무엇을 입력해도 마크업으로 해석되지 않습니다. -->
<template>
  <div class="a4">
    <div class="cstm">
      <!-- 상단 헤더 — 네이비 그라데이션 + 골드 하단 보더 (기본 템플릿과 동일) -->
      <div class="hdr cstm-hdr">
        <div class="cstm-brand">
          <div class="cstm-logo">
            <img v-if="model.logo" :src="model.logo" alt="사무소 로고">
            <span v-else class="ph">LOGO</span>
          </div>
          <div>
            <div class="bn">{{ office.bizName }}</div>
            <div class="bt">{{ office.bizType }}</div>
          </div>
        </div>
        <div class="cstm-hdr-right">
          <div class="iss">{{ office.repTitle }} {{ office.repName }}</div>
          <div class="reg">개설등록번호 {{ office.regNo }}</div>
        </div>
      </div>

      <!-- 주소보정 안내 띠 -->
      <div v-if="model.showAddrNote" class="strip">
        <span class="tag">주소보정</span>
        <span class="tx">{{ office.addrNote }}</span>
      </div>

      <!-- 본문 -->
      <div ref="bodyEl" class="cstm-body">
        <div v-if="isFront && model.showRecipient" class="cstm-recipient">
          {{ model.recipient }}
        </div>

        <template v-for="blk in blocks" :key="blk.id">
          <!-- 본문 단락 -->
          <div v-if="blk.type === 'paragraph'" class="cstm-blk cstm-para" :class="styleClass(blk)">{{ blk.text }}</div>

          <!-- 강조 리스트 -->
          <div v-else-if="blk.type === 'highlight'" class="cstm-blk cstm-hl" :class="styleClass(blk)">
            <div v-for="(it, i) in blk.items" :key="i" class="cstm-hl-item">
              <span class="sq"></span>
              <span><b>{{ it.label }}</b><template v-if="it.label && it.text">: </template>{{ it.text }}</span>
            </div>
          </div>

          <!-- 매물 요약 박스 -->
          <div v-else-if="blk.type === 'listing'" class="cstm-blk cstm-box" :class="styleClass(blk)">
            <div class="cstm-box-head">
              <span class="sq"></span><span class="t">{{ blk.title }}</span>
            </div>
            <div class="cstm-rows">
              <div v-for="(r, i) in blk.rows" :key="i" class="cstm-row">
                <span class="lb">{{ r.label }}</span><span class="vl">{{ r.value }}</span>
              </div>
            </div>
          </div>

          <!-- 시장 동향 박스 -->
          <div v-else-if="blk.type === 'market'" class="cstm-blk cstm-trend" :class="styleClass(blk)">
            <div class="cstm-trend-head">
              <span class="sq"></span><span class="t">{{ blk.title }}</span>
            </div>
            <div class="cstm-trend-tx">{{ blk.text }}</div>
          </div>

          <!-- 서명 · 연락처 -->
          <div v-else-if="blk.type === 'signature'" class="cstm-blk cstm-sig" :class="styleClass(blk)">
            <div class="cstm-sig-date">{{ blk.date }}</div>
            <div
              v-for="(ln, i) in blk.lines"
              :key="i"
              class="cstm-sig-line"
              :class="{ 'is-name': i === 0 }"
            >{{ ln }}</div>
          </div>
        </template>
      </div>

      <!-- 하단 마감 바 -->
      <div class="cstm-foot">
        <span class="mark">{{ office.bizName }}</span>
      </div>

      <!-- A4 초과 경고 (화면에만, 인쇄물에는 안 나옵니다) -->
      <div v-if="overflow" class="cstm-over">
        A4 1페이지 규격을 초과했습니다. 내용을 줄여주세요
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  office: { type: Object, required: true },
  model: { type: Object, required: true },
  page: { type: String, default: 'front' }, // 'front' | 'back'
});

const emit = defineEmits(['update:overflow']);

const bodyEl = ref(null);
const overflow = ref(false);

const isFront = computed(() => props.page === 'front');
const blocks = computed(() => (isFront.value ? props.model.blocks : props.model.backBlocks));

function styleClass(blk) {
  const s = blk.style || {};
  return [`sz-${s.size || 'md'}`, `al-${s.align || 'left'}`, { 'is-bold': !!s.bold }];
}

/** 본문이 A4 안에 안 들어가면 경고를 올립니다. */
function measure() {
  const el = bodyEl.value;
  if (!el) return;
  // overflow:hidden 이라 넘친 만큼은 scrollHeight 로만 드러납니다.
  const over = el.scrollHeight > el.clientHeight + 1;
  if (over !== overflow.value) {
    overflow.value = over;
    emit('update:overflow', over);
  }
}

let ro = null;

onMounted(() => {
  measure();
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(measure);
    ro.observe(bodyEl.value);
  }
  // 웹폰트가 늦게 적용되면 높이가 달라지므로 다시 잽니다.
  if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
});

onBeforeUnmount(() => {
  if (ro) ro.disconnect();
});

// 블록 내용이 바뀌면 다시 측정합니다.
watch(() => JSON.stringify(blocks.value), measure, { flush: 'post' });
watch(() => [props.model.showRecipient, props.model.showAddrNote], measure, { flush: 'post' });
</script>
