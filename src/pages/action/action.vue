<template>
  <view class="content">
    <canvas
      class="webgl"
      type="webgl"
      id="gl"
      @touchstart="onTX"
      @touchmove="onTX"
      @touchend="onTX"
      :style="{height:screenHeight+'px'}"
    ></canvas>

    <text class="action_name">肩部绕环</text>

    <view class="list">
      <view
          class="list-item"
          v-for="(item, index) in items"
          :key="item.title"
          ontouchstart="onTouchStart"
          @touchend="onTouchEnd(index)"
      >
        <img class="image" :src="item.image">
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

export default {
  data() {
    return {
      disposing: false,
      platform: null,
      frameId: -1,
      screenHeight:"",
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
    uni
      .createSelectorQuery()
      .select("#gl")
      .node()
      .exec((res) => {
        let mixer;
        let clock = new Clock();

        const canvas = res[0].node;

        this.platform = new WechatPlatform(canvas);
        console.log(this.platform);
        PlatformManager.set(this.platform);

        const renderer = new WebGL1Renderer({
          canvas,
          antialias: true,
          alpha: true,
        });
        const camera = new PerspectiveCamera(
          45,
          canvas.width / canvas.height,
          1,
          2000
        );
        camera.position.set(0, 2, 4);
        camera.lookAt(new Vector3(0, 0, 0));
        const scene = new Scene();
        const gltfLoader = new GLTFLoader();
        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;

        uni.request({
          url: "https://egg.moe/custom/untitled1.glb",
          responseType: "arraybuffer",
          success: (res) => {
            gltfLoader.parse(res.data, "", (gltf) => {
              gltf.parser = null;
              gltf.scene.position.y = -1;
              scene.add(gltf.scene);
              mixer = new AnimationMixer(gltf.scene);
              let activeAction = mixer.clipAction(gltf.animations[0]);
              activeAction.play();
            });
          },
        });

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
          if (mixer) mixer.update(clock.getDelta());
          if (!this.disposing)
            this.frameId = canvas.requestAnimationFrame(render);
          controls.update();
          renderer.render(scene, camera);
        };
        render();
      });
  },
  mounted() {
    this.screenHeight = uni.getSystemInfoSync().windowHeight
  },
  methods: {
    onTouchStart(index) {},
    onTouchEnd(index) {},
    onTX(e) {
      this.platform.dispatchTouchEvent(e);
    },
  },
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  height:500px;
  align-content: center;
}
.webgl{
  z-index: 0;
}
.action_name{
  position: fixed;
  margin-left: 10%;
  margin-top: 380px;
}
.list {
  z-index: 1;
  position: absolute;
  height: 10%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content:center;
  position: fixed;
  margin-top: 420px;
  /*margin-left:10%;*/
}

.list-item {
  width: 34px;
  z-index: 1;
  transition: all 200ms;
  touch-action: manipulation;
  position: relative;
  margin-left: 20px;
}

.list-item:active {
  pointer-events: none;
  transform: scale(0.96);
}

.list-item:hover {
  transform: scale(0.96);
}

.image {
  z-index: 1;
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 5px 10px, rgba(0, 0, 0, 0.23) 0px 3px 3px;
}

</style>
