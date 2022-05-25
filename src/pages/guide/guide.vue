<template>
  <view :class="['content', `content-animation-${stage}`]">
    <view class="text-area">
      <view class="text">
        介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍
      </view>
    </view>
    <view class="button-area">
      <view class="button-anchor">
        <view
          :class="['button', `button-animation-${stage}`]"
          @click="onButtonClick"
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
page {
  height: 100%;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: green;

  .text-area {
    flex-grow: 8;
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
    /* background: yellow; */
    display: flex;
    justify-content: center;
    align-items: center;

    .button-anchor {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;

      .button {
        width: 130rpx;
        height: 130rpx;
        position: absolute;
        border-radius: 50%;
        background: yellow;
      }
    }
  }

  .bottom-place-holder {
    flex-grow: 1;
  }
}

@mixin content-animation-keyframes($index, $colorFrom, $colorTo, $step: 40%) {
  @keyframes content-animation-#{$index} {
    0% {
      background: $colorFrom;
      animation-timing-function: steps(1, end);
    }

    #{$step} {
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
    animation-duration: 1s;
    animation-fill-mode: forwards;
  }
}

@mixin button-animation-keyframes($index, $colorFrom, $colorTo, $step: 40%) {
  @keyframes button-animation-#{$index} {
    0% {
      width: 130rpx;
      height: 130rpx;
      margin-left: 0rpx;
      margin-right: 0rpx;
      background: $colorFrom;
      animation-timing-function: cubic-bezier(1, 0, 1, 0);
    }

    #{$step} {
      width: 200130rpx;
      height: 200130rpx;
      margin-left: 200000rpx;
      margin-right: 0rpx;
      background: $colorFrom;
    }

    #{$step} {
      width: 200130rpx;
      height: 200130rpx;
      margin-left: 0rpx;
      margin-right: 200260rpx;
      background: $colorTo;
      animation-timing-function: cubic-bezier(0, 1, 0, 1);
    }

    #{$step * 2} {
      width: 130rpx;
      height: 130rpx;
      margin-left: 0rpx;
      margin-right: 260rpx;
      animation-timing-function: linear;
    }

    100% {
      width: 130rpx;
      height: 130rpx;
      margin-left: 0rpx;
      margin-right: 0rpx;
      background: $colorTo;
    }

    100% {

    }
  }
}

@include button-animation-keyframes(1, yellow, green);
@include button-animation-keyframes(2, green, cyan);
@include button-animation-keyframes(3, cyan, blue);
@include button-animation-keyframes(4, blue , purple);

@for $i from 1 through 4 {
  .button-animation-#{$i} {
    animation-name: button-animation-#{$i};
    animation-duration: 1s;
    animation-fill-mode: forwards;
  }
}

</style>
