<template>
  <view class="content">
    <view class="list">
      <view
        :class="['list-item', item.class]"
        @click="onListItemClick(index)"
        v-for="(item, index) in items"
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
</template>

<script>
let observer;
export default {
  data() {
    return {
      items: [
        {
          coverUrl: "/static/py.png",
          title: "抛秧",
          description: "上身活动",
          animationSetId: 0,
          // for animation
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/cy.png",
          title: "插秧",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
        },
        {
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          class: "list-item-out-bottom",
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
        if (res.intersectionRatio > 0) {
          // appear
          this.items[res.dataset.index].class = "";
          // if (res.boundingClientRect.top < 0) {
          //   // appear from top
          // } else {
          //   // appear from bottom
          // }r
        } else {
          // disappear
          if (res.boundingClientRect.top < 0) {
            // disappear to top
            this.items[res.dataset.index].class = "list-item-out-top";
          } else {
            // disappear to bottom
            this.items[res.dataset.index].class = "list-item-out-bottom";
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
      this.items[index].class = "list-item-expanding";
    },
  },
};
</script>

<style lang="scss">
$list-background-color: white;

.content {
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

// list item expanding animation when transitioning to the next page
@keyframes list-item-expanding-animation {
  from {
    z-index: 3;
    scale: 0.96;
  }
  to {
    z-index: 3;
    scale: 10;
  }
}
.list-item-expanding {
  animation: list-item-expanding-animation 400ms linear forwards;

  @keyframes list-item-content-hidden-animation {
    from {
      opacity: 1;
    }

    20% {
      opacity: 0;
    }

    to {
      opacity: 0;
    }
  }
  .list-item-content {
    animation: list-item-content-hidden-animation 400ms linear forwards;
  }
}
</style>
