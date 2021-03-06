<template>
  <view class="content">
    <!-- for some reason, /^action|pain$/.test(currentPage) doesn't work -->
    <view
        class="action-content"
        :style="{
        display:
          currentPage === 'action' || currentPage === 'pain' ? 'flex' : 'none',
      }"
    >
      <!-- only if it's action page we display the top part and the bottom part -->
      <view
          :class="[
          'top-part',
          finished
            ? 'top-part-disappear-animation'
            : 'top-part-appear-animation',
        ]"
          :style="{
          display: currentPage === 'action' ? 'flex' : 'none',
        }"
      >
        <view class="overall-progressbar">
          <view
              class="overall-progressbar-parts"
              v-for="(animation, index) in currentAnimations"
              :key="index"
          >
            <view
                class="progress"
                :style="{
                width: `${Math.round(completedPercentages[index] * 100)}%`,
              }"
            ></view>
          </view>
        </view>
        <view class="overall-timer-area">
          <text class="overall-timer">{{ currentOverallTime }}</text>
          <!-- <text class="overall-full-time">{{ totalTime }}</text> -->
        </view>
      </view>

      <canvas
          :class="[
          'webgl',
          finished ? 'webgl-disappear-animation' : 'webgl-appear-animation',
        ]"
          type="webgl"
          id="gl"
          @touchstart="onTX"
          @touchmove="onTX"
          @touchend="onTX"
      ></canvas>

      <view
          :class="[
          'bottom-part',
          finished
            ? 'bottom-part-disappear-animation'
            : 'bottom-part-appear-animation',
        ]"
          :style="{
          display: currentPage === 'action' ? 'flex' : 'none',
        }"
      >
        <view class="timer-area">
          <text class="timer">{{ Math.floor(currentPlayingTime) }}</text>
          <text class="timer-total"
          >/{{
              `${Math.floor(currentAnimationDurations[currentAnimationIndex])}"`
            }}
          </text
          >
        </view>
        <view class="action-name-area">
          <text class="action-name">{{
              `${currentAnimationIndex + 1}/${currentAnimations.length} ${
                  animationNameMap[currentAnimationId]
              }`
            }}
          </text>
        </view>
        <view class="control-area">
          <view class="background-progress">
            <view
                class="progress"
                :style="{
                width: `${Math.round(
                  completedPercentages[currentAnimationIndex] * 100
                )}%`,
              }"
            ></view>
          </view>
          <view class="controls">
            <view class="side-spacer"></view>
            <view
                class="material-icon previous"
                :data-color="currentAnimationIndex > 0 ? 'gray' : 'lightgray'"
                data-icon="skip-previous"
                @click="onClickPrevious"
            ></view>
            <view class="spacer"></view>
            <view
                class="material-icon pause"
                data-color="gray"
                :data-icon="paused ? 'play' : 'pause'"
                @click="onClickPause"
            ></view>
            <view class="spacer"></view>
            <view
                class="material-icon next"
                :data-color="
                currentAnimationIndex < currentAnimations.length - 1
                  ? 'gray'
                  : 'lightgray'
              "
                data-icon="skip-next"
                @click="onClickNext"
            ></view>
            <view class="side-spacer"></view>
          </view>
        </view>
      </view>
    </view>

    <button class="tempButton" @click="showPopWindow">打开弹窗</button>

    <view class="popWindow" v-if="duringRest">
      <div>
        <span>进度条</span>
        <span>倒计时</span>
      </div>
      <span>本次运动的强度如何？</span>
      <div style="float: inside">
        <span>轻松</span>
        <span>适中</span>
        <span>困难</span>
      </div>

      <div class="tempConfirm" @click="closePopWindow">
        <span>关闭弹窗</span>
      </div>
    </view>
  </view>


</template>

<script>
import {
  AmbientLight,
  AnimationMixer,
  Clock,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  WebGL1Renderer,
} from "three";

import {WechatPlatform, PlatformManager} from "platformize-three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

// config

// wait this amount of time before starting the timer
const WAITING_TIME_BEFORE_ACTION = 5;
// for transition the animation smoothly
const FADING_DURATION = 0.2;

// for animation control
let clock = new Clock();
// for animation
let mixer;
let controls;
let renderer;
let canvas;
let scene;
let camera;
let platform;
// animations
let activeAction = {};

// convert seconds to mm:ss format
function secondsToTimeString(totalSeconds) {
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = Math.floor(totalSeconds % 60);
  return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
  }${seconds}`;
}

export default {
  data() {
    return {
      currentPage: "action", // or might be "pain"
      userState: 'adapt',
      duringRest: false,
      turning: false,
      cnt_turn: 0,
      paused: false,
      lowSpeed: false,
      url: "https://mp.muzi.fun/resources/models/final.glb",
      animationNameMap: {
        101: "双手护颈",
        102: "颈侧肌拉伸",
        103: "宝塔瞭望",
        104: "手臂内旋",
        105: "手臂外旋",
        106: "手臂上举",
        107: "站立提膝",
        108: "站立外摆腿",
        109: "带髋外展",
        110: "站立提踝",
        111: "提踝曲膝",
        112: "骑士后扶脚",
        113: "站立单脚向前",
        114: "膝关节静靠",
        115: "侧步蹲",
        116: "半蹲",
        117: "半盘腿触趾",
        118: "侧展下拉",
        119: "颈部活动",
        120: "手臂环绕",
        121: "双手并拢转体",
        122: "平举扩胸",
        123: "单腿后推",
        124: "踢臀",
        125: "肘部运动",
      },

      // "index" means the index in the currentAnimations array
      // and we have a computed value "currentAnimationId" to get the id (e.g. "101", "102")
      currentAnimationIndex: 0,
      currentAnimations: [
        {
          id: "102",
          loopTimes: 8,
        },
        {
          id: "107",
          loopTimes: 8,
        },
        {
          id: "109",
          loopTimes: 8,
        },
      ],

      // what displays on the screen
      currentPlayingTime: 0,

      // for pausing
      savedMixerTime: 0,

      // for waiting before counting up
      waitingTime: WAITING_TIME_BEFORE_ACTION,
      waiting: true,

      // for fading in and out of the page
      finished: false,
    };
  },
  onLoad() {
    // this.load("https://egg.moe/custom/untitled1.glb")
  },
  mounted() {
    // this.screenHeight = uni.getSystemInfoSync().windowHeight;
    this.load(this.url);
  },
  computed: {
    currentAnimationId() {
      return this.currentAnimations[this.currentAnimationIndex].id;
    },
    completedAnimations() {
      return this.currentAnimations.map((_, index) => {
        return index < this.currentAnimationIndex ? true : false;
      });
    },
    currentAnimationDurations() {
      return this.currentAnimations.map(
          (i) => activeAction[i.id]._clip.duration * i.loopTimes
      );
    },
    completedPercentages() {
      return this.completedAnimations.map((completed, index, l) => {
        if (completed) {
          return 1;
          // if it's the first or if the previous one is completed and the current one is not
          // then the current one is running
        } else if (index == 0 || (l[index - 1] && !completed)) {
          return (
              this.currentPlayingTime / this.currentAnimationDurations[index]
          );
        } else {
          return 0;
        }
      });
    },
    totalTime() {
      return secondsToTimeString(
          this.currentAnimationDurations.reduce((a, b) => a + b, 0)
      );
    },
    currentOverallTime() {
      const currentOverallSeconds =
          this.currentAnimationDurations
              .filter((_, index) => this.completedAnimations[index])
              .reduce((a, b) => a + b, 0) + this.currentPlayingTime;
      return secondsToTimeString(currentOverallSeconds);
    },
  },
  methods: {
    // 每完成康复训练中的一个动作，就进入休息时间，出现弹窗
    showPopWindow() {
      console.log('show pop window')
      // TODO: 暂停3d小人动画

      // TODO: 初始化休息进度条 -> 休息10s

      // 默认选择[轻松-蓝色，合适-绿色，困难-红色]中的合适
      this.userState = 'adapt'

      // 显示弹窗
      this.duringRest = true

    },
    // 当休息结束时，根据选项优化康复运动计划
    closePopWindow() {
      console.log('close pop window')

      if (this.userState == 'easy') {
        // 轻松的策略: 增加后续所有动作的时长(+增加临近肌肉的锻炼动作)
        for (let i = this.currentAnimationIndex + 1; i < this.currentAnimations.length; i++) {
          this.currentAnimations[i].loopTimes += 4
        }

      } else if (this.userState == 'hard') {
        // 困难的策略: 减少后续所有动作的时长(+删去最后一个动作)
        for (let i = this.currentAnimationIndex + 1; i < this.currentAnimations.length; i++) {
          this.currentAnimations[i].loopTimes = Math.ceil(this.currentAnimations[i].loopTimes / 2 + 2)
        }
      }

      // 关闭弹窗
      this.duringRest = false

    },


    togglePause() {
      if (this.paused) {
        this.paused = false;
        // this controls the animation
        clock.start();

        this.setWaiting();
      } else {
        this.paused = true;
        clock.stop();
      }
    },
    toggleSlowMotion() {
      if (this.lowSpeed) {
        mixer.timeScale = 1;
        this.lowSpeed = false;
      } else {
        mixer.timeScale = 0.5;
        this.lowSpeed = true;
      }
    },
    resetControl() {
      controls.reset();
    },
    setAction(index) {
      const currentAction = activeAction[this.currentAnimationId];
      this.currentAnimationIndex = index;
      // make sure currentAnimationId is updated
      this.$nextTick(() => {
        currentAction.fadeOut(FADING_DURATION);
        const nextAction = activeAction[this.currentAnimationId];
        nextAction.reset();
        nextAction.fadeIn(FADING_DURATION);
        nextAction.play();
      });

      // ! this is currently also for the timer in the page
      mixer.time = 0;
      this.currentPlayingTime = mixer.time;

      this.setWaiting();
    },
    setWaiting() {
      this.waitingTime = WAITING_TIME_BEFORE_ACTION;
      this.waiting = true;
      this.savedMixerTime = mixer.time;
    },
    onClickPause() {
      this.togglePause();
    },
    onClickPrevious() {
      if (this.currentAnimationIndex > 0) {
        this.setAction(this.currentAnimationIndex - 1);
      }
    },
    onClickNext() {
      if (this.currentAnimationIndex < this.currentAnimations.length - 1) {
        this.setAction(this.currentAnimationIndex + 1);
      }
    },
    load(url) {
      console.log("loading:");
      console.log(url);
      uni
          .createSelectorQuery()
          .select("#gl")
          .node()
          .exec((res) => {
            canvas = res[0].node;

            platform = new WechatPlatform(canvas);
            console.log(platform);
            PlatformManager.set(platform);

            renderer = new WebGL1Renderer({
              canvas,
              antialias: true,
              alpha: true,
            });

            camera = new PerspectiveCamera(
                45,
                canvas.width / canvas.height,
                0.1,
                2000
            );

            // TODO CHANGE THIS
            camera.position.set(0, 0, 10);
            scene = new Scene();
            controls = new OrbitControls(camera, canvas);
            controls.enableDamping = true;
            uni.request({
              url: url,
              responseType: "arraybuffer",
              success: (res) => {
                const gltfLoader = new GLTFLoader();
                gltfLoader.parse(res.data, "", (gltf) => {
                  gltf.parser = null;
                  // TODO CHANGE THIS
                  gltf.scene.position.y = -3.4;
                  gltf.scene.scale.multiplyScalar(3.5);
                  scene.add(gltf.scene);
                  mixer = new AnimationMixer(gltf.scene);
                  for (const animation of gltf.animations) {
                    activeAction[animation.name] = mixer.clipAction(animation);
                  }
                  activeAction[this.currentAnimationId].play();
                });
              },
            });
            renderer.outputEncoding = sRGBEncoding;
            scene.add(new AmbientLight(0xffffff, 1.0));
            const directionalLight = new DirectionalLight(0xffffff, 1.0);
            directionalLight.position.set(1, 2, 1);
            scene.add(directionalLight);
            renderer.setSize(canvas.width, canvas.height);
            uni.getSystemInfo({
              success: (res) => {
                renderer.setPixelRatio(res.pixelRatio);
                console.log(res);
              },
            });

            const render = () => {
              const frameId = canvas.requestAnimationFrame(render);
              if (!this.paused) {
                if (this.turning) this.turn(0.01);

                controls.update();
                renderer.render(scene, camera);
                if (mixer) {
                  const clockDelta = clock.getDelta();
                  mixer.update(clockDelta);

                  if (this.waitingTime > 0) {
                    this.waitingTime -= clockDelta;
                  } else {
                    if (this.waiting) {
                      this.waiting = false;
                      mixer.time = this.savedMixerTime;
                    } else {
                      this.currentPlayingTime = mixer.time;

                      // ! this is where animation finishes
                      if (
                          this.currentPlayingTime >
                          this.currentAnimationDurations[this.currentAnimationIndex]
                      ) {
                        // if the current action is finished, then we proceed to the next one
                        if (
                            this.currentAnimationIndex + 1 <
                            this.currentAnimations.length
                        ) {
                          this.setAction(this.currentAnimationIndex + 1);
                          // if all the actions are finished
                        } else if (!this.finished) {
                          // pause the animation
                          activeAction[this.currentAnimationId].paused = true;

                          // pause the rendering of the model after the model fading out of the screen to save power
                          setTimeout(() => {
                            activeAction[this.currentAnimationId].paused = false;
                            this.togglePause();
                            clock.stop();
                          }, 1000);

                          // page turning
                          this.finished = true;
                          setTimeout(() => {
                            this.currentPage = "complete";
                          }, 800);
                        }
                      }
                    }
                  }
                }
              }
            };
            render();
          });
    },
    turnBack() {
      scene.rotateY(Math.PI);
    },
    autoTurn() {
      this.cnt_turn = 0;
      this.turning = true;
    },
    turn(step) {
      // let step=0.01
      controls.update();
      renderer.render(scene, camera);
      scene.rotateY(step * Math.PI);
      this.cnt_turn += 1;
      if (this.cnt_turn >= 1 / step) {
        this.turning = false;
      }
    },

    // for three.js touch control
    onTX(e) {
      platform.dispatchTouchEvent(e);
    },
  },
};
</script>

<style lang="scss">
@import "@/lib/material-icons.scss";

$appear-disappear-animation-duration: 0.8s;

$background-color: #f5f3f6;

page {
  height: 100%;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;

  .action-content {
    flex: 1;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    background: $background-color;

    .top-part {
      flex: 1;
      width: 100%;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      @keyframes top-part-appear-animation {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0%);
          opacity: 1;
        }
      }

      @keyframes top-part-disappear-animation {
        from {
          transform: translateY(0%);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }

      &.top-part-disappear-animation {
        animation: top-part-disappear-animation $appear-disappear-animation-duration ease-in forwards;
      }

      &.top-part-appear-animation {
        animation: top-part-appear-animation $appear-disappear-animation-duration ease-out forwards;
      }

      .overall-progressbar {
        margin-top: 5 rpx;
        height: 10 rpx;
        width: 99%;
        border-radius: 5 rpx;
        border: 1 rpx solid rgb(223, 223, 223);

        display: flex;
        flex-direction: row;
        align-items: stretch;

        .overall-progressbar-parts {
          flex: 1;
          margin: 0 rpx 2 rpx;
          background: rgb(223, 223, 223);

          .progress {
            background: #808080;
            border-radius: 5 rpx;
            transition: width 1s;
            height: 100%;
            float: left;
          }
        }
      }

      .overall-timer-area {
        margin-top: 10 rpx;
        width: 100%;
        color: #808080;

        .overall-timer {
          float: left;
          font-size: 60 rpx;
          font-weight: bold;
          margin-left: 20 rpx;
        }

        .overall-full-time {
          float: right;
          font-size: 60 rpx;
          font-weight: bold;
          margin-right: 20 rpx;
        }
      }
    }

    .webgl {
      flex: 11;
      width: 100%;

      @keyframes webgl-appear-animation {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(0%);
        }
      }

      @keyframes webgl-disappear-animation {
        from {
          transform: translateX(0%);
        }
        to {
          transform: translateX(-100%);
        }
      }

      &.webgl-disappear-animation {
        animation: webgl-disappear-animation $appear-disappear-animation-duration ease-in forwards;
      }

      &.webgl-appear-animation {
        animation: webgl-appear-animation $appear-disappear-animation-duration ease-out forwards;
      }
    }

    .bottom-part {
      flex: 5;
      width: 100%;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      @keyframes bottom-part-appear-animation {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0%);
          opacity: 1;
        }
      }

      @keyframes bottom-part-disappear-animation {
        from {
          transform: translateY(0%);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }

      &.bottom-part-disappear-animation {
        animation: bottom-part-disappear-animation $appear-disappear-animation-duration ease-in forwards;
      }

      &.bottom-part-appear-animation {
        animation: bottom-part-appear-animation $appear-disappear-animation-duration ease-out forwards;
      }

      .timer-area {
        flex: 0;
        width: 100%;
        padding-left: 40 rpx;
        margin-bottom: 10 rpx;
        font-size: 80 rpx;
        font-weight: bold;

        .timer {
          float: left;
          color: black;
        }

        .timer-total {
          float: left;
          color: #8b8b8b;
        }
      }

      .action-name-area {
        flex: 0;
        width: 100%;
        padding-left: 45 rpx;
        margin-bottom: 30 rpx;

        .action-name {
          float: left;
          font-size: 40 rpx;
          font-weight: bold;
        }
      }

      .control-area {
        flex: 1;
        width: 93%;
        margin-bottom: 30 rpx;
        position: relative;

        .background-progress {
          z-index: 0;
          position: absolute;
          width: 100%;
          height: 100%;

          border-radius: 400 rpx;
          box-shadow: rgba(100, 100, 111, 0.3) 0 rpx 7 rpx 20 rpx 0 rpx;
          background: white;

          overflow: hidden;

          .progress {
            transition: width 1s;
            float: left;
            height: 100%;
            background: rgb(181, 222, 179);
          }
        }

        .controls {
          z-index: 1;
          position: absolute;
          width: 100%;
          height: 100%;

          display: flex;
          flex-direction: row;
          align-items: center;

          .side-spacer {
            flex: 4;
          }

          .spacer {
            flex: 6;
          }

          @include material-icon(
                  "gray",
                  #707070,
                  "skip-previous",
                  $material-icon-skip-previous
          );
          @include material-icon(
                  "lightgray",
                  #bcbcbc,
                  "skip-previous",
                  $material-icon-skip-previous
          );

          .previous {
            padding-top: 10 rpx;
            flex: 5;
          }

          @include material-icon(
                  "gray",
                  #707070,
                  "pause",
                  $material-icon-pause
          );
          @include material-icon(
                  "gray",
                  #707070,
                  "play",
                  $material-icon-play-arrow
          );

          .pause {
            padding-top: 10 rpx;
            flex: 5;
          }

          @include material-icon(
                  "gray",
                  #707070,
                  "skip-next",
                  $material-icon-skip-next
          );
          @include material-icon(
                  "lightgray",
                  #bcbcbc,
                  "skip-next",
                  $material-icon-skip-next
          );

          .next {
            padding-top: 10 rpx;
            flex: 5;
          }
        }
      }
    }
  }
}
</style>
