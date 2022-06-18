const fs = wx.getFileSystemManager();

// wrap fs.readFile into promise
export function readFile(
  filePath: string,
  encoding:
    | "ascii"
    | "base64"
    | "binary"
    | "hex"
    | "ucs2"
    | "ucs-2"
    | "utf16le"
    | "utf-16le"
    | "utf-8"
    | "utf8"
    | "latin1"
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
  encoding:
    | "ascii"
    | "base64"
    | "binary"
    | "hex"
    | "ucs2"
    | "ucs-2"
    | "utf16le"
    | "utf-16le"
    | "utf-8"
    | "utf8"
    | "latin1"
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
