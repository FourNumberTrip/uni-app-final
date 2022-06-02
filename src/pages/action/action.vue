<template>
  <view class="content">
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
      <text class="overall-full-time">{{ totalTime }}</text>
    </view>
    <canvas
      class="webgl"
      type="webgl"
      id="gl"
      @touchstart="onTX"
      @touchmove="onTX"
      @touchend="onTX"
    ></canvas>
    <view class="control-area">
      <view class="background-progress">
        <view class="progress"></view>
      </view>
      <view class="controls">
        <view
          class="material-icon previous"
          data-color="black"
          data-icon="skip-previous"
        ></view>
        <view class="spacer"></view>
        <view class="pause"></view>
        <view class="space"></view>
        <view class="next"></view
      ></view>
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
    pause() {
      let cur_action = activeAction[this.currentAnimationId];
      if (this.paused) {
        cur_action.paused = false;
        this.paused = false;
        // this controls the animation
        clock.start();
      } else {
        cur_action.paused = true;
        this.paused = true;

        clock.stop();
      }
    },
    setSpeed() {
      if (this.lowSpeed) {
        mixer.timeScale = 1;
        this.lowSpeed = false;
      } else {
        mixer.timeScale = 0.5;
        this.lowSpeed = true;
      }
    },
    reset() {
      controls.reset();
    },
    action(index) {
      activeAction[this.currentAnimationId].stop();
      this.currentAnimationIndex = index;
      // make sure currentAnimationId is updated
      this.$nextTick(() => {
        activeAction[this.currentAnimationId].play();
      });
      mixer.time = 0;
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

          camera.position.set(0, 0, 8);
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
                mixer.update(clock.getDelta());
                if (frameId % 20 == 0) {
                  this.currentPlayingTime = mixer.time;
                }
              }
            }
          };
          render();
        });
    },
    onClick(index) {
      this.action(index);
      console.log("onClick", index);
      console.log(index);
    },
    onClickPushDown(e) {
      this.canvasPusherVisible = "canvas-pusher";
    },
    turnBack() {
      console.log(scene);
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

  .overall-progressbar {
    flex: 0;
    margin-top: 5rpx;
    height: 10rpx;
    width: 99%;
    border-radius: 5rpx;
    border: 1rpx solid rgb(223, 223, 223);

    display: flex;
    flex-direction: row;

    .overall-progressbar-parts {
      flex: 1;
      height: 10rpx;
      margin: 0rpx 1rpx;

      .progress {
        background: rgb(153, 153, 153);
        border-radius: 5rpx;
        height: 100%;
        float: left;
      }
    }
  }

  .overall-timer-area {
    flex: 0;
    width: 100%;

    .overall-timer {
      float: left;
      font-size: 50rpx;
      font-weight: bold;
      margin-left: 10rpx;
    }

    .overall-full-time {
      float: right;
      font-size: 50rpx;
      font-weight: bold;
      margin-right: 10rpx;
    }
  }

  .webgl {
    flex: 8;
    /*z-index: 0;*/
    width: 100%;
  }

  .control-area {
    flex: 2;
    width: 98%;
    margin-bottom: 10rpx;
    position: relative;

    .background-progress {
      position: absolute;

      width: 100%;
      height: 100%;
      border-radius: 400rpx;
      overflow: hidden;

      .progress {
        float: left;
        width: 60%;
        height: 100%;
        background: rgb(174, 174, 255);
      }
    }

    .controls {
      position: absolute;

      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      @include material-icon(
        "black",
        #000000,
        "skip-previous",
        $material-icon-skip-previous
      );
      .previous {
        flex: 5;
        height: 30rpx;
        width: 30rpx;
      }

      .spacer {
        flex: 1
      }

      .pause {
        flex: 5;
        height: 30rpx;
      }

      .next {
        flex: 5;
        height: 30rpx;
      }
    }
  }
}

hidden {
  display: hidden;
}
</style>
