<template>
  <view class="content">
    <view
      class="list-content"
      :style="{ display: currentPage == 'list' ? 'flex' : 'none' }"
    >
      <view class="list">
        <view
          :class="[
            'list-item',
            listItemAnimationClasses[index].appearAnimationClass,
            listItemAnimationClasses[index].disappearAnimationClass,
          ]"
          @click="onListItemClick(index)"
          v-for="(item, index) in listItems"
          :key="index"
          :data-index="index"
        >
          <img class="image" :src="item.coverUrl" />
          <view class="translucent-box">
            <view class="title">
              <text>{{ item.title }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
let observer;
export default {
  data() {
    return {
      currentPage: "list",

      listItemAnimationClasses: new Array(10).fill().map((_) => ({
        appearAnimationClass: "list-item-out-bottom",
        disappearAnimationClass: "",
      })),
      listItems: [
        {
          coverUrl: "https://mp.muzi.fun/resources/py.png",
          title: "抛秧",
          description: "上身活动",
          animationSetId: 0,
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/cy.png",
          title: "插秧",
          description: "上身活动",
          animationSetId: 0,
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
        },
      ],
    };
  },
  onLoad() {},
  onReady() {
    // for scroll in animation
    observer = uni.createIntersectionObserver(this, {
      observeAll: true,
    });
    observer
      .relativeToViewport({
        bottom: 0,
      })
      .observe(".list-item", (res) => {
        console.log(res);
        if (res.intersectionRatio > 0) {
          // appear
          this.listItemAnimationClasses[
            res.dataset.index
          ].appearAnimationClass = "";
          // if (res.boundingClientRect.top < 0) {
          //   // appear from top
          // } else {
          //   // appear from bottom
          // }r
        } else {
          // disappear
          if (res.boundingClientRect.top < 0) {
            // disappear to top
            this.listItemAnimationClasses[
              res.dataset.index
            ].appearAnimationClass = "list-item-out-top";
          } else {
            // disappear to bottom
            this.listItemAnimationClasses[
              res.dataset.index
            ].appearAnimationClass = "list-item-out-bottom";
          }
        }
      });
  },
  onUnload() {
    if (observer) {
      observer.disconnect();
    }
  },
  methods: {
    onListItemClick(index) {
      for (let i = 0; i < this.listItems.length; i++) {
        if (i === index) {
          setTimeout(() => {
            this.listItemAnimationClasses[i].disappearAnimationClass =
              i % 2 === 0
                ? "list-item-fade-out-left"
                : "list-item-fade-out-right";
          }, 100);
        } else {
          this.listItemAnimationClasses[i].disappearAnimationClass =
            i % 2 === 0
              ? "list-item-fade-out-left"
              : "list-item-fade-out-right";
        }
      }

      setTimeout(() => {
        this.currentPage = "action";
      }, 600);

      // TODO set animation to selected list item
    },
  },
};
</script>

<style lang="scss">
$list-background-color: white;

page {
  height: 100%;
  display: flex;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;

  .list-content {
    flex: 1;
    background: $list-background-color;

    .list {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      width: 100%;

      .list-item {
        position: relative;
        width: 320rpx;
        height: 320rpx;
        border-radius: 30rpx;
        margin: 18rpx;
        box-shadow: rgba(0, 0, 0, 0.19) 0rpx 10rpx 20rpx,
          rgba(0, 0, 0, 0.23) 0rpx 6rpx 6rpx;

        transition: margin-top 600ms, margin-bottom 600ms, opacity 600ms,
          transform 200ms;

        @keyframes list-item-fade-out-left {
          from {
            transform: translateX(0%);
            opacity: 1;
          }
          to {
            transform: translateX(-100%);
            opacity: 0;
          }
        }

        @keyframes list-item-fade-out-right {
          from {
            transform: translateX(0%);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        &.list-item-fade-out-left {
          animation: list-item-fade-out-left 0.5s ease-out forwards;
        }

        &.list-item-fade-out-right {
          animation: list-item-fade-out-right 0.5s ease-out forwards;
        }

        .image {
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
          background: rgba(0, 0, 0, 0.25);

          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          .title {
            padding-top: 150rpx;
            font-size: 50rpx;
            color: #ffffff;
          }
        }
      }

      .list-item:active {
        pointer-events: none;
        transform: scale(0.96);
      }

      .list-item:hover {
        transform: scale(0.96);
      }

      .list-item-out-bottom {
        margin-top: 60rpx !important;
        opacity: 0;
      }

      .list-item-out-top {
        margin-bottom: 60rpx !important;
        opacity: 0;
      }
    }
  }
}
</style>
