import * as tf from "@tensorflow/tfjs-core";
import { readFile, writeFile } from "./file";
import { requestFile } from "./network";
import { downloadFromCloudStorage } from "./wx-database";

export type ModelArtifacts = {
  modelTopology: {};
  weightSpecs: {};
  weightData: ArrayBuffer;
};

export async function downloadModel(): Promise<ModelArtifacts> {
  const [modelTopologyText, weightSpecsText, weightData] = await Promise.all([
    downloadFromCloudStorage(
      "cloud://wunong-8gv2gdnhe01614cd.7775-wunong-8gv2gdnhe01614cd-1312488745/resources/modelTopology.json",
      "utf8"
    ) as Promise<string>,
    downloadFromCloudStorage(
      "cloud://wunong-8gv2gdnhe01614cd.7775-wunong-8gv2gdnhe01614cd-1312488745/resources/weightSpecs.json",
      "utf8"
    ) as Promise<string>,
    downloadFromCloudStorage(
      "cloud://wunong-8gv2gdnhe01614cd.7775-wunong-8gv2gdnhe01614cd-1312488745/resources/weightData.bin",
      undefined
    ) as Promise<ArrayBuffer>,
  ]);

  return {
    modelTopology: JSON.parse(modelTopologyText),
    weightSpecs: JSON.parse(weightSpecsText),
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
