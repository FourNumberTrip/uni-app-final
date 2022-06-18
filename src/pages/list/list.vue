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
        <view
          :class="['list-item', 'add-button', addButtonAnimationClass]"
          @click="onAddButtonClick"
        >
          <view class="cross-container">
            <view class="horizontal-line"> </view>
            <view class="vertical-line"> </view>
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

      // ! be aware that if you put an object in fill(), the array will full of the same object (references to the same object).
      listItemAnimationClasses: new Array(10).fill().map((_) => ({
        appearAnimationClass: "list-item-out-bottom",
        disappearAnimationClass: "",
      })),
      addButtonAnimationClass: "",
      listItems: [
        {
          coverUrl: "https://mp.muzi.fun/resources/images/list/ym.webp",
          title: "育苗",
          animations: [
            { id: "124", loopTimes: 8 },
            { id: "120", loopTimes: 8 },
          ],
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/images/list/cy.webp",
          title: "插秧",
          animations: [
            { id: "119", loopTimes: 8 },
            { id: "121", loopTimes: 8 },
            { id: "118", loopTimes: 8 },
            { id: "123", loopTimes: 8 },
          ],
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/images/list/by.webp",
          title: "拔秧",
          animations: [
            { id: "118", loopTimes: 8 },
            { id: "121", loopTimes: 8 },
            { id: "122", loopTimes: 8 },
            { id: "123", loopTimes: 8 },
          ],
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/images/list/py.webp",
          title: "抛秧",
          animations: [
            { id: "124", loopTimes: 8 },
            { id: "120", loopTimes: 8 },
          ],
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/images/list/sg.webp",
          title: "收割",
          animations: [
            { id: "119", loopTimes: 8 },
            { id: "121", loopTimes: 8 },
            { id: "118", loopTimes: 8 },
            { id: "125", loopTimes: 8 },
          ],
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/images/list/yz.webp",
          title: "移栽",
          animations: [
            { id: "119", loopTimes: 8 },
            { id: "121", loopTimes: 8 },
            { id: "118", loopTimes: 8 },
            { id: "123", loopTimes: 8 },
          ],
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/images/list/dh.webp",
          title: "点花",
          animations: [
            { id: "119", loopTimes: 8 },
            { id: "122", loopTimes: 8 },
            { id: "125", loopTimes: 8 },
          ],
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/images/list/dm.webp",
          title: "吊蔓",
          animations: [
            { id: "119", loopTimes: 8 },
            { id: "122", loopTimes: 8 },
            { id: "125", loopTimes: 8 },
          ],
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/images/list/td.webp",
          title: "挑担",
          animations: [
            { id: "119", loopTimes: 8 },
            { id: "122", loopTimes: 8 },
            { id: "125", loopTimes: 8 },
          ],
        },
        {
          coverUrl: "https://mp.muzi.fun/resources/images/list/psny.webp",
          title: "喷洒农药",
          animations: [
            { id: "120", loopTimes: 8 },
            { id: "125", loopTimes: 8 },
          ],
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

      this.addButtonAnimationClass = "add-button-fade-out";

      setTimeout(() => {
        this.currentPage = "action";
      }, 600);

      // TODO set animation to selected list item
    },
    onAddButtonClick() {
      wx.showModal({
        title: "提示",
        content: "请录制一段小于十秒的视频",
        success: function (res) {
          if (res.confirm) {
            // !
          }
        },
      });
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

      .add-button {
        background: #dedede;
        display: flex;
        justify-content: center;
        align-items: center;

        @keyframes add-button-fade-out {
          from {
            transform: scale(1);
            opacity: 1;
          }

          70% {
            transform: scale(0.5);
            opacity: 0;
          }

          to {
            transform: scale(0);
            opacity: 0;
          }
        }

        &.add-button-fade-out {
          animation: add-button-fade-out 0.5s ease-out forwards;
        }

        .cross-container {
          height: 40%;
          width: 40%;

          display: flex;
          justify-content: center;
          align-items: center;

          position: relative;

          .horizontal-line {
            position: absolute;
            width: 100%;
            height: 20rpx;
            background: white;
          }
          .vertical-line {
            position: absolute;
            width: 20rpx;
            height: 100%;
            background: white;
          }
        }
      }
    }
  }
}
</style>
