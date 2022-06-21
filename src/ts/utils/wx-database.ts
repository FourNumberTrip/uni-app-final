const db = wx.cloud.database();

export async function addUserActivities(activity: {
  coverUrl: string;
  title: string;
  animations: { id: string; loopTimes: string }[];
}) {
  // upload image to cloud
  const fileID = (
    await wx.cloud.uploadFile({
      cloudPath: `${Date.now()}.jpg`,
      filePath: activity.coverUrl,
    })
  ).fileID;

  await db.collection("user_activities").add({
    data: {
      coverFileID: fileID,
      title: activity.title,
      animations: activity.animations,
    },
  });

  const coverUrl = (
    await wx.cloud.getTempFileURL({
      fileList: [fileID],
    })
  ).fileList[0].tempFileURL;

  return {
    coverUrl,
    title: activity.title,
    animations: activity.animations,
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
      };
    })
  );
}
