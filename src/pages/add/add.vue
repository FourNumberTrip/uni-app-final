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
import { readFile, writeFile, removeFile } from "@/js/utils/file";
import { getPoseDetector, wxFrameData2DetectorInput } from "@/js/utils/tfjs";
import { requestFile } from '@/js/utils/network';

const LINES = [
  // nose - left eye
  [0, 1],
  // nose - right eye
  [0, 2],
  // left eye - left ear
  [1, 3],
  // right eye - right ear
  [2, 4],
  // left shoulder - right shoulder
  [5, 6],
  // left shoulder - left elbow
  [5, 7],
  // left elbow - left wrist
  [7, 9],
  // right shoulder - right elbow
  [6, 8],
  // right elbow - right wrist
  [8, 10],
  // left shoulder - left hip
  [5, 11],
  // right shoulder - right hip
  [6, 12],
  // left hip - right hip
  [11, 12],
  // left hip - left knee
  [11, 13],
  // left knee - left ankle
  [13, 15],
  // right hip - right knee
  [12, 14],
  // right knee - right ankle
  [14, 16],
];

let detector;

export default {
  data() {
    return {
      currentPage: "add",
      report: [],
    };
  },
  async onLoad() {
    // ! uncommment those to test when user haven't downloaded the model file

    // await removeFile(`${wx.env.USER_DATA_PATH}/modelTopology.json`);
    // await removeFile(`${wx.env.USER_DATA_PATH}/weightSpecs.json`);
    // await removeFile(`${wx.env.USER_DATA_PATH}/weightData.bin`);

    let modelTopology;
    let weightSpecs;
    let weightData;

    // maybe we can use Promise.all to open and load all the files at once
    // but not sure if wechat is happy about that
    try {
      modelTopology = JSON.parse(
        // @ts-ignore
        await readFile(`${wx.env.USER_DATA_PATH}/modelTopology.json`, "utf8")
      );
      weightSpecs = JSON.parse(
        // @ts-ignore
        await readFile(`${wx.env.USER_DATA_PATH}/weightSpecs.json`, "utf8")
      );
      weightData = await readFile(
        `${wx.env.USER_DATA_PATH}/weightData.bin`,
        undefined
      );
    } catch (_) {
      [modelTopology, weightSpecs, weightData] = await Promise.all([
        requestFile(
          "https://mp.muzi.fun/resources/ml-models/movenet-lightning-int8/modelTopology.json",
          "text"
        ),
        requestFile(
          "https://mp.muzi.fun/resources/ml-models/movenet-lightning-int8/weightSpecs.json",
          "text"
        ),
        requestFile(
          "https://mp.muzi.fun/resources/ml-models/movenet-lightning-int8/weightData.bin",
          "arraybuffer"
        ),
      ]);

      await writeFile(
        `${wx.env.USER_DATA_PATH}/modelTopology.json`,
        JSON.stringify(modelTopology),
        "utf8"
      );

      await writeFile(
        `${wx.env.USER_DATA_PATH}/weightSpecs.json`,
        JSON.stringify(weightSpecs),
        "utf8"
      );

      await writeFile(
        `${wx.env.USER_DATA_PATH}/weightData.bin`,
        // @ts-ignore
        weightData,
        undefined
      );
    }

    detector = await getPoseDetector({
      modelTopology: modelTopology,
      weightSpecs: weightSpecs,
      // @ts-ignore
      weightData: weightData,
    });

    const videoFileInfo = await wx.chooseMedia({
      count: 1,
      mediaType: ["video"],
    });

    this.analyzeVideo(videoFileInfo);
  },
  methods: {
    analyzeVideo: async function (videoFileInfo) {
      const canvas = await new Promise((resolve, _) => {
        wx.createSelectorQuery()
          .select("#canvas")
          .fields({ node: true, size: true })
          .exec((res) => {
            resolve(res[0].node);
          });
      });
      const canvasCtx = canvas.getContext("2d");

      const videoDecoder = wx.createVideoDecoder();
      let ended = false;
      videoDecoder.on("ended", () => {
        console.log("ended");
        ended = true;
      });

      videoDecoder.on("start", async () => {
        let frameData;
        while (true) {
          frameData = videoDecoder.getFrameData();
          if (frameData) {
            break;
          }
        }

        const keypointsList = [];
        const estimateLoop = async (frameData) => {
          const pixels = wxFrameData2DetectorInput(frameData);
          const poses = await detector.estimatePoses(
            pixels,
            {},
            frameData.pkPts
          );

          // draw image and pose on canvas
          await new Promise((resolve) => canvas.requestAnimationFrame(resolve));
          canvas.height = frameData.height;
          canvas.width = frameData.width;
          const imageData = canvas.createImageData(
            frameData.data,
            frameData.width,
            frameData.height
          );
          canvasCtx.putImageData(imageData, 0, 0);

          const keypoints = poses[0].keypoints;
          keypointsList.push(keypoints);
          for (let keypoint of keypoints) {
            const x = keypoint.x;
            const y = keypoint.y;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
            canvasCtx.fillStyle = "red";
            canvasCtx.fill();
          }

          // draw the lines between keypoints using LINES variable
          for (let line of LINES) {
            const keypoint1 = keypoints[line[0]];
            const keypoint2 = keypoints[line[1]];
            const x1 = keypoint1.x;
            const y1 = keypoint1.y;
            const x2 = keypoint2.x;
            const y2 = keypoint2.y;
            canvasCtx.beginPath();
            canvasCtx.moveTo(x1, y1);
            canvasCtx.lineTo(x2, y2);
            canvasCtx.strokeStyle = "cyan";
            canvasCtx.stroke();
          }

          if (!ended) {
            frameData = videoDecoder.getFrameData();
            if (frameData) {
              estimateLoop(frameData);
            } else {
              // ! start of activity analysis

              // joints[0] -> joints[1] is the first vector
              // joints[2] -> joints[3] is the second vecotr
              // we calculate the angle between these two vectors
              const angleRules = [
                {
                  // left eye, right eye, left shoulder, right shoulder
                  joints: [1, 2, 5, 6],
                  weight: 1,
                  name: "neck",
                },
                {
                  // left shoulder, right shoulder, right shoulder, right elbow
                  joints: [5, 6, 6, 8],
                  weight: 1,
                  name: "rightShoulder",
                },
                // left shoulder
                {
                  // right shoulder, left shoulder, left shoulder, left elbow
                  joints: [6, 5, 5, 7],
                  weight: 1,
                  name: "leftShoulder",
                },
                // right elbow
                {
                  // right shoulder, right elbow, right elbow, right wrist
                  joints: [6, 8, 8, 10],
                  weight: 1,
                  name: "rightElbow",
                },
                // left elbow
                {
                  // left shoulder, left elbow, left elbow, left wrist
                  joints: [5, 7, 7, 9],
                  weight: 1,
                  name: "leftElbow",
                },
                // waist
                {
                  // left shoulder, right shoulder, left hip, right hip
                  joints: [5, 6, 11, 12],
                  weight: 1,
                  name: "waist",
                },
                // left hip
                {
                  // left shoulder, left hip, left hip, left knee
                  joints: [5, 11, 11, 13],
                  weight: 1,
                  name: "leftHip",
                },
                // right hip
                {
                  // right shoulder, right hip, right hip, right knee
                  joints: [6, 12, 12, 14],
                  weight: 1,
                  name: "rightHip",
                },
                // left knee
                {
                  // left hip, left knee, left knee, left ankle
                  joints: [11, 13, 13, 15],
                  weight: 1,
                  name: "leftKnee",
                },
                // right knee
                {
                  // right hip, right knee, right knee, right ankle
                  joints: [12, 14, 14, 16],
                  weight: 1,
                  name: "rightKnee",
                },
              ];

              // convert vectors to angles
              const getAngle = (joints, keypoints) => {
                const jointKeypoints = joints.map((joint) => {
                  return keypoints[joint];
                });
                const v1 = [
                  jointKeypoints[1].x - jointKeypoints[0].x,
                  jointKeypoints[1].y - jointKeypoints[0].y,
                ];
                const v2 = [
                  jointKeypoints[3].x - jointKeypoints[2].x,
                  jointKeypoints[3].y - jointKeypoints[2].y,
                ];
                return Math.acos(
                  (v1[0] * v2[0] + v1[1] * v2[1]) /
                    (Math.sqrt(v1[0] ** 2 + v1[1] ** 2) *
                      Math.sqrt(v2[0] ** 2 + v2[1] ** 2))
                );
              };

              // jointAngle = jointAngleList[joint][angle]
              const jointAngleList = angleRules.map((rule) =>
                keypointsList.map((keypoints) =>
                  getAngle(rule.joints, keypoints)
                )
              );

              // ! movement analysis

              const means = jointAngleList.map(
                (angles) =>
                  angles.reduce((acc, angle) => acc + angle, 0) / angles.length
              );

              const std = jointAngleList
                .map(
                  (angles) =>
                    angles.reduce(
                      (acc, angle) => acc + (angle - means[0]) ** 2,
                      0
                    ) / angles.length
                )
                .map((std) => Math.sqrt(std));

              const adjustedStd = std.map(
                (std, index) => std * angleRules[index].weight
              );

              // ! strain analysis
              // TODO

              // generate report
              this.report = adjustedStd
                .map((std, index) => {
                  return {
                    name: angleRules[index].name,
                    std: std,
                  };
                })
                .sort((a, b) => b.std - a.std);
            }
          }
        };

        estimateLoop(frameData);
      });

      videoDecoder.start({
        source: videoFileInfo.tempFiles[0].tempFilePath,
        // @ts-ignore
        abortAudio: true,
      });
    },
  },
};
</script>

<style>
</style>
