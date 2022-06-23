const db = wx.cloud.database();

export async function addUserActivities(activity: {
  coverUrl: string;
  title: string;
  animations: { id: string; loopTimes: string }[];
  _id: string;
}) {
  // upload image to cloud
  const fileID = (
    await wx.cloud.uploadFile({
      cloudPath: `${Date.now()}.jpg`,
      filePath: activity.coverUrl,
    })
  ).fileID;

  const _id = (
    await db.collection("user_activities").add({
      data: {
        coverFileID: fileID,
        title: activity.title,
        animations: activity.animations,
      },
    })
  )._id;

  const coverUrl = (
    await wx.cloud.getTempFileURL({
      fileList: [fileID],
    })
  ).fileList[0].tempFileURL;

  return {
    coverUrl,
    title: activity.title,
    animations: activity.animations,
    _id,
  };
}

export async function getUserActivities() {
  const queryResult = await db.collection("user_activities").get();
  return await Promise.all(
    queryResult.data.map(async (activity) => {
      return {
        coverUrl: (
          await wx.cloud.getTempFileURL({
            fileList: [activity.coverFileID],
          })
        ).fileList[0].tempFileURL,
        title: activity.title,
        animations: activity.animations,
        _id: activity._id,
      };
    })
  );
}

export async function removeUserActivity(_id: string) {
  await db.collection("user_activities").doc(_id).remove();
}

export async function updateUserActivity(activity: {
  _id: string;
  coverUrl: string;
  title: string;
  animations: { id: string; loopTimes: string }[];
}) {
  await db
    .collection("user_activities")
    .doc(activity._id)
    .update({
      data: {
        title: activity.title,
      },
    });
}
