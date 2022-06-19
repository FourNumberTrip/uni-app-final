const fs = wx.getFileSystemManager();

// wrap fs.readFile into promise
export function readFile(
  filePath: string,
  encoding: "utf-8" | "utf8" | undefined
): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    fs.readFile({
      filePath,
      encoding,
      success: (res) => {
        resolve(res.data);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

export function writeFile(
  filePath: string,
  data: string | ArrayBuffer,
  encoding: "utf-8" | "utf8" | undefined
) {
  return new Promise((resolve, reject) => {
    fs.writeFile({
      filePath,
      data,
      encoding,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

export function removeFile(filePath: string) {
  return new Promise((resolve, reject) => {
    fs.unlink({
      filePath,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}
