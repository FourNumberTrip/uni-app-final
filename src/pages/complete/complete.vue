<template>
  <view class="content">
    <view class="complete-content"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  },
  onLoad() {},
  methods: {},
};
</script>

<style lang="scss">
page {
  height: 100%;
  display: flex;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;

  .complete-content {
    flex: 1;
  }
}
</style>
