export class VideoDecoder {
  private fileUrl: string;
  private videoDecoder: WechatMiniprogram.VideoDecoder;
  private ended: boolean;

  constructor(fileUrl: string) {
    this.fileUrl = fileUrl;
    this.videoDecoder = wx.createVideoDecoder();
    this.ended = false;
  }

  private async onDecodingStart() {
    await new Promise<void>((resolve, _) => {
      this.videoDecoder.on("start", async () => {
        resolve();
      });
    });
  }

  async *getFrames() {
    this.videoDecoder.start({
      source: this.fileUrl,
      abortAudio: true,
    });

    // we wait for the decoding to start
    await this.onDecodingStart();

    let frameData;
    let firstFrame = true;
    while (true) {
      frameData = this.videoDecoder.getFrameData();
      if (frameData) {
        if (firstFrame) {
          firstFrame = false;
        }
        yield frameData;
      } else if (!firstFrame) {
        return;
      }
    }
  }
}
