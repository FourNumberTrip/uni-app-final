<template>
  <view class="content">
    <view
      :class="['guide-content', `guide-content-animation-${guideStage}`]"
      :style="{ display: currentPage == 'guide' ? 'flex' : 'none' }"
    >
      <view :class="['guide-area', `guide-area-animation-${guideStage}`]">
        <view class="image-container">
          <img class="image" :src="guide.image" alt="" />
        </view>
        <view class="text">
          {{ guide.text }}
        </view>
      </view>
      <view class="button-area">
        <view
          :class="['button-anchor', `button-anchor-animation-${guideStage}`]"
        >
          <view
            :class="['button', `button-animation-${guideStage}`]"
            @click="onGuideButtonClick"
          >
            <view
              :class="[
                'button-arrow-white',
                'material-icon',
                `button-arrow-white-animation-${guideStage}`,
              ]"
              data-color="white"
              data-icon="chevron-right"
            ></view>
            <view
              :class="[
                'button-arrow-theme',
                'material-icon',
                `button-arrow-theme-animation-${guideStage}`,
              ]"
              data-color="theme"
              data-icon="chevron-right"
            ></view>
          </view>
        </view>
      </view>
      <view class="bottom-place-holder"></view>
    </view>

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
const guides = [
  {
    image: "https://mp.muzi.fun/resources/select-page.png",
    text: "选择准备活动或者疼痛的部位",
  },
  {
    image: "https://mp.muzi.fun/resources/list-page.png",
    text: "选择从事的活动",
  },
  {
    image: "https://mp.muzi.fun/resources/pain-page.png",
    text: "或者选择疼痛的部位",
  },
  {
    image: "https://mp.muzi.fun/resources/action-page.png",
    text: "学着一起做动作",
  },
];

export default {
  data() {
    return {
      // navigation
      // can be "guide", "select", "list", "pain", "action"
      currentPage: "guide",
      // guide
      guideStage: 0,
      guide: guides[0],

      // select
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
    onGuideButtonClick() {
      this.guideStage++;
      setTimeout(() => {
        this.guide = guides[this.guideStage];
      }, 500);

      if (this.guideStage >= 4) {
        setTimeout(() => {
          this.currentPage = "select";
        }, 500);
      }
    },
    onSelectButtonClick(index) {
      console.log("onClick", index);
      this.selectItems[index]._class = "list-item-expand";
      this.selectItems[1 - index]._class = "list-item-shrink";
    },
  },
};
</script>

<style lang="scss">
@import "@/lib/material-icons.scss";

// guide
$animation-duration: 0.8s;
$guide-button-size: 130rpx;
$guide-button-arrow-size: 0.5;
$guide-content-ratio: 7 2 2;

$theme-color: #000000;
// should be actually number of pages - 1
$guide-pages: 4;

// select
$select-background-color: #f3f5f8;

page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;

  @mixin guide-content-animation-keyframes($index, $colorFrom, $colorTo) {
    @if $index < $guide-pages {
      @keyframes guide-content-animation-#{$index} {
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
    } @else {
      // for page transitioning
      @keyframes guide-content-animation-#{$index} {
        0% {
          background: $colorFrom;
          animation-timing-function: steps(1, end);
        }

        100% {
          background: $colorFrom;
        }
      }
    }
  }

  @for $i from 1 through $guide-pages {
    @if $i % 2 == 1 {
      @include guide-content-animation-keyframes($i, white, $theme-color);
    } @else {
      @include guide-content-animation-keyframes($i, $theme-color, white);
    }
    .guide-content-animation-#{$i} {
      animation-name: guide-content-animation-#{$i};
      animation-duration: $animation-duration;
      animation-fill-mode: forwards;
    }
  }

  .guide-content {
    flex: 1;
    display: flex;
    flex-direction: column;

    @mixin guide-area-animation-keyframes($index, $disappear-percentage) {
      @if $index < $guide-pages {
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
      } @else {
        // for page transitioning
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

          100% {
            transform: translateX(-300rpx);
            opacity: 0%;
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

      .button-anchor {
        display: flex;
        width: $guide-button-size;
        height: $guide-button-size;
        justify-content: center;
        align-items: center;

        @mixin button-animation-keyframes($index, $colorFrom, $colorTo) {
          @if $index < $guide-pages {
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
          } @else {
            @keyframes button-animation-#{$index} {
              0% {
                width: $guide-button-size;
                height: $guide-button-size;
                margin-right: 0rpx;
                background: $colorFrom;
                animation-timing-function: cubic-bezier(0.18, 0.55, 0.43, 0.81);
              }

              100% {
                width: 4000rpx;
                height: 4000rpx;
                background: $colorFrom;
              }
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

        .button {
          width: $guide-button-size;
          height: $guide-button-size;
          position: absolute;
          border-radius: 50%;
          background: $theme-color;

          display: flex;
          justify-content: center;
          align-items: center;

          @mixin button-arrow-animation-keyframes(
            $index,
            $disappear-percentage
          ) {
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

  .select-content {
    flex: 1;
    display: flex;
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

      .list-item-fade-in-from-top {
        animation: list-item-fade-in-from-top 0.8s ease-out;
      }

      .list-item-fade-in-from-bottom {
        animation: list-item-fade-in-from-bottom 0.8s ease-out;
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
}
</style>
