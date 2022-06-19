export function requestFile(url: string, responseType: string): Promise<string | {} | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: url,
      responseType,
      success: (res) => {
        resolve(res.data);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}
