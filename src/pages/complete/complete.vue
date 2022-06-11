<template>
  <view class="content">
    <view class="complete-content">
      <view class="top-placeholder"></view>
      <view class="checkmark-wrapper">
        <view class="checkmark checkmark-appear-animation"></view>
      </view>
      <view class="buttons">
        <view class="button restart-button restart-button-appear-animation"
          >重做</view
        >
        <view class="button back-button back-button-appear-animation"
          >返回</view
        >
      </view>
      <view class="bottom-placeholder"></view>
    </view>
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

$background-color: #f5f3f6;

$check-height: 200rpx;
$check-width: calc($check-height/2);
$check-left: calc($check-height/3) + calc($check-height/6);
$check-thickness: 20px;
$check-color: rgb(37, 255, 37);

$complete-animation-duration: 0.4s;

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
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    background: $background-color;

    .top-placeholder {
      flex: 2;
    }

    .checkmark-wrapper {
      flex: 1;
      width: $check-height;
      position: relative;

      .checkmark {
        @keyframes checkmark-appear-animation {
          0% {
            height: 0;
            width: 0;
          }
          50% {
            height: 0;
            width: $check-width;
          }
          100% {
            height: $check-height;
            width: $check-width;
          }
        }

        @keyframes checkmark-disappear-animation {
          0% {
            height: $check-height;
            width: $check-width;
          }
          50% {
            height: 0;
            width: $check-width;
          }
          99% {
            height: 0;
            width: 0;
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        &.checkmark-appear-animation:after {
          animation-duration: $complete-animation-duration;
          animation-timing-function: ease;
          animation-name: checkmark-appear-animation;
          transform: scaleX(-1) rotate(135deg);
        }

        &.checkmark-disappear-animation:after {
          animation-duration: $complete-animation-duration;
          animation-timing-function: ease;
          animation-name: checkmark-disappear-animation;
          animation-delay: $complete-animation-duration * 2;
          animation-fill-mode: forwards;
          transform: scaleX(-1) rotate(135deg);
        }

        &:after {
          height: $check-height;
          width: $check-width;
          transform-origin: left top;
          border-right: $check-thickness solid $check-color;
          border-top: $check-thickness solid $check-color;
          content: "";
          position: absolute;
        }
      }
    }

    .buttons {
      flex: 1;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;

      .button {
        width: 240rpx;
        height: 100rpx;
        background: white;
        border-radius: 50rpx;
        box-shadow: rgba(0, 0, 0, 0.19) 0rpx 6rpx 30rpx,
          rgba(0, 0, 0, 0.2) 0rpx 6rpx 6rpx;

        display: flex;
        justify-content: center;
        align-items: center;

        // font-weight: bold;
        font-size: 50rpx;
      }

      @keyframes button-appear-animation {
        from {
          opacity: 0;
          transform: scale(0);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes button-disappear-animation {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0);
        }
      }

      .restart-button {
        margin-right: 100rpx;
        opacity: 0;

        &.restart-button-appear-animation {
          animation: button-appear-animation $complete-animation-duration
            ease-out forwards;
          animation-delay: $complete-animation-duration;
        }

        &.restart-button-disappear-animation {
          animation: button-disappear-animation $complete-animation-duration
            ease-out forwards;
          animation-delay: $complete-animation-duration;
        }
      }

      .back-button {
        opacity: 0;

        &.back-button-appear-animation {
          animation: button-appear-animation $complete-animation-duration
            ease-out forwards;
          animation-delay: $complete-animation-duration * 2;
        }

        &.back-button-disappear-animation {
          animation: button-disappear-animation $complete-animation-duration
            ease-out forwards;
        }
      }
    }

    .bottom-placeholder {
      flex: 2;
    }
  }
}
</style>
