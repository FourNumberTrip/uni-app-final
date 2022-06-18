import Vue from "vue";
import App from "./App";

import * as fetchWechat from "fetch-wechat";
import * as tf from "@tensorflow/tfjs-core";
import * as webgl from "@tensorflow/tfjs-backend-webgl";

const plugin = requirePlugin("tfjsPlugin");

plugin.configPlugin({
  // polyfill fetch function
  fetchFunc: fetchWechat.fetchFunc(),
  // inject tfjs runtime
  tf,
  // inject webgl backend
  webgl,
  // provide webgl canvas
  canvas: wx.createOffscreenCanvas(),
});

Vue.config.productionTip = false;

App.mpType = "app";

const app = new Vue({
  ...App,
});
app.$mount();
