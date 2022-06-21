<template>
  <view class="content">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <view class="nav-bar">
      <view class="nav-bar-box">
        <view class="nav-bar-back-box" @click="navigateBack">
          <view
            :class="['back-arrow', 'material-icon']"
            data-color="black"
            data-icon="chevron-left"
          ></view>
        </view>
        <view class="nav-bar-help-box">
          <view
            :class="['help', 'material-icon']"
            data-color="black"
            data-icon="help"
          ></view>
        </view>
      </view>
    </view>
    <view class="actual-content">
      <view
        :class="['guide-content', `guide-content-animation-${guideStage}`]"
        :style="{ display: currentPage == 'guide' ? 'flex' : 'none' }"
      >
        <view :class="['guide-area', `guide-area-animation-${guideStage}`]">
          <view class="image-container">
            <img class="image" :src="guide.image" alt="" />
          </view>
          <view class="text">
            {{ guide.text }}
          </view>
        </view>
        <view class="button-area">
          <view
            :class="['button-anchor', `button-anchor-animation-${guideStage}`]"
          >
            <view
              :class="['button', `button-animation-${guideStage}`]"
              @click="onGuideButtonClick"
            >
              <view
                :class="[
                  'button-arrow-white',
                  'material-icon',
                  `button-arrow-white-animation-${guideStage}`,
                ]"
                data-color="white"
                data-icon="chevron-right"
              ></view>
              <view
                :class="[
                  'button-arrow-theme',
                  'material-icon',
                  `button-arrow-theme-animation-${guideStage}`,
                ]"
                data-color="theme"
                data-icon="chevron-right"
              ></view>
            </view>
          </view>
        </view>
        <view class="bottom-place-holder"></view>
      </view>
      <view
        class="select-content"
        :style="{ display: currentPage == 'select' ? 'flex' : 'none' }"
      >
        <view class="list">
          <view
            :class="[
              'list-item',
              item._class,
              index === 0
                ? 'list-item-fade-in-from-top'
                : 'list-item-fade-in-from-bottom',
            ]"
            v-for="(item, index) in selectItems"
            :key="item.title"
            @click="onSelectButtonClick(index)"
          >
            <view class="list-item-content">
              <image class="button-background-image" :src="item.image"> </image>
              <view class="translucent-box">
                <text class="button-title">{{ item.title }}</text>
                <text class="button-description">{{ item.description }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view
        class="list-content"
        :style="{ display: currentPage == 'list' ? 'flex' : 'none' }"
      >
        <scroll-view
          scroll-y="true"
          enable-flex="true"
          class="list"
          :style="{ height: `calc(100vh - ${statusBarHeight}px - 80rpx)` }"
        >
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
        </scroll-view>
      </view>
      <!-- for some reason, /^action|pain$/.test(currentPage) doesn't work -->
      <view
        class="action-content"
        :style="{
          display:
            currentPage === 'action' || currentPage === 'pain'
              ? 'flex'
              : 'none',
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
                `${Math.floor(
                  currentAnimationDurations[currentAnimationIndex]
                )}"`
              }}</text
            >
          </view>
          <view class="action-name-area">
            <text class="action-name">{{
              `${currentAnimationIndex + 1}/${currentAnimationCount} ${
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
                  currentAnimationIndex < currentAnimationCount - 1
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
      <view
        class="complete-content"
        :style="{ display: currentPage == 'complete' ? 'flex' : 'none' }"
      >
        <view class="top-placeholder"></view>
        <view class="checkmark-wrapper">
          <view
            :class="[
              'checkmark',
              leavingCompletePage ? 'checkmark-disappear-animation' : '',
              'checkmark-appear-animation',
            ]"
          ></view>
        </view>
        <view class="buttons">
          <view
            :class="[
              'button',
              'restart-button',
              'restart-button-appear-animation',
              leavingCompletePage ? 'restart-button-disappear-animation' : '',
            ]"
            @click="onClickCompleteRestart"
            >重做</view
          >
          <view
            :class="[
              'button',
              'back-button',
              'back-button-appear-animation',
              leavingCompletePage ? 'back-button-disappear-animation' : '',
            ]"
            @click="onClickCompleteBack"
            >返回</view
          >
        </view>
        <view class="bottom-placeholder"></view>
      </view>
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
} from "three";

import { WechatPlatform, PlatformManager } from "platformize-three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { loadGLTF } from "@/ts/animation";
import { requestFile } from "@/ts/utils/network";
import { Keypoint } from "@tensorflow-models/pose-detection";
import { analyzeKeypointsList } from "@/ts/pose-analysis";
import { getPoseDetector, estimateFrame } from "@/ts/pose-detection";
import { VideoDecoder } from "@/ts/video-decoder";
import { drawPose } from "@/ts/utils/canvas";
import { sleep } from "@/ts/utils/misc";

// ! action & pain

// config

// wait this amount of time before starting the timer
const WAITING_TIME_BEFORE_ACTION = 2;
// for transition the animation smoothly
const FADING_DURATION = 0.5;

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
/** @type { PerspectiveCamera } */
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

/** @type { Promise<void> } */
let loadPromise;

let observer;

// convert seconds to mm:ss format
function secondsToTimeString(totalSeconds) {
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = Math.floor(totalSeconds % 60);
  return `${minutes < 10 ? "0" : ""}${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
}

const guides = [
  {
    image: "https://mp.muzi.fun/resources/images/guide/select-page.webp",
    text: "选择准备活动或者疼痛的部位",
  },
  {
    image: "https://mp.muzi.fun/resources/images/guide/list-page.webp",
    text: "选择从事的活动",
  },
  {
    image: "https://mp.muzi.fun/resources/images/guide/pain-page.webp",
    text: "或者选择疼痛的部位",
  },
  {
    image: "https://mp.muzi.fun/resources/images/guide/action-page.webp",
    text: "学着一起做动作",
  },
];

export default {
  data() {
    return {
      currentPage: "select",

      // ! general

      statusBarHeight: 0,
      pageStack: [],

      // ! guide
      guideStage: 0,
      guide: guides[0],

      // ! select
      selectItems: [
        {
          image: "https://mp.muzi.fun/resources/images/select/warm-up.webp",
          title: "热身动作",
          description:
            "热身运动是热身运动是热身运动是热身运动是热身运动是热身运动是热身运动是热身运动是热身运动",
          _class: "",
        },
        {
          image: "https://mp.muzi.fun/resources/images/select/pain-spots.webp",
          title: "疼痛缓解",
          description:
            "疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解是疼痛缓解",
          _class: "",
        },
      ],

      // ! list

      /** @type { { appearAnimationClass: string, disappearAnimationClass: string }[] } */
      listItemAnimationClasses: [],
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

      // ! action & pain

      loaded: false,
      paused: true,
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
        still: "静止",
      },

      painReliefAnimations: {
        neck: [
          { id: "101", loopTimes: 1 },
          { id: "102", loopTimes: 1 },
          { id: "103", loopTimes: 1 },
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
          id: "still",
          loopTimes: 10000000,
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

      // ! complete

      leavingCompletePage: false,

      // ! add

      canvasContainerAnimationClass: "",
      analyzeProgress: 0,
    };
  },
  created() {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
  },
  onLoad() {
    loadPromise = this.load(this.url);
    // ! be aware that if you put an object in fill(), the array will full of the same object (references to the same object).
    this.listItemAnimationClasses = new Array(this.listItems.length)
      .fill()
      .map((_) => ({
        appearAnimationClass: "list-item-out-bottom",
        disappearAnimationClass: "",
      }));
  },
  onReady() {
    // for scroll in animation
    this.observeListItems();
  },
  computed: {
    // WTF VUE why do I need this
    currentAnimationCount() {
      return this.currentAnimations.length;
    },
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
      return this.currentAnimations.map((i) =>
        this.loaded ? activeAction[i.id]._clip.duration * i.loopTimes : 1
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
    // ! general

    navigateBack() {
      const lastPage = this.pageStack.pop();
      if (this.currentPage === "action" || this.currentPage === "pain") {
        // page turning
        this.finished = true;
        if (lastPage === "pain") {
          setTimeout(() => {
            this.currentPage = lastPage;
            this.initPainPage();
          }, 800);
        } else {
          setTimeout(() => {
            this.currentPage = lastPage;
            this.paused = true;
            this.finished = false;
            clock.stop();
          }, 800);
        }
      } else if (this.currentPage === "list") {
        for (let i = 0; i < this.listItems.length; i++) {
          this.listItemAnimationClasses[i].disappearAnimationClass =
            i % 2 === 0
              ? "list-item-fade-out-left"
              : "list-item-fade-out-right";
        }

        this.addButtonAnimationClass = "add-button-fade-out";

        setTimeout(() => {
          this.currentPage = lastPage;
          this.listItemAnimationClasses = new Array(this.listItems.length)
            .fill()
            .map((_) => ({
              appearAnimationClass: "list-item-out-bottom",
              disappearAnimationClass: "",
            }));
          this.addButtonAnimationClass = "";
        }, 500);
      } else if (this.currentPage === "complete") {
        this.leavingCompletePage = true;
        if (lastPage === "pain") {
          this.initPainPage(1300);
        }

        setTimeout(() => {
          this.currentPage = lastPage;
          this.leavingCompletePage = false;
        }, 1200);
      }
    },

    // ! guide

    onGuideButtonClick() {
      if (this.guideStage < 3) {
        this.guideStage++;
        setTimeout(() => {
          this.guide = guides[this.guideStage];
        }, 500);
      } else {
        this.guideStage++;
        setTimeout(() => {
          this.currentPage = "select";
        }, 500);
      }
    },

    // ! select

    onSelectButtonClick(index) {
      setTimeout(() => {
        this.selectItems[0]._class = "";
        this.selectItems[1]._class = "";
        this.currentPage = ["list", "pain"][index];
      }, 500);

      // if we are going to pain page, then we need to initialize that page
      if (index === 1) {
        this.initPainPage(600);
      }

      this.selectItems[index]._class = "list-item-expand";
      this.selectItems[1 - index]._class = "list-item-shrink";

      this.pageStack.push("select");
    },

    // ! list

    observeListItems() {
      if (observer) {
        observer.disconnect();
      }
      observer = uni.createIntersectionObserver(this, {
        observeAll: true,
      });
      observer
        .relativeToViewport({
          bottom: 0,
        })
        // make sure to only observe the items in list page not select page
        .observe(".list-content .list .list-item", (res) => {
          console.log(res);

          // this is because we use list-item class for the add button
          if (res.dataset.index === undefined) {
            return;
          }

          if (res.intersectionRatio > 0) {
            // appear
            this.listItemAnimationClasses[
              res.dataset.index
            ].appearAnimationClass = "";
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
        this.listItemAnimationClasses = new Array(this.listItems.length)
          .fill()
          .map((_) => ({
            appearAnimationClass: "list-item-out-bottom",
            disappearAnimationClass: "",
          }));
        this.addButtonAnimationClass = "";
      }, 500);

      const animations = this.listItems[index].animations;
      this.initActionPage(animations, 510);
      this.pageStack.push("list");
    },
    onAddButtonClick() {
      wx.showModal({
        title: "提示",
        content: "请录制一段小于十秒的视频",
        success: async (res) => {
          if (res.confirm) {
            const videoFileInfo = await wx.chooseMedia({
              count: 1,
              mediaType: ["video"],
            });
            const activityName = (
              await wx.showModal({
                title: "给您的视频取一个好记名字吧",
                showCancel: false,
                editable: true,
              })
            ).content;

            for (let i = 0; i < this.listItems.length; i++) {
              this.listItemAnimationClasses[i].disappearAnimationClass =
                i % 2 === 0
                  ? "list-item-fade-out-left"
                  : "list-item-fade-out-right";
            }
            this.addButtonAnimationClass = "add-button-fade-out";

            setTimeout(() => {
              this.currentPage = "add";
              this.addButtonAnimationClass = "";
              wx.showLoading({
                title: "加载中",
              });
            }, 600);

            const animationList = await this.add(videoFileInfo);

            this.listItems.unshift({
              // ! TODO upload this image to cloud and replace url
              coverUrl: videoFileInfo.tempFiles[0].thumbTempFilePath,
              title: activityName,
              animations: animationList,
            });

            // the length changed
            this.listItemAnimationClasses = new Array(this.listItems.length)
              .fill()
              .map((_) => ({
                appearAnimationClass: "list-item-out-bottom",
                disappearAnimationClass: "",
              }));

            wx.showToast({
              title: "分析完成",
              icon: "success",
              duration: 2000,
            });

            await sleep(2000);

            // the dom must haved changed after 2s
            this.observeListItems();

            this.canvasContainerAnimationClass =
              "canvas-container-disappear-animation";
            setTimeout(() => {
              this.canvasContainerAnimationClass = "";
              this.currentPage = "list";
            }, 500);
          }
        },
      });
    },

    // ! action & pain

    async initPainPage(canvasSizeResettingDelay = 100) {
      if (!this.loaded) {
        await wx.showLoading({
          title: "加载模型中",
        });
        await loadPromise;
        await wx.hideLoading();
      }
      this.addBalls();
      directionalLight.intensity = 0.2;
      controls.reset();
      controls.enabled = false;
      this.paused = false;
      this.finished = false;
      clock.start();

      const currentAction = activeAction[this.currentAnimationId];
      this.currentAnimations = [
        {
          id: "still",
          loopTimes: 100000,
        },
      ];
      this.$nextTick(() => {
        currentAction.fadeOut(FADING_DURATION);
        const nextAction = activeAction[this.currentAnimationId];
        nextAction.reset();
        nextAction.fadeIn(FADING_DURATION);
        nextAction.play();
      });

      this.currentAnimationIndex = 0;

      setTimeout(() => {
        this.resetCanvasSize();
      }, canvasSizeResettingDelay);
    },
    async initActionPage(animations, canvasSizeResettingDelay = 100) {
      if (!this.loaded) {
        await wx.showLoading({
          title: "加载模型中",
        });
        await loadPromise;
        await wx.hideLoading();
      }

      this.removeBalls();
      directionalLight.intensity = 1;
      controls.enabled = true;
      this.currentPlayingTime = 0;
      this.savedMixerTime = 0;
      this.waitingTime = WAITING_TIME_BEFORE_ACTION;
      this.waiting = true;
      this.paused = false;
      this.finished = false;
      clock.start();

      const currentAction = activeAction[this.currentAnimationId];
      this.currentAnimations = animations;
      this.$nextTick(() => {
        currentAction.fadeOut(FADING_DURATION);
        const nextAction = activeAction[this.currentAnimationId];
        nextAction.reset();
        nextAction.fadeIn(FADING_DURATION);
        nextAction.play();
      });

      this.currentAnimationIndex = 0;

      setTimeout(() => {
        this.resetCanvasSize();
      }, canvasSizeResettingDelay);
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
    async getCanvasInfo(selector) {
      return await new Promise((resolve) => {
        wx.createSelectorQuery()
          .select(selector)
          .boundingClientRect((rect) => {
            resolve(rect);
          })
          .exec();
      });
    },
    async resetCanvasSize() {
      const canvasInfo = await this.getCanvasInfo("#gl");
      canvasDimention.width = canvasInfo.width;
      canvasDimention.height = canvasInfo.height;

      camera.aspect = canvasInfo.width / canvasInfo.height;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasInfo.width, canvasInfo.height);
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

              this.pageStack.push("pain");
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
                      this.paused = true;
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

      this.loaded = true;
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

    // ! complete

    onClickCompleteRestart() {
      this.leavingCompletePage = true;

      setTimeout(() => {
        this.currentPage = "action";
        this.initActionPage(this.currentAnimations);
        // resetting the animation
        this.leavingCompletePage = false;
      }, 1200);
    },

    onClickCompleteBack() {
      this.navigateBack();
    },

    // ! add

    async add(videoFileInfo) {
      const videoDuration = videoFileInfo.tempFiles[0].duration * 1000;
      const canvas = await this.selectCanvas("#canvas");
      const detector = await getPoseDetector();
      const videoDecoder = new VideoDecoder(
        videoFileInfo.tempFiles[0].tempFilePath
      );

      let firstFrame = true;
      /** @type { Keypoint[][] } */
      const keypointsList = [];
      for await (const frame of videoDecoder.getFrames()) {
        const keypoints = await estimateFrame(detector, frame);
        keypointsList.push(keypoints);

        await drawPose(canvas, frame, keypoints);
        this.analyzeProgress = frame.pkPts / videoDuration;

        if (firstFrame) {
          firstFrame = false;
          wx.hideLoading();
        }
      }
      this.analyzeProgress = 1;

      return analyzeKeypointsList(keypointsList);
    },
  },
};
</script>

<style lang="scss">
@import "@/lib/material-icons.scss";

// ! general

$background-color: #f5f3f6;

// ! guide

$animation-duration: 0.8s;
$guide-button-size: 130rpx;
$guide-button-arrow-size: 0.5;
$guide-content-ratio: 7 2 2;

$theme-color: #000000;
// should be actually number of pages - 1
$guide-pages: 4;

// ! action & pain

$appear-disappear-animation-duration: 0.8s;

// ! complete

$check-height: 200rpx;
$check-width: calc($check-height/2);
$check-left: calc($check-height/3) + calc($check-height/6);
$check-thickness: 20px;
$check-color: rgb(37, 255, 37);

$complete-animation-duration: 0.8s;

page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: $background-color;

  .status-bar {
    position: relative;
    z-index: 10;
  }

  .nav-bar {
    position: relative;
    z-index: 10;

    flex-grow: 0;
    height: 80rpx;
    width: 100%;

    .nav-bar-box {
      height: 80rpx;
      width: 100%;

      .nav-bar-back-box {
        height: 80rpx;
        width: 80rpx;
        float: left;
        margin-left: 10rpx;

        @include material-icon(
          "black",
          #000000,
          "chevron-left",
          $material-icon-chevron-left
        );
        .back-arrow {
          opacity: 0.5;
          padding-top: 8rpx;
          width: 73rpx;
        }
      }

      .nav-bar-help-box {
        height: 80rpx;
        width: 80rpx;
        float: right;
        margin-right: 200rpx;

        @include material-icon("black", #000000, "help", $material-icon-help);
        .help {
          opacity: 0.24;
          padding-top: 8rpx;
          width: 73rpx;
        }
      }
    }
  }

  .actual-content {
    flex: 1;
    display: flex;
    flex-direction: column;

    .guide-content {
      flex: 1;
      display: flex;
      flex-direction: column;

      @mixin guide-content-animation-keyframes($index, $colorFrom, $colorTo) {
        @if $index < $guide-pages {
          @keyframes guide-content-animation-#{$index} {
            0% {
              background: $colorFrom;
              animation-timing-function: steps(1, end);
            }

            50% {
              background: $colorTo;
            }

            100% {
              background: $colorTo;
            }
          }
        } @else {
          // for page transitioning
          @keyframes guide-content-animation-#{$index} {
            0% {
              background: $colorFrom;
              animation-timing-function: steps(1, end);
            }

            100% {
              background: $colorFrom;
            }
          }
        }
      }

      @for $i from 1 through $guide-pages {
        @if $i % 2 == 1 {
          @include guide-content-animation-keyframes($i, white, $theme-color);
        } @else {
          @include guide-content-animation-keyframes($i, $theme-color, white);
        }
        &.guide-content-animation-#{$i} {
          animation-name: guide-content-animation-#{$i};
          animation-duration: $animation-duration;
          animation-fill-mode: forwards;
        }
      }

      .guide-area {
        flex-grow: nth($guide-content-ratio, 1);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        @mixin guide-area-animation-keyframes($index, $disappear-percentage) {
          @if $index < $guide-pages {
            @if $index % 2 == 1 {
              @keyframes guide-area-animation-#{$index} {
                0% {
                  transform: translateX(0rpx);
                  opacity: 100%;
                  animation-timing-function: linear;
                  color: black;
                }

                #{$disappear-percentage} {
                  transform: translateX(-300rpx);
                  opacity: 0%;
                  color: black;
                }

                #{100% - $disappear-percentage} {
                  transform: translateX(300rpx);
                  opacity: 0%;
                  animation-timing-function: linear;
                  color: white;
                }

                100% {
                  transform: translateX(0rpx);
                  opacity: 100%;
                  color: white;
                }
              }
            } @else {
              @keyframes guide-area-animation-#{$index} {
                0% {
                  transform: translateX(0rpx);
                  opacity: 100%;
                  animation-timing-function: linear;
                  color: white;
                }

                #{$disappear-percentage} {
                  transform: translateX(-300rpx);
                  opacity: 0%;
                  color: white;
                }

                #{100% - $disappear-percentage} {
                  transform: translateX(300rpx);
                  opacity: 0%;
                  animation-timing-function: linear;
                  color: black;
                }

                100% {
                  transform: translateX(0rpx);
                  opacity: 100%;
                  color: black;
                }
              }
            }
          } @else {
            // for page transitioning
            @keyframes guide-area-animation-#{$index} {
              0% {
                transform: translateX(0rpx);
                opacity: 100%;
                animation-timing-function: linear;
                color: white;
              }

              #{$disappear-percentage} {
                transform: translateX(-300rpx);
                opacity: 0%;
                color: white;
              }

              100% {
                transform: translateX(-300rpx);
                opacity: 0%;
              }
            }
          }
        }

        @for $i from 1 through $guide-pages {
          @include guide-area-animation-keyframes($i, 14%);

          &.guide-area-animation-#{$i} {
            animation-name: guide-area-animation-#{$i};
            animation-duration: $animation-duration;
            animation-fill-mode: forwards;
          }
        }

        .image-container {
          flex: 4;
          display: flex;
          justify-content: center;
          align-items: center;

          .image {
            border-radius: 40rpx;
            width: 400rpx;
            height: 600rpx;
          }
        }

        .text {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 40rpx;
          width: 80%;
        }
      }

      .button-area {
        flex-grow: nth($guide-content-ratio, 2);
        display: flex;
        justify-content: center;
        align-items: center;

        .button-anchor {
          display: flex;
          width: $guide-button-size;
          height: $guide-button-size;
          justify-content: center;
          align-items: center;

          // this is for the latter half of the animation of the button
          // we need to push the button to the right in a linear fasion
          @mixin button-anchor-animation-keyframes($index) {
            @keyframes button-anchor-animation-#{$index} {
              0% {
                margin-left: 0rpx;
              }

              50% {
                margin-left: 0rpx;
                animation-timing-function: ease-in;
              }

              100% {
                margin-left: $guide-button-size * 2;
              }
            }
          }

          @for $i from 1 through $guide-pages {
            @include button-anchor-animation-keyframes($i);
            &.button-anchor-animation-#{$i} {
              animation-name: button-anchor-animation-#{$i};
              animation-duration: $animation-duration;
              animation-fill-mode: forwards;
            }
          }

          .button {
            width: $guide-button-size;
            height: $guide-button-size;
            position: absolute;
            border-radius: 50%;
            background: $theme-color;

            display: flex;
            justify-content: center;
            align-items: center;

            @mixin button-animation-keyframes($index, $colorFrom, $colorTo) {
              @if $index < $guide-pages {
                @keyframes button-animation-#{$index} {
                  0% {
                    width: $guide-button-size;
                    height: $guide-button-size;
                    margin-left: 0rpx;
                    margin-right: 0rpx;
                    background: $colorFrom;
                    animation-timing-function: cubic-bezier(1, 0, 1, 0);
                  }

                  50% {
                    width: 200000rpx + $guide-button-size;
                    height: 200000rpx + $guide-button-size;
                    margin-left: 200000rpx;
                    margin-right: 0rpx;
                    background: $colorFrom;
                  }

                  50% {
                    width: 200000rpx + $guide-button-size;
                    height: 200000rpx + $guide-button-size;
                    margin-left: 0rpx;
                    margin-right: 200000rpx + $guide-button-size * 2;
                    background: $colorTo;
                    animation-timing-function: cubic-bezier(0, 1, 0, 1);
                  }

                  100% {
                    width: $guide-button-size;
                    height: $guide-button-size;
                    margin-left: 0rpx;
                    margin-right: $guide-button-size * 2;
                    background: $colorTo;
                  }
                }
              } @else {
                @keyframes button-animation-#{$index} {
                  0% {
                    width: $guide-button-size;
                    height: $guide-button-size;
                    margin-right: 0rpx;
                    background: $colorFrom;
                    animation-timing-function: cubic-bezier(
                      0.18,
                      0.55,
                      0.43,
                      0.81
                    );
                  }

                  100% {
                    width: 4000rpx;
                    height: 4000rpx;
                    background: $colorFrom;
                  }
                }
              }
            }

            @for $i from 1 through $guide-pages {
              @if $i % 2 == 1 {
                @include button-animation-keyframes($i, $theme-color, white);
              } @else {
                @include button-animation-keyframes($i, white, $theme-color);
              }
              &.button-animation-#{$i} {
                animation-name: button-animation-#{$i};
                animation-duration: $animation-duration;
                animation-fill-mode: forwards;
              }
            }

            @mixin button-arrow-animation-keyframes(
              $index,
              $disappear-percentage
            ) {
              @if $index % 2 == 1 {
                @keyframes button-arrow-white-animation-#{$index} {
                  0% {
                    opacity: 100%;
                    animation-timing-function: linear;
                  }

                  #{$disappear-percentage} {
                    opacity: 0%;
                  }

                  100% {
                    opacity: 0%;
                  }
                }
              } @else {
                @keyframes button-arrow-white-animation-#{$index} {
                  0% {
                    opacity: 0%;
                  }

                  #{100% - $disappear-percentage} {
                    opacity: 0%;
                    animation-timing-function: linear;
                  }

                  100% {
                    opacity: 100%;
                  }
                }
              }

              @if $index % 2 == 0 {
                @keyframes button-arrow-theme-animation-#{$index} {
                  0% {
                    opacity: 100%;
                    animation-timing-function: linear;
                  }

                  #{$disappear-percentage} {
                    opacity: 0%;
                  }

                  100% {
                    opacity: 0%;
                  }
                }
              } @else {
                @keyframes button-arrow-theme-animation-#{$index} {
                  0% {
                    opacity: 0%;
                  }

                  #{100% - $disappear-percentage} {
                    opacity: 0%;
                    animation-timing-function: linear;
                  }

                  100% {
                    opacity: 100%;
                  }
                }
              }
            }

            @for $i from 1 through $guide-pages {
              @include button-arrow-animation-keyframes($i, 14%);
              .button-arrow-white-animation-#{$i} {
                animation-name: button-arrow-white-animation-#{$i};
                animation-duration: $animation-duration;
                animation-fill-mode: forwards;
              }
              .button-arrow-theme-animation-#{$i} {
                animation-name: button-arrow-theme-animation-#{$i};
                animation-duration: $animation-duration;
                animation-fill-mode: forwards;
              }
            }

            @include material-icon(
              "white",
              #ffffff,
              "chevron-right",
              $material-icon-chevron-right
            );
            .button-arrow-white {
              // we use absolute position because we need to stack two arrows on top of each other
              position: absolute;
              padding-top: 10rpx;
              width: $guide-button-size * $guide-button-arrow-size;

              opacity: 100%;
            }

            @include material-icon(
              "theme",
              $theme-color,
              "chevron-right",
              $material-icon-chevron-right
            );
            .button-arrow-theme {
              position: absolute;
              padding-top: 10rpx;
              width: $guide-button-size * $guide-button-arrow-size;

              opacity: 0%;
            }
          }
        }
      }

      .bottom-place-holder {
        flex-grow: nth($guide-content-ratio, 3);
      }
    }

    .select-content {
      flex: 1;
      display: flex;
      background: $background-color;

      .list {
        flex: 1;
        display: flex;
        flex-direction: column;

        .list-item {
          flex: 1;
          display: flex;

          transition: all 0.5s;
          position: relative;
          margin: 20rpx;
          border-radius: 30rpx;
          box-shadow: rgba(0, 0, 0, 0.19) 0rpx 20rpx 40rpx,
            rgba(0, 0, 0, 0.23) 0rpx 12rpx 12rpx;

          touch-action: manipulation;

          @keyframes list-item-fade-in-from-top {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0%);
              opacity: 1;
            }
          }

          @keyframes list-item-fade-in-from-bottom {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0%);
              opacity: 1;
            }
          }

          &.list-item-fade-in-from-top {
            animation: list-item-fade-in-from-top 0.8s ease-out;
          }

          &.list-item-fade-in-from-bottom {
            animation: list-item-fade-in-from-bottom 0.8s ease-out;
          }

          &:active {
            pointer-events: none;
            transform: scale(0.96);
          }

          &:hover {
            transform: scale(0.96);
          }

          &.list-item-expand {
            margin: 0rpx !important;
            border-radius: 0rpx !important;
            opacity: 0%;

            .list-item-content {
              .button-background-image {
                border-radius: 0rpx !important;
              }

              .translucent-box {
                border-radius: 0rpx !important;
              }
            }
          }

          &.list-item-shrink {
            flex: 0 !important;
            margin: 0rpx !important;
            border-radius: 0rpx !important;
            opacity: 0%;
          }

          .list-item-content {
            flex: 1;

            .button-background-image {
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
              background: rgba(0, 0, 0, 0.7);

              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;

              .button-title {
                font-size: 50rpx;
                color: #ffffff;
              }

              .button-description {
                margin: 30rpx 60rpx 0 60rpx;
                font-size: 30rpx;
                color: #ffffff;
              }
            }
          }
        }
      }
    }

    .list-content {
      flex: 1;
      background: $background-color;

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

          &:active {
            pointer-events: none;
            transform: scale(0.96);
          }

          &:hover {
            transform: scale(0.96);
          }

          &.list-item-out-bottom {
            margin-top: 60rpx !important;
            opacity: 0;
          }

          &.list-item-out-top {
            margin-bottom: 60rpx !important;
            opacity: 0;
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

    .complete-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      background: $background-color;

      .top-placeholder {
        flex: 2;
      }

      .checkmark-wrapper {
        flex: 1;
        width: $check-height;
        position: relative;

        .checkmark {
          @keyframes checkmark-appear-animation {
            0% {
              height: 0;
              width: 0;
            }
            50% {
              height: 0;
              width: $check-width;
            }
            100% {
              height: $check-height;
              width: $check-width;
            }
          }

          @keyframes checkmark-disappear-animation {
            0% {
              height: $check-height;
              width: $check-width;
            }
            50% {
              height: 0;
              width: $check-width;
            }
            99% {
              height: 0;
              width: 0;
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }

          &.checkmark-appear-animation:after {
            animation-duration: $complete-animation-duration;
            animation-timing-function: ease;
            animation-name: checkmark-appear-animation;
            transform: scaleX(-1) rotate(135deg);
          }

          &.checkmark-disappear-animation:after {
            animation-duration: $complete-animation-duration;
            animation-timing-function: ease;
            animation-name: checkmark-disappear-animation;
            animation-fill-mode: forwards;
            transform: scaleX(-1) rotate(135deg);
          }

          &:after {
            height: $check-height;
            width: $check-width;
            transform-origin: left top;
            border-right: $check-thickness solid $check-color;
            border-top: $check-thickness solid $check-color;
            content: "";
            position: absolute;
          }
        }
      }

      .buttons {
        flex: 1;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        .button {
          width: 240rpx;
          height: 100rpx;
          background: white;
          border-radius: 50rpx;
          box-shadow: rgba(0, 0, 0, 0.19) 0rpx 6rpx 30rpx,
            rgba(0, 0, 0, 0.2) 0rpx 6rpx 6rpx;

          display: flex;
          justify-content: center;
          align-items: center;

          // font-weight: bold;
          font-size: 50rpx;
        }

        .restart-button {
          margin-right: 100rpx;

          @keyframes restart-button-appear-animation {
            from {
              transform: translateX(-700rpx);
            }
            to {
              transform: translateX(0);
            }
          }

          @keyframes restart-button-disappear-animation {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-700rpx);
            }
          }

          &.restart-button-appear-animation {
            animation: restart-button-appear-animation
              $complete-animation-duration ease-in-out forwards;
          }

          &.restart-button-disappear-animation {
            animation: restart-button-disappear-animation
              $complete-animation-duration ease-in-out forwards;
          }
        }

        .back-button {
          @keyframes back-button-appear-animation {
            from {
              transform: translateX(700rpx);
            }
            to {
              transform: translateX(0);
            }
          }

          @keyframes back-button-disappear-animation {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(700rpx);
            }
          }

          &.back-button-appear-animation {
            animation: back-button-appear-animation $complete-animation-duration
              ease-in-out forwards;
          }

          &.back-button-disappear-animation {
            animation: back-button-disappear-animation
              $complete-animation-duration ease-in-out forwards;
          }
        }
      }

      .bottom-placeholder {
        flex: 2;
      }
    }

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
}
</style>
