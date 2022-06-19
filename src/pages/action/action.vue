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
      <view
        class="pain-prompt"
        :style="{
          display: currentPage === 'pain' ? 'flex' : 'none',
        }"
      >
        <view class="text-container">
          <text class="text">请选择疼痛的部位</text>
        </view>
      </view>
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
        @click="onClickModel"
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
            }}</text
          >
        </view>
        <view class="action-name-area">
          <text class="action-name">{{
            `${currentAnimationIndex + 1}/${currentAnimations.length} ${
              animationNameMap[currentAnimationId]
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
  </view>
</template>

<script>
import {
  AmbientLight,
  AnimationAction,
  AnimationMixer,
  Clock,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
  Raycaster,
  Vector2,
  Mesh,
  SphereGeometry,
  ShaderMaterial,
  DoubleSide,
  AdditiveBlending,
  Color,
  Vector3,
} from "three";

import { WechatPlatform, PlatformManager } from "platformize-three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { loadGLTF } from "@/ts/animation";
import { requestFile } from "@/ts/utils/network";
import { selectCanvas } from "@/ts/utils/canvas";

// config

// wait this amount of time before starting the timer
const WAITING_TIME_BEFORE_ACTION = 5;
// for transition the animation smoothly
const FADING_DURATION = 0.2;

// for animation control
let clock = new Clock();
// for animation
let mixer;
/** @type { OrbitControls } */
let controls;
/** @type { WebGLRenderer } */
let renderer;
/** @type { WechatMiniprogram.Canvas } */
let canvas;
/** @type { Scene } */
let scene;
let camera;
let platform;
// animations
/** @type { {[key: string]: AnimationAction} } */
let activeAction = {};

let canvasDimention = {
  width: 0,
  height: 0,
};
let rayCaster;
let pointer;

/** @type { DirectionalLight } */
let directionalLight;
let jointsBallGlow = [];

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
      currentPage: "pain", // or might be "pain"

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

      painReliefAnimations: {
        neck: [
          { id: "101", loopTimes: 8 },
          { id: "102", loopTimes: 8 },
          { id: "103", loopTimes: 8 },
        ],
        shoulders: [
          { id: "104", loopTimes: 8 },
          { id: "105", loopTimes: 8 },
          { id: "106", loopTimes: 8 },
        ],
        hips: [
          { id: "107", loopTimes: 8 },
          { id: "108", loopTimes: 8 },
          { id: "109", loopTimes: 8 },
        ],
        ankles: [
          { id: "110", loopTimes: 8 },
          { id: "111", loopTimes: 8 },
        ],
        legs: [
          { id: "112", loopTimes: 8 },
          { id: "113", loopTimes: 8 },
          { id: "114", loopTimes: 8 },
        ],
        knees: [
          { id: "115", loopTimes: 8 },
          { id: "116", loopTimes: 8 },
          { id: "117", loopTimes: 8 },
        ],
      },

      balls: [
        { x: 0, y: 2.1, joint: "neck" },
        { x: -0.45, y: 1.8, joint: "shoulders" },
        { x: 0.45, y: 1.8, joint: "shoulders" },
        { x: -0.3, y: 0.3, joint: "hips" },
        { x: 0.3, y: 0.3, joint: "hips" },
        { x: -0.34, y: -2.3, joint: "ankles" },
        { x: 0.34, y: -2.3, joint: "ankles" },
        { x: -0.35, y: -1.2, joint: "knees" },
        { x: 0.35, y: -1.2, joint: "knees" },
        { x: -0.35, y: -0.6, joint: "legs" },
        { x: 0.35, y: -0.6, joint: "legs" },
        { x: -0.35, y: -1.8, joint: "legs" },
        { x: 0.35, y: -1.8, joint: "legs" },
      ],

      // "index" means the index in the currentAnimations array
      // and we have a computed value "currentAnimationIndex" to get the id (e.g. "101", "102")
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
  async onLoad() {
    // this.screenHeight = uni.getSystemInfoSync().windowHeight;
    if (this.currentPage === "pain") {
      this.currentAnimations = [
        {
          id: "still",
          loopTimes: 100000,
        },
      ];
    }

    await this.load(this.url);
  },
  async mounted() {},
  computed: {
    currentAnimationId() {
      /** @type { 
          "101" | "102" | "103" | "104" | "105" 
        | "106" | "107" | "108" | "109" | "110" 
        | "111" | "112" | "113" | "114" | "115" 
        | "116" | "117" | "118" | "119" | "120" 
        | "121" | "122" | "123" | "124" | "125" | "still" } */
      const id = this.currentAnimations[this.currentAnimationIndex].id;
      return id;
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
    async initPainPage() {
      this.stopAllActions();
      this.currentAnimations = [
        {
          id: "still",
          loopTimes: 100000,
        },
      ];
      this.setAction(0);

      this.addBalls();
      directionalLight.intensity = 0.2;
      controls.reset();
      controls.enabled = false;

      this.$nextTick(async () => {
        console.log(canvas);
      });
    },
    async initActionPage(animations) {
      this.stopAllActions();
      this.currentAnimations = animations;
      this.setAction(0);

      this.removeBalls();
      directionalLight.intensity = 1;
      controls.enabled = true;
      this.currentPlayingTime = 0;
      this.savedMixerTime = 0;
      this.waitingTime = WAITING_TIME_BEFORE_ACTION;
      this.waiting = true;

      this.$nextTick(async () => {
        console.log(canvas);
      });
    },
    stopAllActions() {
      for (let action of Object.values(activeAction)) {
        action.fadeOut(FADING_DURATION);
      }
    },
    addBalls() {
      if (!scene.getObjectByName("ball0")) {
        for (let i = 0; i < this.balls.length; i++) {
          jointsBallGlow[i].position.z = 1.5;
          scene.add(jointsBallGlow[i]);
        }
      }
    },
    removeBalls() {
      if (scene.getObjectByName("ball0")) {
        for (let i = 0; i < this.balls.length; i++) {
          scene.remove(jointsBallGlow[i]);
        }
      }
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
      console.log(currentAction);
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
    async selectCanvas(selector) {
      return await new Promise((resolve) => {
        wx.createSelectorQuery()
          .select(selector)
          .node()
          .exec((res) => {
            resolve(res[0].node);
          });
      });
    },
    async load(url) {
      canvas = await this.selectCanvas("#gl");
      canvasDimention.width = canvas.width;
      canvasDimention.height = canvas.height;

      platform = new WechatPlatform(canvas);
      PlatformManager.set(platform);

      renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      // ! set the alpha value to 0 when transition to action page
      renderer.setClearColor(0xf5f3f6, 1);

      rayCaster = new Raycaster();

      camera = new PerspectiveCamera(
        45,
        canvas.width / canvas.height,
        0.1,
        2000
      );

      camera.position.set(0, 0, 10);
      scene = new Scene();
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      const gltfData = await requestFile(url, "arraybuffer");
      const gltf = await loadGLTF(gltfData);
      gltf.parser = null;
      gltf.scene.position.y = -3;
      gltf.scene.scale.multiplyScalar(3.5);
      scene.add(gltf.scene);
      mixer = new AnimationMixer(gltf.scene);
      for (const animation of gltf.animations) {
        activeAction[animation.name] = mixer.clipAction(animation);
      }

      //关节位置小球
      const geometry = new SphereGeometry(0.2, 32, 16);

      const customMaterial = new ShaderMaterial({
        uniforms: {
          c: { type: "f", value: 0.1 },
          p: { type: "f", value: 3 },
          glowColor: { type: "c", value: new Color(0xff0000) },
          viewVector: { type: "v3", value: camera.position },
        },
        vertexShader:
          "uniform vec3 viewVector;\n" +
          "uniform float c;\n" +
          "uniform float p;\n" +
          "varying float intensity;\n" +
          "void main() \n" +
          "{\n" +
          "    vec3 vNormal = normalize( normalMatrix * normal );\n" +
          "\tvec3 vNormel = normalize( normalMatrix * viewVector );\n" +
          "\tintensity = pow( c - dot(vNormal, vNormel), p );\n" +
          "\t\n" +
          "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n" +
          "}",
        fragmentShader:
          "uniform vec3 glowColor;\n" +
          "varying float intensity;\n" +
          "void main() \n" +
          "{\n" +
          "\tvec3 glow = glowColor * intensity;\n" +
          "    gl_FragColor = vec4( glow, 1.0 );\n" +
          "}",
        side: DoubleSide,
        blending: AdditiveBlending,
        transparent: true,
      });

      for (let i = 0; i < this.balls.length; i++) {
        const ball = new Mesh(geometry, customMaterial.clone());
        ball.position.set(this.balls[i].x, this.balls[i].y, 1.5);
        ball.name = "ball" + i;
        jointsBallGlow.push(ball);
        scene.add(ball);
      }

      renderer.outputEncoding = sRGBEncoding;
      scene.add(new AmbientLight(0xffffff, 1.0));
      directionalLight = new DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(1, 2, 1);
      scene.add(directionalLight);
      renderer.setSize(canvas.width, canvas.height);
      uni.getSystemInfo({
        success: (res) => {
          renderer.setPixelRatio(res.pixelRatio);
        },
      });

      const render = () => {
        const frameId = canvas.requestAnimationFrame(render);
        if (!this.paused) {
          if (this.turning) this.turn(0.01);

          controls.update();
          renderer.render(scene, camera);
          for (let i = 0; i < this.balls.length; i++) {
            jointsBallGlow[i].material.uniforms.viewVector.value =
              new Vector3().subVectors(
                camera.position,
                jointsBallGlow[i].position
              );
          }

          if (this.currentPage === "pain" && pointer) {
            //获取鼠标指向的模型
            rayCaster.setFromCamera(pointer, camera);
            pointer = null;

            const intersects = rayCaster.intersectObjects(
              scene.children,
              false
            );
            if (intersects.length > 0) {
              const ballIndex = parseInt(intersects[0].object.name.slice(4));
              const jointName = this.balls[ballIndex].joint;
              this.currentPage = "action";
              activeAction["still"].fadeOut(FADING_DURATION);
              this.initActionPage(this.painReliefAnimations[jointName]);
            }
          }

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

      if (this.currentPage == "pain") {
        this.initPainPage();
      } else {
        this.initActionPage();
      }

      render();
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

    onClickModel(e) {
      const touchCanvasX = e.target.x - e.target.offsetLeft;
      const touchCanvasY = e.target.y - e.target.offsetTop;
      uni.getSystemInfo({
        success: (res) => {
          pointer = new Vector2(
            (touchCanvasX / canvasDimention.width) * 2 - 1,
            -(touchCanvasY / canvasDimention.height) * 2 + 1
          );
        },
      });
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

    .pain-prompt {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .text-container {
        margin-top: 20px;
        .text {
          font-size: 60rpx;
          font-weight: bold;
          color: #333;
        }
      }
    }

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
        animation: top-part-disappear-animation
          $appear-disappear-animation-duration ease-in forwards;
      }

      &.top-part-appear-animation {
        animation: top-part-appear-animation
          $appear-disappear-animation-duration ease-out forwards;
      }

      .overall-progressbar {
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
        animation: webgl-disappear-animation
          $appear-disappear-animation-duration ease-in forwards;
      }

      &.webgl-appear-animation {
        animation: webgl-appear-animation $appear-disappear-animation-duration
          ease-out forwards;
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
        animation: bottom-part-disappear-animation
          $appear-disappear-animation-duration ease-in forwards;
      }

      &.bottom-part-appear-animation {
        animation: bottom-part-appear-animation
          $appear-disappear-animation-duration ease-out forwards;
      }

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
            padding-top: 10rpx;
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
            padding-top: 10rpx;
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
            padding-top: 10rpx;
            flex: 5;
          }
        }
      }
    }
  }
}
</style>
