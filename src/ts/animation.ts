import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export async function loadGLTF(data: ArrayBuffer) {
  const gltfLoader = new GLTFLoader();
  return await new Promise<GLTF>((resolve) => {
    gltfLoader.parse(data, "", (gltf) => {
      resolve(gltf);
    });
  });
}
