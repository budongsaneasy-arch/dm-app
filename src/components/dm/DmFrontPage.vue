<!-- DmFrontPage.vue — DM 앞면 (A4) · props.m 으로 데이터 주입 -->
<template>
  <div class="a4">
    <!-- 헤더 -->
    <div class="hdr">
      <div>
        <div class="bn">{{ m.bizName }}</div>
        <div class="bt">{{ m.bizType }}</div>
      </div>
      <div style="text-align:right;">
        <div class="iss">{{ m.issue }}</div>
        <div class="reg">개설등록번호 {{ m.regNo }}</div>
      </div>
    </div>

    <!-- 주소보정 안내 -->
    <div class="strip">
      <span class="tag">주소보정</span>
      <span class="tx" v-html="addrNoteHtml"></span>
    </div>

    <!-- 인사말 -->
    <div class="greet">
      <div class="pf" v-if="m.showProfile">
        <div class="circ">
          <img v-if="m.profilePhoto" :src="m.profilePhoto" alt="프로필">
          <span v-else class="ph">프로필</span>
        </div>
        <div class="nm">{{ m.repName }}</div>
        <div class="ti">{{ m.repTitle }}</div>
      </div>
      <div style="flex:1;">
        <div class="gt">{{ m.greetTarget }}</div>
        <p>{{ m.greetBody }}</p>
        <div class="sig">{{ m.bizName }} {{ m.bizType }} · 대표 <b class="nv">{{ m.repName }}</b> 드림</div>
      </div>
    </div>

    <!-- 시세 기준표 -->
    <div class="sec-pad">
      <div class="slabel"><span class="sq"></span><span class="t">{{ m.tableTitle }}</span><span class="r">{{ m.baseDate }}</span></div>
      <div class="tbl">
        <div class="gr th"><div>평형</div><div>매매 (하한~상한)</div><div>전세</div><div>월세</div><div>특이사항</div></div>
        <div class="gr tr" :class="i % 2 ? 'alt' : 'wt'" v-for="(r, i) in m.rows" :key="i">
          <div class="py">{{ r.pyeong }}<small>{{ r.area }}</small></div>
          <div class="sale">{{ r.sale }}</div>
          <div class="nor">{{ r.jeonse }}</div>
          <div class="nor">{{ r.wolse }}</div>
          <div class="note">{{ r.note }}</div>
        </div>
      </div>
      <div class="foot">{{ m.tableFoot }}</div>
    </div>

    <!-- 시장 동향 -->
    <div class="trend">
      <div class="slabel"><span class="sq"></span><span class="t">시장 동향</span></div>
      <div class="hl">{{ m.trendHeadPre }}<span class="hi">{{ m.trendHeadHi }}</span>{{ m.trendHeadPost }}</div>
      <div class="stats">
        <div class="stat" :class="{ dark: i === 2 }" v-for="(s, i) in m.stats" :key="i">
          <div class="n">{{ s.num }}</div><div class="l">{{ s.label }}</div>
        </div>
      </div>
      <p>{{ m.trendBody }}</p>
    </div>

    <div class="spacer"></div>

    <!-- CTA -->
    <div class="cta">
      <div>
        <span class="badge">{{ m.ctaBadge }}</span>
        <div class="ch">{{ m.ctaHead }}</div>
        <div class="cs">{{ m.ctaSub }}</div>
      </div>
      <div class="pr">
        <div class="lab">지금 바로 전화주세요</div>
        <div class="p1">{{ m.phone1 }}</div>
        <div class="p2">{{ m.phone2 }}</div>
      </div>
    </div>
  </div>
</template>

<script>
function esc(s) { return (s || '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])); }

export default {
  name: 'DmFrontPage',
  props: { m: { type: Object, required: true } },
  computed: {
    // '모바일 쿠폰' 단어를 강조
    addrNoteHtml() {
      return esc(this.m.addrNote).replace('모바일 쿠폰', '<b class="nv">모바일 쿠폰</b>');
    },
  },
};
</script>
