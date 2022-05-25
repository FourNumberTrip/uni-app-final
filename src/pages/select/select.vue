<template>
  <view class="content">
    <view class="list">
      <view
        class="list-item"
        style="flex-grow: 1; display: flex"
        v-for="(item, index) in items"
        :key="item.title"
        @tap="onTap(index)"
      >
        <image class="button-background-image" :src="item.image"> </image>
        <view class="translucent-box">
          <text class="button-title">{{ item.title }}</text>
          <text class="button-description">{{ item.description }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          image: "/static/warm-up.jpg",
          title: "热身动作",
          description:
            "热身运动是热身运动是热身运动是热身运动是热身运动是热身运动是热身运动是热身运动是热身运动",
        },
        {
          image: "/static/pain-spots.jpg",
          title: "疼痛缓解",
          description:
            "疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解",
        },
      ],
    };
  },
  onLoad() {},
  methods: {
    onTap(index) {},
  },
};
</script>
<style>
page {
  height: 100%;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.list-item {
  transition: all 200ms;
  touch-action: manipulation;
  flex-grow: 1;
  position: relative;
  margin: 20rpx;
}

.list-item:active {
  pointer-events: none;
  transform: scale(0.96);
}

.list-item:hover {
  transform: scale(0.96);
}

.button-background-image {
  z-index: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 30rpx;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
}

.translucent-box {
  z-index: 1;
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 30rpx;
  background: rgba(0, 0, 0, 0.7);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.button-title {
  font-size: 50rpx;
  color: #ffffff;
}

.button-description {
  margin: 30rpx 60rpx 0 60rpx;
  font-size: 30rpx;
  color: #ffffff;
}
</style>
