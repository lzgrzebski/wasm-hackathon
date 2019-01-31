const WIDTH = 640;
const HEIGHT = 360;

const videoElem = document.getElementById('video');
const processedElem = document.getElementById('processed-video');
const processedElemContext = processedElem.getContext('2d');
const processingCanvas = new OffscreenCanvas(WIDTH, HEIGHT);
const processingCanvasContext = processingCanvas.getContext('2d');
let faceCascade;

let videoMem;

let glassesData;
const glasses = new Image();
glasses.src = 'glasses.png';
glasses.onload = () => {
    glassesData = glasses
};

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
    if(!Module || !cv.CascadeClassifier) {
        requestAnimationFrame(processVideo);
        return;
    }

    processingCanvasContext.drawImage(videoElem, 0, 0, WIDTH, HEIGHT);
    let imageData = processingCanvasContext.getImageData(0, 0, WIDTH, HEIGHT);

    const srcMat = new cv.Mat(HEIGHT, WIDTH, cv.CV_8UC4);
    const grayMat = new cv.Mat(HEIGHT, WIDTH, cv.CV_8UC1);

    if(!faceCascade) {
        faceCascade = new cv.CascadeClassifier();
        let load = faceCascade.load('./haarcascade_frontalface_alt.xml');
        console.log('load face detection training data', load);
    }
    
    srcMat.data.set(imageData.data);
    cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);
    let faces = [];

    let faceVect = new cv.RectVector();
    let faceMat = new cv.Mat();
    
    cv.pyrDown(grayMat, faceMat);
    cv.pyrDown(faceMat, faceMat);
    
    faceCascade.detectMultiScale(faceMat, faceVect);
    for (let i = 0; i < faceVect.size(); i++) {
        let face = faceVect.get(i);
        // console.log(face.x, face.y);
        faces.push(new cv.Rect(face.x, face.y, face.width, face.height));
    }
    let size = faceMat.size();
    faceMat.delete();
    faceVect.delete();
    
    faces.forEach(f => {
        let xRatio = WIDTH/size.width;
        let yRatio = HEIGHT/size.height;
        processingCanvasContext.lineWidth = 3;
        processingCanvasContext.strokeStyle = 'yellow';
        // console.log(f.x*xRatio, f.y*yRatio, f.width*xRatio, f.height*yRatio);
        if(glassesData) {
            processingCanvasContext.drawImage(glassesData, f.x*xRatio, f.y*yRatio + 20);
        }
        processingCanvasContext.strokeRect(f.x*xRatio, f.y*yRatio, f.width*xRatio, f.height*yRatio);
    });

    processedElemContext.putImageData(processingCanvasContext.getImageData(0, 0, WIDTH, HEIGHT), 0, 0);

    // if (!videoMem) {
    //     videoMem = cv._malloc(imageData.data.length);
    // }

    // HEAPU8.set(imageData.data, videoMem);
    // cv._process_video(videoMem, WIDTH, HEIGHT);

    // imageData.data.set(HEAPU8.subarray(videoMem, videoMem + imageData.data.length));

    // processedElemContext.putImageData(imageData, 0, 0);

    requestAnimationFrame(processVideo);
};

getUserMedia();
