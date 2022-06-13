<template>
  <view class="content">
    <view
      class="select-content"
      :style="{ display: currentPage == 'select' ? 'flex' : 'none' }"
    >
      <view class="list">
        <view
          :class="[
            'list-item',
            item._class,
            index === 0
              ? 'list-item-fade-in-from-top'
              : 'list-item-fade-in-from-bottom',
          ]"
          v-for="(item, index) in selectItems"
          :key="item.title"
          @click="onSelectButtonClick(index)"
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
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentPage: "select",
      selectItems: [
        {
          image: "https://mp.muzi.fun/resources/warm-up.jpg",
          title: "热身动作",
          description:
            "热身运动是热身运动是热身运动是热身运动是热身运动是热身运动是热身运动是热身运动是热身运动",
          _class: "",
        },
        {
          image: "https://mp.muzi.fun/resources/pain-spots.jpg",
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
    onSelectButtonClick(index) {
      setTimeout(() => {
        this.currentPage = ["list", "pain"][index];
      }, 500);

      this.selectItems[index]._class = "list-item-expand";
      this.selectItems[1 - index]._class = "list-item-shrink";
    },
  },
};
</script>
<style lang="scss">
$select-background-color: #f3f5f8;

page {
  height: 100%;
  display: flex;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;

  .select-content {
    flex: 1;
    display: flex;
    background: $select-background-color;

    .list {
      flex: 1;
      display: flex;
      flex-direction: column;

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

        @keyframes list-item-fade-in-from-top {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0%);
            opacity: 1;
          }
        }

        @keyframes list-item-fade-in-from-bottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0%);
            opacity: 1;
          }
        }

        &.list-item-fade-in-from-top {
          animation: list-item-fade-in-from-top 0.8s ease-out;
        }

        &.list-item-fade-in-from-bottom {
          animation: list-item-fade-in-from-bottom 0.8s ease-out;
        }

        &.list-item:active {
          pointer-events: none;
          transform: scale(0.96);
        }

        &.list-item:hover {
          transform: scale(0.96);
        }

        &.list-item-expand {
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

        &.list-item-shrink {
          flex: 0 !important;
          margin: 0rpx !important;
          border-radius: 0rpx !important;
          opacity: 0%;
        }

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
}
</style>
