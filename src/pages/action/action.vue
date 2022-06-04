<template>
  <view class="content">
    <view class="top-part">
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
      class="webgl"
      type="webgl"
      id="gl"
      @touchstart="onTX"
      @touchmove="onTX"
      @touchend="onTX"
    ></canvas>

    <view class="bottom-part">
      <view class="timer-area">
        <text class="timer">{{ Math.floor(currentPlayingTime) }}</text>
        <text class="timer-total"
          >/{{
            `${Math.floor(currentAnimationDurations[currentAnimationIndex])}"`
          }}</text
        >
      </view>
      <view class="action-name-area">
        <text class="action-name">{{
          `${currentAnimationIndex + 1}/${currentAnimations.length} ${
            animations[currentAnimationId].name
          }`
        }}</text>
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
            data-color="black"
            data-icon="skip-previous"
            @click="onClickPrevious"
          ></view>
          <view class="spacer"></view>
          <view
            class="material-icon pause"
            data-color="black"
            :data-icon="paused ? 'play' : 'pause'"
            @click="onClickPause"
          ></view>
          <view class="spacer"></view>
          <view
            class="material-icon next"
            data-color="black"
            data-icon="skip-next"
            @click="onClickNext"
          ></view>
          <view class="side-spacer"></view>
        </view>
      </view>
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

import { WechatPlatform, PlatformManager } from "platformize-three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// config

// wait this amount of time before starting the timer
const WAITING_TIME_BEFORE_ACTION = 5;

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
let activeAction = [];

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
      turning: false,
      cnt_turn: 0,
      paused: false,
      lowSpeed: false,
      url: "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb",
      items: [
        {
          image: "/static/small.png",
          title: "action1",
          touchDown: false,
        },
        {
          image: "/static/small.png",
          title: "action2",
          touchDown: false,
        },
        {
          image: "/static/small.png",
          title: "action3",
          touchDown: false,
        },
        {
          image: "/static/small.png",
          title: "action4",
          touchDown: false,
        },
      ],
      animations: [
        { name: "跳舞" },
        { name: "死亡" },
        { name: "静止" },
        { name: "跳跃" },
        { name: "不好" },
        { name: "打拳" },
        { name: "跑步" },
        { name: "坐着" },
        { name: "站着" },
        { name: "大拇指" },
        { name: "走路" },
        { name: "走路跳" },
        { name: "挥手" },
        { name: "好的" },
      ],
      animationDurations: [],

      currentAnimationIndex: 0,
      currentAnimations: [
        {
          id: 0,
          loopTimes: 8,
        },
        {
          id: 2,
          loopTimes: 8,
        },
        {
          id: 4,
          loopTimes: 8,
        },
      ],
      currentPlayingTime: 0,
      savedMixerTime: 0,
      waitingTime: WAITING_TIME_BEFORE_ACTION,
      waiting: true,
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
        (i) => this.animationDurations[i.id] * i.loopTimes
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
      activeAction[this.currentAnimationId].stop();
      this.currentAnimationIndex = index;
      // make sure currentAnimationId is updated
      this.$nextTick(() => {
        activeAction[this.currentAnimationId].play();
      });
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
      this.setAction(this.currentAnimationIndex - 1);
    },
    onClickNext() {
      this.setAction(this.currentAnimationIndex + 1);
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
          camera.position.set(0, 0, 12);
          scene = new Scene();
          controls = new OrbitControls(camera, canvas);
          controls.enableDamping = true;
          uni.request({
            url: url,
            // url: "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb",
            // url: "https://egg.moe/custom/untitled1.glb",
            responseType: "arraybuffer",
            success: (res) => {
              const gltfLoader = new GLTFLoader();
              gltfLoader.parse(res.data, "", (gltf) => {
                gltf.parser = null;
                // TODO CHANGE THIS
                gltf.scene.position.y = -2.2;
                scene.add(gltf.scene);
                mixer = new AnimationMixer(gltf.scene);
                for (const animation of gltf.animations) {
                  activeAction.push(mixer.clipAction(animation));
                  this.animationDurations.push(animation.duration);
                }
                activeAction[this.currentAnimationId].play();
              });
            },
          });
          renderer.outputEncoding = sRGBEncoding;
          scene.add(new AmbientLight(0xffffff, 1.0));
          scene.add(new DirectionalLight(0xffffff, 1.0));
          renderer.setSize(canvas.width, canvas.height);
          uni.getSystemInfo({
            success: (res) => {
              renderer.setPixelRatio(res.pixelRatio);
            },
          });

          const render = () => {
            if (this.turning) this.turn(0.01);
            const frameId = canvas.requestAnimationFrame(render);
            if (!this.paused) {
              controls.update();
              renderer.render(scene, camera);
              if (mixer) {
                const clockDelta = clock.getDelta();
                mixer.update(clockDelta);

                if (this.waitingTime > 0) {
                  this.waitingTime -= clockDelta;
                }

                if (frameId % 10 == 0) {
                  if (this.waitingTime <= 0) {
                    if (this.waiting) {
                      this.waiting = false;
                      mixer.time = this.savedMixerTime;
                    } else {
                      this.currentPlayingTime = mixer.time;

                      if (
                        this.currentPlayingTime >
                        this.currentAnimationDurations[
                          this.currentAnimationIndex
                        ]
                      ) {
                        // if the current action is finished, then we proceed to the next one
                        if (
                          this.currentAnimationIndex <=
                          this.currentAnimations.length
                        ) {
                          this.setAction(this.currentAnimationIndex + 1);
                          // if all the actions are finished
                        } else {
                          this.paused = true;
                          clock.stop();
                          this.finished = true;
                        }
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

page {
  height: 100%;
}

.content {
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background: #f5f3f6;

  .top-part {
    flex: 0;
    width: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .overall-progressbar {
      flex: 0;
      margin-top: 5rpx;
      height: 10rpx;
      width: 99%;
      border-radius: 5rpx;
      border: 1rpx solid rgb(223, 223, 223);

      display: flex;
      flex-direction: row;
      align-items: stretch;

      .overall-progressbar-parts {
        flex: 1;
        margin: 0rpx 2rpx;
        background: rgb(223, 223, 223);

        .progress {
          background: #808080;
          border-radius: 5rpx;
          transition: width 1s;
          height: 100%;
          float: left;
        }
      }
    }

    .overall-timer-area {
      flex: 0;
      margin-top: 10rpx;
      width: 100%;
      color: #808080;

      .overall-timer {
        float: left;
        font-size: 60rpx;
        font-weight: bold;
        margin-left: 20rpx;
      }

      .overall-full-time {
        float: right;
        font-size: 60rpx;
        font-weight: bold;
        margin-right: 20rpx;
      }
    }
  }

  .webgl {
    flex: 11;
    /*z-index: 0;*/
    width: 100%;
  }

  .bottom-part {
    flex: 5;
    width: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .timer-area {
      flex: 0;
      width: 100%;
      padding-left: 40rpx;
      margin-bottom: 10rpx;
      font-size: 80rpx;
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
      padding-left: 45rpx;
      margin-bottom: 30rpx;

      .action-name {
        float: left;
        font-size: 40rpx;
        font-weight: bold;
      }
    }

    .control-area {
      flex: 1;
      width: 93%;
      margin-bottom: 30rpx;
      position: relative;

      .background-progress {
        z-index: 0;
        position: absolute;
        width: 100%;
        height: 100%;

        border-radius: 400rpx;
        box-shadow: rgba(100, 100, 111, 0.3) 0rpx 7rpx 20rpx 0rpx;
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
          "black",
          #707070,
          "skip-previous",
          $material-icon-skip-previous
        );
        .previous {
          padding-top: 10rpx;
          flex: 5;
        }

        @include material-icon("black", #707070, "pause", $material-icon-pause);
        @include material-icon(
          "black",
          #707070,
          "play",
          $material-icon-play-arrow
        );
        .pause {
          padding-top: 10rpx;
          flex: 5;
        }

        @include material-icon(
          "black",
          #707070,
          "skip-next",
          $material-icon-skip-next
        );
        .next {
          padding-top: 10rpx;
          flex: 5;
        }
      }
    }
  }
}

.hidden {
  display: none !important;
}
</style>
