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
        <view class="list-item-content">
          <view class="placeholder"></view>
          <view class="image-container">
            <img class="cover-image" :src="item.coverUrl" />
          </view>
          <view class="text">
            <text>{{ item.title + index }}</text>
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
          coverUrl: "/static/logo.png",
          title: "上身活动",
          description: "上身活动",
          animationSetId: 0,
          // for animation
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
$list-background-color: #f3f5f8;
$list-item-card-color: white;

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
      display: flex;
      width: 330rpx;
      height: 330rpx;
      background: $list-item-card-color;
      border-radius: 20rpx;
      margin: 12rpx;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;

      transition: margin-top 600ms, margin-bottom 600ms, opacity 600ms,
        transform 200ms;

      .list-item-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .placeholder {
          flex: 1;
        }

        .image-container {
          flex: 1;
          .cover-image {
            width: 200rpx;
            height: 200rpx;
          }
        }

        .text {
          flex: 2;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 36rpx;
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
    scale: 0.96;
  }
  to {
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
