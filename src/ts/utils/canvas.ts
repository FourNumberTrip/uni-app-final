import { Keypoint } from "@tensorflow-models/pose-detection";

const LINES = [
  // nose - left eye
  [0, 1],
  // nose - right eye
  [0, 2],
  // left eye - left ear
  [1, 3],
  // right eye - right ear
  [2, 4],
  // left shoulder - right shoulder
  [5, 6],
  // left shoulder - left elbow
  [5, 7],
  // left elbow - left wrist
  [7, 9],
  // right shoulder - right elbow
  [6, 8],
  // right elbow - right wrist
  [8, 10],
  // left shoulder - left hip
  [5, 11],
  // right shoulder - right hip
  [6, 12],
  // left hip - right hip
  [11, 12],
  // left hip - left knee
  [11, 13],
  // left knee - left ankle
  [13, 15],
  // right hip - right knee
  [12, 14],
  // right knee - right ankle
  [14, 16],
];

export function drawProgress(
  canvas: WechatMiniprogram.Canvas,
  progress: number,
  pixelRatio: number
) {
  const ctx = canvas.getContext("2d");
  const posX = canvas.width / 2;
  const posY = canvas.height / 2;
  const degrees = Math.max(1, progress * 360);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // background
  ctx.beginPath();
  ctx.arc(
    posX,
    posY,
    60 * pixelRatio,
    (Math.PI / 180) * 270,
    (Math.PI / 180) * (270 + 360)
  );
  ctx.strokeStyle = "#e1e1e1";
  ctx.lineWidth = 15 * pixelRatio;
  ctx.lineCap = "round";
  ctx.stroke();

  // progress
  ctx.beginPath();
  ctx.arc(
    posX,
    posY,
    60 * pixelRatio,
    (Math.PI / 180) * 270,
    (Math.PI / 180) * (270 + degrees)
  );
  ctx.strokeStyle = "#b5deb3";
  ctx.lineWidth = 15 * pixelRatio;
  ctx.lineCap = "round";
  ctx.stroke();
}

export async function drawPose(
  canvas: WechatMiniprogram.Canvas,
  frameData: WechatMiniprogram.FrameDataOptions,
  keypoints: Keypoint[]
) {
  const canvasCtx: WechatMiniprogram.CanvasContext = canvas.getContext("2d");

  // draw image and pose on canvas
  await new Promise((resolve) => canvas.requestAnimationFrame(resolve));
  canvas.height = frameData.height;
  canvas.width = frameData.width;
  const imageData = canvas.createImageData(
    // @ts-ignore
    frameData.data,
    frameData.width,
    frameData.height
  );
  // @ts-ignore
  canvasCtx.putImageData(imageData, 0, 0);

  for (let keypoint of keypoints) {
    const x = keypoint.x;
    const y = keypoint.y;
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
    canvasCtx.fillStyle = "red";
    canvasCtx.fill();
  }

  // draw the lines between keypoints using LINES variable
  for (let line of LINES) {
    const keypoint1 = keypoints[line[0]];
    const keypoint2 = keypoints[line[1]];
    const x1 = keypoint1.x;
    const y1 = keypoint1.y;
    const x2 = keypoint2.x;
    const y2 = keypoint2.y;
    canvasCtx.beginPath();
    canvasCtx.moveTo(x1, y1);
    canvasCtx.lineTo(x2, y2);
    canvasCtx.strokeStyle = "cyan";
    canvasCtx.stroke();
  }
}
