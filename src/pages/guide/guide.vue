<template>
  <view :class="['content', `content-animation-${stage}`]">
    <view class="text-area">
      <view class="text">
        介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍
      </view>
    </view>
    <view class="button-area">
      <view :class="['button-anchor', `button-anchor-animation-${stage}`]">
        <view
          :class="['button', `button-animation-${stage}`]"
          @click="onButtonClick"
        >
        </view>
        <!-- the wrapper is for keep the icon transparent but the shadow visible -->
        <view class="button-arrow-wrapper">
          <view
            class="button-arrow material-icon"
            data-color="black"
            data-icon="chevron-right"
          ></view
        ></view>
      </view>
    </view>
    <view class="bottom-place-holder"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      stage: 0,
    };
  },
  onLoad() {},
  methods: {
    onButtonClick() {
      this.stage++;
    },
  },
};
</script>

<style lang="scss">
@import "@/lib/material-icons.scss";

$animation-duration: 1s;
$guide-button-size: 130rpx;
$guide-button-arrow-size: 0.6;
$guide-main-color: #03a9f4; 

page {
  height: 100%;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: green;

  .text-area {
    flex-grow: 7;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .text {
      width: 400rpx;
      height: 400rpx;
      visibility: hidden;
    }
  }

  .button-area {
    flex-grow: 2;
    display: flex;
    justify-content: center;
    align-items: center;

    .button-anchor {
      display: flex;
      width: $guide-button-size;
      height: $guide-button-size;
      justify-content: center;
      align-items: center;

      .button {
        width: $guide-button-size;
        height: $guide-button-size;
        position: absolute;
        border-radius: 50%;
        background: yellow;
      }

      @include material-icon(
        "black",
        #000000,
        "chevron-right",
        $material-icon-chevron-right
      );
      .button-arrow-wrapper {
        position: absolute;
        pointer-events: none;
        color: transparent;

        .button-arrow {
          pointer-events: none;
          padding-top: 10rpx;
          width: $guide-button-size * $guide-button-arrow-size;
          box-shadow: green 0 0 0 0;
        }
      }
    }
  }

  .bottom-place-holder {
    flex-grow: 2;
  }
}

@mixin content-animation-keyframes($index, $colorFrom, $colorTo) {
  @keyframes content-animation-#{$index} {
    0% {
      background: $colorFrom;
      animation-timing-function: steps(1, end);
    }

    50% {
      background: $colorTo;
    }

    100% {
      background: $colorTo;
    }
  }
}

@include content-animation-keyframes(1, green, yellow);
@include content-animation-keyframes(2, yellow, cyan);
@include content-animation-keyframes(3, cyan, blue);
@include content-animation-keyframes(4, blue, purple);

@for $i from 1 through 4 {
  .content-animation-#{$i} {
    animation-name: content-animation-#{$i};
    animation-duration: $animation-duration;
    animation-fill-mode: forwards;
  }
}

@mixin button-animation-keyframes($index, $colorFrom, $colorTo) {
  @keyframes button-animation-#{$index} {
    0% {
      width: $guide-button-size;
      height: $guide-button-size;
      margin-left: 0rpx;
      margin-right: 0rpx;
      background: $colorFrom;
      animation-timing-function: cubic-bezier(1, 0, 1, 0);
    }

    50% {
      width: 200000rpx + $guide-button-size;
      height: 200000rpx + $guide-button-size;
      margin-left: 200000rpx;
      margin-right: 0rpx;
      background: $colorFrom;
    }

    50% {
      width: 200000rpx + $guide-button-size;
      height: 200000rpx + $guide-button-size;
      margin-left: 0rpx;
      margin-right: 200000rpx + $guide-button-size * 2;
      background: $colorTo;
      animation-timing-function: cubic-bezier(0, 1, 0, 1);
    }

    100% {
      width: $guide-button-size;
      height: $guide-button-size;
      margin-left: 0rpx;
      margin-right: $guide-button-size * 2;
      background: $colorTo;
    }
  }
}

@include button-animation-keyframes(1, yellow, green);
@include button-animation-keyframes(2, green, cyan);
@include button-animation-keyframes(3, cyan, blue);
@include button-animation-keyframes(4, blue, purple);

@for $i from 1 through 4 {
  .button-animation-#{$i} {
    animation-name: button-animation-#{$i};
    animation-duration: $animation-duration;
    animation-fill-mode: forwards;
  }
}

@mixin button-anchor-animation-keyframes($index) {
  @keyframes button-anchor-animation-#{$index} {
    0% {
      margin-left: 0rpx;
    }

    50% {
      margin-left: 0rpx;
      animation-timing-function: ease-in;
    }

    100% {
      margin-left: $guide-button-size * 2;
    }
  }
}

@for $i from 1 through 4 {
  @include button-anchor-animation-keyframes($i);
  .button-anchor-animation-#{$i} {
    animation-name: button-anchor-animation-#{$i};
    animation-duration: $animation-duration;
    animation-fill-mode: forwards;
  }
}



</style>
