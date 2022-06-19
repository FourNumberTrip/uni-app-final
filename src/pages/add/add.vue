<template>
  <view class="content">
    <view
      class="add-content"
      :style="{ display: currentPage == 'add' ? 'flex' : 'none' }"
    >
      <view :class="['canvas-container', canvasContainerAnimationClass]">
        <canvas type="2d" id="canvas" class="canvas"></canvas>
        <view v-if="analyzeProgress > 0" class="progress-bar">
          <view
            class="progress"
            :style="{
              width: `${Math.round(analyzeProgress * 100)}%`,
            }"
          ></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { Keypoint, PoseDetector } from "@tensorflow-models/pose-detection";
import { analyzeKeypointsList } from "@/ts/pose-analysis";
import { getPoseDetector, estimateFrame } from "@/ts/pose-detection";
import { VideoDecoder } from "@/ts/video-decoder";
import { drawPose } from "@/ts/utils/canvas";
import { sleep } from "@/ts/utils/misc";

export default {
  data() {
    return {
      currentPage: "add",
      canvasContainerAnimationClass: "",
      analyzeProgress: 0,
    };
  },
  onLoad() {
    this.add();
  },
  methods: {
    async add() {
      const videoFileInfo = await wx.chooseMedia({
        count: 1,
        mediaType: ["video"],
      });
      console.log(videoFileInfo);
      // duration in ms
      const videoDuration = videoFileInfo.tempFiles[0].duration * 1000;
      const canvas = await new Promise((resolve, _) => {
        wx.createSelectorQuery()
          .select("#canvas")
          .fields({ node: true, size: true })
          .exec((res) => {
            resolve(res[0].node);
          });
      });

      const activityNamePromise = wx.showModal({
        title: "给您的视频取一个好记名字吧",
        showCancel: false,
        editable: true,
      });

      const detectorPromise = getPoseDetector();
      const videoDecoder = new VideoDecoder(
        videoFileInfo.tempFiles[0].tempFilePath
      );

      // ! the name of the activity
      /** @type { string } */
      let activityName;

      let firstFrame = true;
      /** @type { PoseDetector } */
      let detector;
      /** @type { Keypoint[][] } */
      const keypointsList = [];
      for await (const frame of videoDecoder.getFrames()) {
        if (firstFrame) {
          firstFrame = false;
          const activityName = (await activityNamePromise).content;
          wx.showLoading({
            title: "加载模型中",
          });
          detector = await detectorPromise;
          wx.hideLoading();
        }

        const keypoints = await estimateFrame(detector, frame);
        keypointsList.push(keypoints);

        await drawPose(canvas, frame, keypoints);

        this.analyzeProgress = frame.pkPts / videoDuration;
      }
      this.analyzeProgress = 1;

      const actionList = analyzeKeypointsList(keypointsList);
      const activity = {
        // ! TODO upload this image to cloud and replace url
        coverUrl: videoFileInfo.tempFiles[0].thumbTempFilePath,
        title: activityName,
        animations: actionList,
      };

      wx.showToast({
        title: "分析完成",
        icon: "success",
        duration: 2000,
      });

      await sleep(2000);

      this.canvasContainerAnimationClass =
        "canvas-container-disappear-animation";
      setTimeout(() => {
        this.currentPage = "list";
      }, 500);
    },
  },
};
</script>

<style lang="scss">
page {
  height: 100%;
  display: flex;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;

  .add-content {
    flex: 1;
    display: flex;

    .canvas-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      @keyframes canvas-container-disappear-animation {
        from {
          opacity: 1;
        }

        to {
          opacity: 0;
        }
      }

      &.canvas-container-disappear-animation {
        animation: canvas-container-disappear-animation 0.5s ease-in-out
          forwards;
      }

      .canvas {
        flex: 18;
        width: 100%;
      }

      .progress-bar {
        flex: 1;
        width: 100%;
        border-radius: 5rpx;
        border: 1rpx solid rgb(223, 223, 223);
        margin: 5rpx 5rpx;

        .progress {
          background: #808080;
          border-radius: 5rpx;
          transition: width 1s;
          height: 100%;
          float: left;
        }
      }
    }
  }
}
</style>
