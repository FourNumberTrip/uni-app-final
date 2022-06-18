import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";

export async function getPoseDetector(modelArtifacts: {
  modelTopology: object,
  weightSpecs: object,
  weightData: ArrayBuffer,
}) {
  return await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      modelUrl: tf.io.fromMemory(modelArtifacts),
    }
  );
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
