<template>
  <view class="content">
    <canvas
      class="webgl"
      type="webgl"
      id="gl"
      @touchstart="onTX"
      @touchend="onTX"
      @click="move"
    ></canvas>
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

let rayCaster;
let INTERSECTED;
let pointer = new Vector2();
let jud = true;
let jointsBallGlow = [];

export default {
  data() {
    return {
      front: true,
      turning: false,
      cnt_turn: 0,
      paused: false,
      lowSpeed: false,
      url: "https://mp.muzi.fun/resources/models/final.glb",

      balls: [
        { x: 0, y: 2.1, part: "neck" },
        { x: -0.45, y: 1.8, part: "shoulders" },
        { x: 0.45, y: 1.8, part: "shoulders" },
        { x: -0.3, y: 0.3, part: "hips" },
        { x: 0.3, y: 0.3, part: "hips" },
        { x: -0.34, y: -2.3, part: "ankles" },
        { x: 0.34, y: -2.3, part: "ankles" },
        { x: -0.35, y: -1.2, part: "knees" },
        { x: 0.35, y: -1.2, part: "knees" },
        { x: -0.35, y: -0.6, part: "legs" },
        { x: 0.35, y: -0.6, part: "legs" },
        { x: -0.35, y: -1.8, part: "legs" },
        { x: 0.35, y: -1.8, part: "legs" },
      ],

      jointAnimations: {
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
    };
  },
  mounted() {
    this.load(this.url);
  },
  methods: {
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
          // ! set the alpha value to 0 when transition to action page
          renderer.setClearColor(0xffffff, 1);

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
                gltf.scene.position.y = -3;
                gltf.scene.scale.multiplyScalar(3.5);
                scene.add(gltf.scene);
              });
            },
          });

          //关节位置小球
          const geometry = new SphereGeometry(1, 32, 16);

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
            jointsBallGlow[i] = new Mesh(geometry, customMaterial.clone());
            jointsBallGlow[i].scale.multiplyScalar(0.2);
            jointsBallGlow[i].position.set(
              this.balls[i].x,
              this.balls[i].y,
              1.5
            );
            scene.add(jointsBallGlow[i]);
          }

          renderer.outputEncoding = sRGBEncoding;
          scene.add(new AmbientLight(0xffffff, 1.0));
          const directionalLight = new DirectionalLight(0xffffff, 0.2);
          directionalLight.position.set(1, 2, 1);
          scene.add(directionalLight);
          renderer.setSize(canvas.width, canvas.height);
          uni.getSystemInfo({
            success: (res) => {
              renderer.setPixelRatio(res.pixelRatio);
            },
          });

          const render = () => {
            if (this.turning) {
              this.turn(0.01);
            }
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
            for (let i = 0; i < this.balls.length; i++) {
              jointsBallGlow[i].material.uniforms.viewVector.value =
                new Vector3().subVectors(
                  camera.position,
                  jointsBallGlow[i].position
                );
            }

            //获取鼠标指向的模型
            rayCaster.setFromCamera(pointer, camera);

            const intersects = rayCaster.intersectObjects(
              scene.children,
              false
            );

            if (intersects.length > 0) {
              if (jud) {
                console.log(intersects[0]);
                jud = false;
              }

              // ! intersects[0].object is the glowing ball the ray intersected with
              if (INTERSECTED != intersects[0].object) {
                if (INTERSECTED) INTERSECTED.material.uniforms["p"].value = 3;
                INTERSECTED = intersects[0].object;
                // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.uniforms["p"].value = 0;
              }
            } else {
              // if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
              if (INTERSECTED) INTERSECTED.material.uniforms["p"].value = 3;
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
      this.front = !this.front;
      for (let i = 0; i < this.balls.length; i++) {
        scene.remove(jointsBallGlow[i]);
      }
    },
    turn(step) {
      controls.update();
      renderer.render(scene, camera);
      scene.rotateY(step * Math.PI);
      this.cnt_turn += 1;
      if (this.cnt_turn >= 1 / step) {
        this.turning = false;
        this.addBalls();
      }
    },
    addBalls() {
      for (let i = 0; i < this.balls.length; i++) {
        if (this.front) {
          jointsBallGlow[i].position.z = 1.5;
        } else {
          jointsBallGlow[i].position.z = -1.5;
        }
        scene.add(jointsBallGlow[i]);
      }
    },

    // for three.js touch control
    onTX(e) {
      platform.dispatchTouchEvent(e);
      this.jud = true; //打印信息
    },
    move(e) {
      uni.getSystemInfo({
        success: (res) => {
          pointer.x = (e.touches[0].pageX / res.windowWidth) * 2 - 1;
          pointer.y = -(e.touches[0].pageY / res.windowHeight) * 2 + 1;
          console.log(pointer);
        },
      });
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
</style>

