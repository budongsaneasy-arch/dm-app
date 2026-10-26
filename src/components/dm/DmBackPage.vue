<!-- DmBackPage.vue — DM 뒷면 (A4) · props.m 으로 데이터 주입 -->
<template>
  <div class="a4">
    <div class="bhdr">
      <div><div class="t">{{ m.backTitle }}</div><div class="s">{{ m.backSub }}</div></div>
      <div class="bn">{{ m.bizName }}</div>
    </div>
    <div class="bnote">※ {{ m.backNote }}</div>

    <div class="bbody">
      <!-- 정보 01 (비교표) -->
      <div class="info">
        <div class="ih"><span class="no">01</span><span class="it">{{ m.card1.title }}</span></div>
        <div class="ib">
          <p>{{ m.card1.body }}</p>
          <div class="ctbl">
            <div class="h">구분</div><div class="h">{{ m.card1.h2 }}</div><div class="h g">{{ m.card1.h3 }}</div>
            <template v-for="(r, i) in m.card1.rows" :key="i">
              <div class="c">{{ r[0] }}</div><div class="c">{{ r[1] }}</div><div class="c em">{{ r[2] }}</div>
            </template>
          </div>
        </div>
      </div>

      <!-- 정보 02 (사진 첨부) -->
      <div class="info">
        <div class="ih"><span class="no">02</span><span class="it">{{ m.card2.title }}</span></div>
        <div class="ib ib-flex">
          <div style="flex:1;">
            <p style="margin-bottom:8px;">{{ m.card2.body }}</p>
            <div class="ex">{{ m.card2.example }}</div>
          </div>
          <div class="photo">
            <img v-if="m.card2.photo" :src="m.card2.photo" alt="보충 설명 사진">
            <span v-else class="ph">보충 설명 사진<br>(선택)</span>
          </div>
        </div>
      </div>

      <!-- 정보 03 (이웃 사례) -->
      <div class="casebox">
        <div class="row">
          <span class="cn">03</span>
          <div style="flex:1;">
            <div class="ct">{{ m.caseTitle }}</div>
            <div class="cb">{{ m.caseBody }}</div>
          </div>
        </div>
      </div>

      <!-- 마무리 상담 유도 -->
      <div class="closing" v-html="closingHtml"></div>
    </div>

    <!-- 푸터 -->
    <div class="bfoot">
      <div>
        <div class="nm">{{ m.bizName }} {{ m.bizType }}</div>
        <div class="cl">{{ m.repTitle }} <b>{{ m.repName }}</b><br>TEL <b>{{ m.phone1 }}</b> · {{ m.phone2 }}<br>{{ m.address }}<br>개설등록번호 {{ m.regNo }}</div>
      </div>
      <div class="qr" v-if="m.showQR">
        <div class="box"><span>QR</span></div>
        <div class="ql">단지 시세 바로보기</div>
      </div>
    </div>
  </div>
</template>

<script>
function esc(s) { return (s || '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])); }

export default {
  name: 'DmBackPage',
  props: { m: { type: Object, required: true } },
  computed: {
    // 마무리 문구의 첫 전화번호를 강조
    closingHtml() {
      return esc(this.m.closing).replace(/(\d{2,4}-\d{3,4}-\d{4})/, '<b>$1</b>');
    },
  },
};
</script>
