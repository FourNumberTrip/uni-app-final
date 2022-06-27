import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { readFile, writeFile } from "./utils/file";
import { downloadFromCloudStorage } from "./utils/wx-database";

export async function loadGLTF(data: ArrayBuffer) {
  const gltfLoader = new GLTFLoader();
  return await new Promise<GLTF>((resolve) => {
    gltfLoader.parse(data, "", (gltf) => {
      resolve(gltf);
    });
  });
}

export async function getGLTFData() {
  let gltfData: ArrayBuffer;
  try {
    gltfData = (await readFile(
      `${wx.env.USER_DATA_PATH}/final.glb`,
      undefined
    )) as ArrayBuffer;
  } catch (e) {
    gltfData = (await downloadFromCloudStorage(
      "cloud://wunong-8gv2gdnhe01614cd.7775-wunong-8gv2gdnhe01614cd-1312488745/resources/final.glb",
      undefined
    )) as ArrayBuffer;
    writeFile(`${wx.env.USER_DATA_PATH}/final.glb`, gltfData, undefined);
  }
  return gltfData;
}
