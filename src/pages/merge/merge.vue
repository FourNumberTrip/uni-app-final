<template>
  <view class="content">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <view class="nav-bar">
      <view class="nav-bar-box">
        <view
          v-if="currentPage !== 'select' && currentPage !== 'add'"
          class="nav-bar-back-box"
          @click="navigateBack"
        >
          <view
            :class="['back-arrow', 'material-icon']"
            data-color="black"
            data-icon="chevron-left"
          ></view>
        </view>
        <view
          v-if="currentPage === 'select'"
          class="nav-bar-help-box"
          @click="onHelpButtonClick"
        >
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
          :class="[
            'pain-prompt',
            finished
              ? 'pain-prompt-disappear-animation'
              : 'pain-prompt-appear-animation',
          ]"
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
const WAITING_TIME_BEFORE_ACTION = 10;
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
            "热身运动可以增加您的活动能力，并且可以防止拉伤和抽筋等急性伤害。如果在列表内没有找到您的活动，可以点击列表最下方的添加按钮进行录制添加。",
          _class: "",
        },
        {
          image: "https://mp.muzi.fun/resources/images/select/pain-spots.webp",
          title: "疼痛缓解",
          description:
            "如果您在农务活动中发生扭伤，抽筋等急性伤害，可以通过做一些疼痛缓解动作来解决。",
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
        still: "加载中...",
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
      } else if (this.currentPage === "guide") {
        this.guideStage = 4;
        setTimeout(() => {
          this.guideStage = 0;
          this.currentPage = lastPage;
        }, 400);
      }
    },

    onHelpButtonClick() {
      setTimeout(() => {
        this.selectItems[0]._class = "";
        this.selectItems[1]._class = "";
        this.currentPage = "guide";
      }, 500);

      this.selectItems[0]._class = "list-item-expand";
      this.selectItems[1]._class = "list-item-shrink";
      this.pageStack.push("select");
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
          this.guideStage = 0;
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
              this.finished = true;
              setTimeout(() => {
                this.currentPage = "action";
                this.initActionPage(this.painReliefAnimations[jointName]);
              }, 800);
              activeAction["still"].stop();
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
@import "@/scss/general.scss";

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

  @import "@/scss/nav-bar.scss";

  .actual-content {
    flex: 1;
    display: flex;
    flex-direction: column;

    @import "@/scss/guide.scss";

    @import "@/scss/select.scss";

    @import "@/scss/list.scss";

    @import "@/scss/action.scss";

    @import "@/scss/complete.scss";

    @import "@/scss/add.scss";
  }
}
</style>
