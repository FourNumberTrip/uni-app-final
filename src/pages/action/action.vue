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

    <view
        class="list-item"
        style="flex-grow: 1; display: flex"
        v-for="(item, index) in items"
        :key="item.title"
        ontouchstart="onTouchStart"
        @touchend="onTouchEnd(index)"
    >
      <image class="button-background-image" :src="item.image"> </image>
      <view class="translucent">
        <text class="button-title">{{ item.title }}</text>
        <text class="button-description">{{ item.description }}</text>
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
      screenHeight:""
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
        camera.position.set(0, 3, 3);
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
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin: 200rpx auto 50rpx auto;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
