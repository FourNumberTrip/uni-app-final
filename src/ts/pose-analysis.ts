import { Keypoint } from "@tensorflow-models/pose-detection";

const JOINTS_TO_ACTION: { [key: string]: string[] } = {
  neck: ["101", "102", "103", "119"],
  rightShoulder: ["104", "105", "106", "120", "122"],
  leftShoulder: ["104", "105", "106", "120", "122"],
  rightElbow: ["125"],
  leftElbow: ["125"],
  waist: ["118", "121"],
  leftHip: ["107", "108", "109", "110"],
  rightHip: ["107", "108", "109", "110"],
  leftKnee: ["111", "112", "113", "114", "115", "116", "117"],
  rightKnee: ["111", "112", "113", "114", "115", "116", "117"],
};

// joints[0] -> joints[1] is the first vector
// joints[2] -> joints[3] is the second vecotr
// we calculate the angle between these two vectors
const ANGLE_RULES = [
  {
    // left eye, right eye, left shoulder, right shoulder
    joints: [1, 2, 5, 6],
    weight: 1,
    name: "neck",
  },
  {
    // left shoulder, right shoulder, right shoulder, right elbow
    joints: [5, 6, 6, 8],
    weight: 1,
    name: "rightShoulder",
  },
  // left shoulder
  {
    // right shoulder, left shoulder, left shoulder, left elbow
    joints: [6, 5, 5, 7],
    weight: 1,
    name: "leftShoulder",
  },
  // right elbow
  {
    // right shoulder, right elbow, right elbow, right wrist
    joints: [6, 8, 8, 10],
    weight: 0.8,
    name: "rightElbow",
  },
  // left elbow
  {
    // left shoulder, left elbow, left elbow, left wrist
    joints: [5, 7, 7, 9],
    weight: 0.8,
    name: "leftElbow",
  },
  // waist
  {
    // left shoulder, right shoulder, left hip, right hip
    joints: [5, 6, 11, 12],
    weight: 2,
    name: "waist",
  },
  // left hip
  {
    // left shoulder, left hip, left hip, left knee
    joints: [5, 11, 11, 13],
    weight: 1,
    name: "leftHip",
  },
  // right hip
  {
    // right shoulder, right hip, right hip, right knee
    joints: [6, 12, 12, 14],
    weight: 1,
    name: "rightHip",
  },
  // left knee
  {
    // left hip, left knee, left knee, left ankle
    joints: [11, 13, 13, 15],
    weight: 1,
    name: "leftKnee",
  },
  // right knee
  {
    // right hip, right knee, right knee, right ankle
    joints: [12, 14, 14, 16],
    weight: 1,
    name: "rightKnee",
  },
];

// convert vectors to angles
function getAngle(joints: number[], keypoints: Keypoint[]) {
  const jointKeypoints = joints.map((joint) => {
    return keypoints[joint];
  });
  const v1 = [
    jointKeypoints[1].x - jointKeypoints[0].x,
    jointKeypoints[1].y - jointKeypoints[0].y,
  ];
  const v2 = [
    jointKeypoints[3].x - jointKeypoints[2].x,
    jointKeypoints[3].y - jointKeypoints[2].y,
  ];
  return Math.acos(
    (v1[0] * v2[0] + v1[1] * v2[1]) /
      (Math.sqrt(v1[0] ** 2 + v1[1] ** 2) * Math.sqrt(v2[0] ** 2 + v2[1] ** 2))
  );
}

export function analyzeKeypointsList(keypointsList: Keypoint[][]) {
  // jointAngle = jointAngleList[joint][angle]
  const jointAngleList = ANGLE_RULES.map((rule) =>
    keypointsList.map((keypoints) => getAngle(rule.joints, keypoints))
  );

  // ! movement analysis

  const means = jointAngleList.map(
    (angles) => angles.reduce((acc, angle) => acc + angle, 0) / angles.length
  );

  const std = jointAngleList
    .map(
      (angles) =>
        angles.reduce((acc, angle) => acc + (angle - means[0]) ** 2, 0) /
        angles.length
    )
    .map((std) => Math.sqrt(std));

  const adjustedStd = std.map((std, index) => std * ANGLE_RULES[index].weight);

  // ! strain analysis
  // TODO

  const report = adjustedStd
    .map((std, index) => {
      return {
        name: ANGLE_RULES[index].name,
        std: std,
      };
    })
    .sort((a, b) => b.std - a.std);

  const usedId: { [key: string]: boolean } = {};

  return report
    .filter((_, index) => index < 4)
    .map((item) => {
      const id =
        JOINTS_TO_ACTION[item.name][
          Math.floor(Math.random() * JOINTS_TO_ACTION[item.name].length)
        ];
      if (!usedId[id]) {
        usedId[id] = true;
        return {
          id,
          loopTimes: 8,
        };
      }
      return null;
    })
    .filter((item) => item !== null);
}
