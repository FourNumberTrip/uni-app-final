<template>
  <view class="content">
    <canvas
        class="webgl"
        type="webgl"
        id="gl"
        @touchstart="onTX"
        @touchend="onTX"
    ></canvas>
    <text @click="autoTurn">
      <text v-if="front">显示背面</text>
      <text v-else>显示正面</text>
    </text>
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
  Raycaster
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
//选中模型
let rayCaster;
let INTERSECTED;
let pointer;

export default {
  data() {
    return {
      front:true,
      turning: false,
      cnt_turn: 0,
      paused: false,
      lowSpeed: false,
      url: "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb",
    };
  },
  mounted() {
    this.load(this.url);
  },
  methods: {
    // togglePause() {
    //   let cur_action = activeAction[this.currentAnimationId];
    //   if (this.paused) {
    //     cur_action.paused = false;
    //     this.paused = false;
    //     // this controls the animation
    //     clock.start();
    //   } else {
    //     cur_action.paused = true;
    //     this.paused = true;
    //
    //     clock.stop();
    //   }
    // },
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

            rayCaster = new Raycaster();

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
              responseType: "arraybuffer",
              success: (res) => {
                const gltfLoader = new GLTFLoader();
                gltfLoader.parse(res.data, "", (gltf) => {
                  gltf.parser = null;
                  // TODO CHANGE THIS
                  gltf.scene.position.y = -2.2;
                  scene.add(gltf.scene);
                  // mixer = new AnimationMixer(gltf.scene);
                  // for (const animation of gltf.animations) {
                  //   activeAction.push(mixer.clipAction(animation));
                  //   this.animationDurations.push(animation.duration);
                  // }
                  // activeAction[this.currentAnimationId].play();
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
              rayCaster.setFromCamera( pointer, camera );

              const intersects = rayCaster.intersectObjects( scene.children, false );

              if ( intersects.length > 0 ) {
                if ( INTERSECTED != intersects[ 0 ].object ) {
                  if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                  INTERSECTED = intersects[ 0 ].object;
                  INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                  INTERSECTED.material.emissive.setHex( 0xff0000 );
                }
              } else {
                if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                INTERSECTED = null;
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
      this.front=!this.front;
    },
    turn(step) {
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
      pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
      pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
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

  .webgl {
    flex: 10;
    /*z-index: 0;*/
    width: 100%;
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
    flex: 2;
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
      @include material-icon("black", #707070, "play", $material-icon-play-arrow);
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
</style>

