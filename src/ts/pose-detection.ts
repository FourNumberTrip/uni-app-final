import * as poseDetection from "@tensorflow-models/pose-detection";
import {
  readModelFromFile,
  ModelArtifacts,
  downloadModel,
  writeModelToFile,
  wxFrameData2DetectorInput,
} from "./utils/tfjs";
import * as tf from "@tensorflow/tfjs-core";

export async function getPoseDetector() {
  // ! uncommment those to test the case when user haven't downloaded the model file
  // await removeFile(`${wx.env.USER_DATA_PATH}/modelTopology.json`);
  // await removeFile(`${wx.env.USER_DATA_PATH}/weightSpecs.json`);
  // await removeFile(`${wx.env.USER_DATA_PATH}/weightData.bin`);

  let modelArtifacts: ModelArtifacts;
  try {
    modelArtifacts = await readModelFromFile();
  } catch (_) {
    modelArtifacts = await downloadModel();
    await writeModelToFile(modelArtifacts);
  }

  return await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      modelUrl: tf.io.fromMemory(modelArtifacts),
    }
  );
}

export async function estimateFrame(
  detector: poseDetection.PoseDetector,
  frameData: WechatMiniprogram.FrameDataOptions
) {
  const poses = await detector.estimatePoses(
    wxFrameData2DetectorInput(frameData),
    {},
    frameData.pkPts
  );
  return poses[0].keypoints;
}
