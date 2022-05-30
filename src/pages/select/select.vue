<template>
  <view class="content">
    <view class="list">
      <view
        :class="['list-item', item._class]"
        v-for="(item, index) in items"
        :key="item.title"
        @click="onClick(index)"
      >
        <view class="list-item-content">
          <image class="button-background-image" :src="item.image"> </image>
          <view class="translucent-box">
            <text class="button-title">{{ item.title }}</text>
            <text class="button-description">{{ item.description }}</text>
          </view>
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
          _class: "",
        },
        {
          image: "/static/pain-spots.jpg",
          title: "疼痛缓解",
          description:
            "疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解",
          _class: "",
        },
      ],
    };
  },
  onLoad() {},
  methods: {
    onClick(index) {
      console.log("onClick", index);
      this.items[index]._class = "list-item-expand";
      this.items[1 - index]._class = "list-item-shrink";
    },
  },
};
</script>
<style lang="scss">
$select-background-color: #f3f5f8;

page {
  height: 100%;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $select-background-color;

  .list {
    flex: 1;
    display: flex;
    flex-direction: column;

    .list-item:active {
      pointer-events: none;
      transform: scale(0.96);
    }

    .list-item:hover {
      transform: scale(0.96);
    }

    .list-item-expand {
      margin: 0rpx !important;
      border-radius: 0rpx !important;
      opacity: 0%;

      .list-item-content {
        .button-background-image {
          border-radius: 0rpx !important;
        }

        .translucent-box {
          border-radius: 0rpx !important;
        }
      }
    }

    .list-item-shrink {
      flex: 0 !important;
      margin: 0rpx !important;
      border-radius: 0rpx !important;
      opacity: 0%;
    }

    .list-item {
      flex: 1;
      display: flex;

      transition: all 0.5s;
      position: relative;
      margin: 20rpx;
      border-radius: 30rpx;
      box-shadow: rgba(0, 0, 0, 0.19) 0rpx 20rpx 40rpx,
        rgba(0, 0, 0, 0.23) 0rpx 12rpx 12rpx;

      touch-action: manipulation;

      .list-item-content {
        flex: 1;

        .button-background-image {
          z-index: 0;
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 30rpx;
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

          .button-title {
            font-size: 50rpx;
            color: #ffffff;
          }

          .button-description {
            margin: 30rpx 60rpx 0 60rpx;
            font-size: 30rpx;
            color: #ffffff;
          }
        }
      }
    }
  }
}
</style>
