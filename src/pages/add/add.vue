<template>
  <view class="content">
    <view
      class="add-content"
      :style="{ display: currentPage == 'add' ? 'flex' : 'none' }"
    >
      <view v-if="report.length > 0">
        <view class="report" v-for="(i, index) in report" :key="index">
          <text>{{ i.name }}: {{ i.std }}</text>
        </view>
      </view>
      <canvas type="2d" id="canvas" style="width: 100vw; height: 90vh"></canvas>
    </view>
  </view>
</template>

<script>
import { Keypoint, PoseDetector } from "@tensorflow-models/pose-detection";
import { analyzeKeypointsList } from "@/ts/pose-analysis";
import { getPoseDetector, estimateFrame } from "@/ts/pose-detection";
import { VideoDecoder } from "@/ts/video-decoder";
import { drawPose } from "@/ts/utils/canvas";

export default {
  data() {
    return {
      currentPage: "add",
      /** @type { {name: string, std: number}[] } */
      report: [],
    };
  },
  async onLoad() {
    const videoFileInfo = await wx.chooseMedia({
      count: 1,
      mediaType: ["video"],
    });
    const canvas = await new Promise((resolve, _) => {
      wx.createSelectorQuery()
        .select("#canvas")
        .fields({ node: true, size: true })
        .exec((res) => {
          resolve(res[0].node);
        });
    });

    wx.showLoading({
      title: "加载视频中",
    });

    const detectorPromise = getPoseDetector();
    const videoDecoder = new VideoDecoder(
      videoFileInfo.tempFiles[0].tempFilePath
    );

    let firstFrame = true;
    /** @type { PoseDetector } */
    let detector;
    /** @type { Keypoint[][] } */
    const keypointsList = [];
    for await (const frame of videoDecoder.getFrames()) {
      if (firstFrame) {
        firstFrame = false;
        wx.showLoading({
          title: "加载模型中",
        });
        detector = await detectorPromise;
        wx.hideLoading();
      }

      const keypoints = await estimateFrame(detector, frame);
      keypointsList.push(keypoints);

      await drawPose(canvas, frame, keypoints);
    }
    this.report = analyzeKeypointsList(keypointsList);
  },
  methods: {},
};
</script>

<style>
</style>
