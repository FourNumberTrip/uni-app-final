<template>
  <view class="content">
    <canvas
      class="webgl"
      type="webgl"
      id="gl"
      @touchstart="onTX"
      @touchmove="onTX"
      @touchend="onTX"
      :style="{ height: screenHeight + 'px' }"
    ></canvas>

    <button @click="turnBack" style="margin-top: 0px">直接转</button>
    <button @click="autoTurn" style="margin-top: 30px">动画转</button>

    <button @click="reset" style="margin-top: 40px">复位</button>

    <text class="action_name">肩部绕环</text>

    <view class="list">
      <view
        class="list-item"
        v-for="(item, index) in items"
        :key="item.title"
        @ontouchstart="onTouchStart(index)"
        @touchend="onTouchEnd(index)"
      >
        <img class="image" :src="item.image" />
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
  Vector3,
  WebGL1Renderer,
} from "three";
import { WechatPlatform, PlatformManager } from "platformize-three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
let clock = new Clock();
let mixer;
let gltfLoader;
let controls;
let renderer;
let canvas;
let scene;
let camera;
let platform;
let disposing = false;
let frameId = -1;
let activeAction=[];

export default {
  data() {
    return {
      screenHeight : "",
      turning:false,
      cnt_turn:0,
      cur_idx:0,
      url:"https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb",
      items: [
        {
          image: "/static/small.png",
          title:"action1",
          touchDown: false,
        },
        {
          image: "/static/small.png",
          title:"action2",
          touchDown: false,
        },
        {
          image: "/static/small.png",
          title:"action3",
          touchDown: false,
        },
        {
          image: "/static/small.png",
          title:"action4",
          touchDown: false,
        },
      ],
    };
  },
  onLoad() {
    // this.load("https://egg.moe/custom/untitled1.glb")
  },
  mounted() {
    this.screenHeight = uni.getSystemInfoSync().windowHeight
    this.load(this.url)
  },
  methods: {
    reset(){
      controls.reset()
    },
    action(index){
            activeAction[this.cur_idx].stop();
            activeAction[index].play();
            this.cur_idx=index;
    },
    load(url){
      console.log("loading:")
      console.log(url)
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
                1,
                2000
            );

            camera.position.set(0, 2, 4);
            camera.lookAt(new Vector3(0, 0, 0));
            scene = new Scene();
            gltfLoader = new GLTFLoader();
            controls = new OrbitControls(camera, canvas);
            controls.enableDamping = true;
            uni.request({
              url: url,
              // url: "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb",
              // url: "https://egg.moe/custom/untitled1.glb",
              responseType: "arraybuffer",
              success: (res) => {
                gltfLoader.parse(res.data, "", (gltf) => {
                  gltf.parser = null;
                  gltf.scene.position.y = -1;
                  scene.add(gltf.scene);
                  mixer = new AnimationMixer(gltf.scene);
                  for (let i=0;i<gltf.animations.length;i++){
                    activeAction[i]=mixer.clipAction(gltf.animations[i])
                  }
                  activeAction[this.cur_idx].play();
                });
              },
            });
            // this.action(0)
            // camera.position.z = 10;
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
                // console.log("hello render")
              if(this.turning) this.turn(0.01);
              if (mixer) mixer.update(clock.getDelta());
              if (!disposing)
                frameId = canvas.requestAnimationFrame(render);
              controls.update();
              renderer.render(scene, camera);
            };
            render();
          });
    },
    // render(mixer){
    //   // console.log("hello render")
    //   if (mixer) mixer.update(clock.getDelta());
    //   if (!this.disposing)
    //     this.frameId = this.canvas.requestAnimationFrame(this.render);
    //   this.controls.update();
    //   this.renderer.render(this.scene, this.camera);
    // },
    onTouchStart(index) {
    },
    onTouchEnd(index) {
      this.action(index)
      this.cur_idx=index
      console.log("onTouchEnd")
      console.log(index)
    },
    onTX(e) {
      platform.dispatchTouchEvent(e);
    },
    turnBack(){
      console.log(scene)
      scene.rotateY(Math.PI);
    },
    autoTurn(){
      this.cnt_turn=0
      this.turning=true;
    },
    turn(step){
      // let step=0.01
      controls.update();
      renderer.render(scene, camera);
      scene.rotateY(step*Math.PI)
      this.cnt_turn+=1;
      if(this.cnt_turn>=(1/step)){
        this.turning=false;
      }
    }
  },
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;

  height: 500px;
  align-content: center;
}
.webgl {
  /*z-index: 0;*/
  width: 100%;
  height: 100%;
}
.action_name {
  position: fixed;
  margin-left: 10%;
  margin-top: 380px;
}
.list {
  /*z-index: 1;*/
  position: absolute;
  height: 10%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  position: fixed;
  margin-top: 420px;
  /*margin-left:10%;*/
}

.list-item {
  width: 34px;
  /*z-index: 1;*/
  transition: all 200ms;
  touch-action: manipulation;
  position: relative;
  margin-left: 20px;
}

.list-item:active {
  pointer-events: none;
  transform: scale(0.9);
}

.list-item:hover {
  transform: scale(0.9);
}

.image {
  /*z-index: 1;*/
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 5px 10px, rgba(0, 0, 0, 0.23) 0px 3px 3px;
}
</style>
