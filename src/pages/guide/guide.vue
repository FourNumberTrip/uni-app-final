<template>
  <view :class="['content', `content-animation-${stage}`]">
    <view :class="['guide-area', `guide-area-animation-${stage}`]">
      <view class="image-container">
        <img class="image" :src="guide.image" alt=""
      /></view>
      <view class="text">
        {{ guide.text }}
      </view>
    </view>
    <view class="button-area">
      <view :class="['button-anchor', `button-anchor-animation-${stage}`]">
        <view
          :class="['button', `button-animation-${stage}`]"
          @click="onButtonClick"
        >
          <view
            :class="[
              'button-arrow-white',
              'material-icon',
              `button-arrow-white-animation-${stage}`,
            ]"
            data-color="white"
            data-icon="chevron-right"
          ></view>
          <view
            :class="[
              'button-arrow-theme',
              'material-icon',
              `button-arrow-theme-animation-${stage}`,
            ]"
            data-color="theme"
            data-icon="chevron-right"
          ></view>
        </view>
      </view>
    </view>
    <view class="bottom-place-holder"></view>
  </view>
</template>

<script>
const guides = [
  {
    image: "/static/select-page.png",
    text: "选择准备活动或者疼痛的部位",
  },
  {
    image: "/static/list-page.png",
    text: "选择从事的活动",
  },
  {
    image: "/static/pain-page.png",
    text: "或者选择疼痛的部位",
  },
  {
    image: "/static/action-page.png",
    text: "学着一起做动作",
  },
];

export default {
  data() {
    return {
      stage: 0,
      guide: guides[0],
    };
  },
  onLoad() {},
  methods: {
    onButtonClick() {
      this.stage++;
      setTimeout(() => {
        this.guide = guides[this.stage];
      }, 500);
    },
  },
};
</script>

<style lang="scss">
@import "@/lib/material-icons.scss";

$animation-duration: 0.8s;
$guide-button-size: 130rpx;
$guide-button-arrow-size: 0.6;
$guide-content-ratio: 7 2 2;

$theme-color: #000000;
$guide-pages: 4;

page {
  height: 100%;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;

  .guide-area {
    flex-grow: nth($guide-content-ratio, 1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .image-container {
      flex: 4;
      display: flex;
      justify-content: center;
      align-items: center;

      .image {
        border-radius: 40rpx;
        width: 400rpx;
        height: 600rpx;
      }
    }

    .text {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 40rpx;
      width: 80%;
    }
  }

  .button-area {
    flex-grow: nth($guide-content-ratio, 2);
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
        background: $theme-color;

        display: flex;
        justify-content: center;
        align-items: center;

        @include material-icon(
          "white",
          #ffffff,
          "chevron-right",
          $material-icon-chevron-right
        );
        .button-arrow-white {
          // we use absolute position because we need to stack two arrows on top of each other
          position: absolute;
          padding-top: 10rpx;
          width: $guide-button-size * $guide-button-arrow-size;

          opacity: 100%;
        }

        @include material-icon(
          "theme",
          $theme-color,
          "chevron-right",
          $material-icon-chevron-right
        );
        .button-arrow-theme {
          position: absolute;
          padding-top: 10rpx;
          width: $guide-button-size * $guide-button-arrow-size;

          opacity: 0%;
        }
      }
    }
  }

  .bottom-place-holder {
    flex-grow: nth($guide-content-ratio, 3);
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

@for $i from 1 through $guide-pages {
  @if $i % 2 == 1 {
    @include content-animation-keyframes($i, white, $theme-color);
  } @else {
    @include content-animation-keyframes($i, $theme-color, white);
  }
  .content-animation-#{$i} {
    animation-name: content-animation-#{$i};
    animation-duration: $animation-duration;
    animation-fill-mode: forwards;
  }
}

@mixin guide-area-animation-keyframes($index, $disappear-percentage) {
  @if $index % 2 == 1 {
    @keyframes guide-area-animation-#{$index} {
      0% {
        transform: translateX(0rpx);
        opacity: 100%;
        animation-timing-function: linear;
        color: black;
      }

      #{$disappear-percentage} {
        transform: translateX(-300rpx);
        opacity: 0%;
        color: black;
      }

      #{100% - $disappear-percentage} {
        transform: translateX(300rpx);
        opacity: 0%;
        animation-timing-function: linear;
        color: white;
      }

      100% {
        transform: translateX(0rpx);
        opacity: 100%;
        color: white;
      }
    }
  } @else {
    @keyframes guide-area-animation-#{$index} {
      0% {
        transform: translateX(0rpx);
        opacity: 100%;
        animation-timing-function: linear;
        color: white;
      }

      #{$disappear-percentage} {
        transform: translateX(-300rpx);
        opacity: 0%;
        color: white;
      }

      #{100% - $disappear-percentage} {
        transform: translateX(300rpx);
        opacity: 0%;
        animation-timing-function: linear;
        color: black;
      }

      100% {
        transform: translateX(0rpx);
        opacity: 100%;
        color: black;
      }
    }
  }
}

@for $i from 1 through $guide-pages {
  @include guide-area-animation-keyframes($i, 14%);

  .guide-area-animation-#{$i} {
    animation-name: guide-area-animation-#{$i};
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

@for $i from 1 through $guide-pages {
  @if $i % 2 == 1 {
    @include button-animation-keyframes($i, $theme-color, white);
  } @else {
    @include button-animation-keyframes($i, white, $theme-color);
  }
  .button-animation-#{$i} {
    animation-name: button-animation-#{$i};
    animation-duration: $animation-duration;
    animation-fill-mode: forwards;
  }
}

// this is for the latter half of the animation of the button
// we need to push the button to the right in a linear fasion
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

@for $i from 1 through $guide-pages {
  @include button-anchor-animation-keyframes($i);
  .button-anchor-animation-#{$i} {
    animation-name: button-anchor-animation-#{$i};
    animation-duration: $animation-duration;
    animation-fill-mode: forwards;
  }
}

@mixin button-arrow-animation-keyframes($index, $disappear-percentage) {
  @if $index % 2 == 1 {
    @keyframes button-arrow-white-animation-#{$index} {
      0% {
        opacity: 100%;
        animation-timing-function: linear;
      }

      #{$disappear-percentage} {
        opacity: 0%;
      }

      100% {
        opacity: 0%;
      }
    }
  } @else {
    @keyframes button-arrow-white-animation-#{$index} {
      0% {
        opacity: 0%;
      }

      #{100% - $disappear-percentage} {
        opacity: 0%;
        animation-timing-function: linear;
      }

      100% {
        opacity: 100%;
      }
    }
  }

  @if $index % 2 == 0 {
    @keyframes button-arrow-theme-animation-#{$index} {
      0% {
        opacity: 100%;
        animation-timing-function: linear;
      }

      #{$disappear-percentage} {
        opacity: 0%;
      }

      100% {
        opacity: 0%;
      }
    }
  } @else {
    @keyframes button-arrow-theme-animation-#{$index} {
      0% {
        opacity: 0%;
      }

      #{100% - $disappear-percentage} {
        opacity: 0%;
        animation-timing-function: linear;
      }

      100% {
        opacity: 100%;
      }
    }
  }
}

@for $i from 1 through $guide-pages {
  @include button-arrow-animation-keyframes($i, 14%);
  .button-arrow-white-animation-#{$i} {
    animation-name: button-arrow-white-animation-#{$i};
    animation-duration: $animation-duration;
    animation-fill-mode: forwards;
  }
  .button-arrow-theme-animation-#{$i} {
    animation-name: button-arrow-theme-animation-#{$i};
    animation-duration: $animation-duration;
    animation-fill-mode: forwards;
  }
}
</style>
