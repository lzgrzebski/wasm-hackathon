const WIDTH = 640;
const HEIGHT = 360;

const videoElem = document.getElementById('video');
const processedElem = document.getElementById('processed-video');
const processedElemContext = processedElem.getContext('2d');
const processingCanvas = new OffscreenCanvas(WIDTH, HEIGHT);
const processingCanvasContext = processingCanvas.getContext('2d');

let videoMem;

const getUserMedia = async () => {
    const constraints = {
        audio: false,
        video: {
            width: WIDTH,
            height: HEIGHT
        }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElem.srcObject = stream;
    videoElem.setAttribute('width', WIDTH);
    videoElem.setAttribute('height', HEIGHT);
    processVideo();
};

const processVideo = () => {
    if(!Module || !Module._process_video) {
        return;
    }

    processingCanvasContext.drawImage(videoElem, 0, 0, WIDTH, HEIGHT);
    let imageData = processingCanvasContext.getImageData(0, 0, WIDTH, HEIGHT);

    if (!videoMem) {
        videoMem = Module._malloc(imageData.data.length);
    }

    HEAPU8.set(imageData.data, videoMem);
    Module._process_video(videoMem, WIDTH, HEIGHT);

    imageData.data.set(HEAPU8.subarray(videoMem, videoMem + imageData.data.length));

    processedElemContext.putImageData(imageData, 0, 0);

    requestAnimationFrame(processVideo);
};

getUserMedia();
