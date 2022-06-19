import * as tf from "@tensorflow/tfjs-core";
import { readFile, writeFile } from "./file";
import { requestFile } from "./network";

export type ModelArtifacts = {
  modelTopology: {};
  weightSpecs: {};
  weightData: ArrayBuffer;
};

export async function downloadModel(): Promise<ModelArtifacts> {
  const [modelTopology, weightSpecs, weightData] = await Promise.all([
    requestFile(
      "https://mp.muzi.fun/resources/ml-models/movenet-lightning-int8/modelTopology.json",
      "text"
    ) as Promise<{}>,
    requestFile(
      "https://mp.muzi.fun/resources/ml-models/movenet-lightning-int8/weightSpecs.json",
      "text"
    ) as Promise<{}>,
    requestFile(
      "https://mp.muzi.fun/resources/ml-models/movenet-lightning-int8/weightData.bin",
      "arraybuffer"
    ) as Promise<ArrayBuffer>,
  ]);

  return {
    modelTopology,
    weightSpecs,
    weightData,
  };
}

export async function readModelFromFile(): Promise<ModelArtifacts> {
  const modelTopology = JSON.parse(
    // @ts-ignore
    await readFile(`${wx.env.USER_DATA_PATH}/modelTopology.json`, "utf8")
  ) as {};
  const weightSpecs = JSON.parse(
    // @ts-ignore
    await readFile(`${wx.env.USER_DATA_PATH}/weightSpecs.json`, "utf8")
  ) as {};
  const weightData = (await readFile(
    `${wx.env.USER_DATA_PATH}/weightData.bin`,
    undefined
  )) as ArrayBuffer;
  return {
    modelTopology,
    weightSpecs,
    weightData,
  };
}

export async function writeModelToFile(modelArtifacts: ModelArtifacts) {
  await Promise.all([
    writeFile(
      `${wx.env.USER_DATA_PATH}/modelTopology.json`,
      JSON.stringify(modelArtifacts.modelTopology),
      "utf8"
    ),
    writeFile(
      `${wx.env.USER_DATA_PATH}/weightSpecs.json`,
      JSON.stringify(modelArtifacts.weightSpecs),
      "utf8"
    ),
    writeFile(
      `${wx.env.USER_DATA_PATH}/weightData.bin`,
      modelArtifacts.weightData,
      undefined
    ),
  ]);
}

export function wxFrameData2DetectorInput(frameData: any) {
  return tf.slice(
    tf.tensor3d(new Uint8Array(frameData.data), [
      frameData.height,
      frameData.width,
      4,
    ]),
    [0, 0, 0],
    [-1, -1, 3]
  );
}
