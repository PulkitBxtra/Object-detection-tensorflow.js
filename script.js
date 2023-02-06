const video = document.getElementById('webcam');  //stream
const liveView = document.getElementById('liveView'); //container
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

//************************ check get user media *****************************


// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
  
  // If webcam supported, add event listener to button.
  if (getUserMediaSupported()) {
      enableWebcamButton.addEventListener('click', enableCam);
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
  
  
  
// ************************ Enable webcam ****************************


function enableCam(event) {
    if (!model) {
      return;
    }
    
    // Hide the button once clicked.
    event.target.classList.add('removed');  
    
    // getUsermedia parameters to force video but not audio.
    const constraints = {
      video: true
    };
  
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      video.srcObject = stream;
      video.addEventListener('loadeddata', predictWebcam);
    });
  }

  
//************************************ Model related shit ********************************************* */



var model = true;

cocoSsd.load().then(function(loadedModel) {
    model=loadedModel;

    demosSection.classList.remove('invisible');
})


//to store the html elements that we will be drawing on the screen
var children =[];



function predictWebcam() {

    model.detect(video).then(function(predictions){

        console.log(predictions);

        for (let i = 0; i < children.length; i++) {
            liveView.removeChild(children[i]);
          }
          children.splice(0);

          for (let n = 0; n < predictions.length; n++) {
            // If we are over 66% sure we are sure we classified it right, draw it!
            if (predictions[n].score > 0.66) {
              const p = document.createElement('p');
              p.innerText = predictions[n].class  + ' - with ' 
                  + Math.round(parseFloat(predictions[n].score) * 100) 
                  + '% confidence.';
              p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
                  + (predictions[n].bbox[1] - 10) + 'px; width: ' 
                  + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';
      
              const highlighter = document.createElement('div');
              highlighter.setAttribute('class', 'highlighter');
              highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
                  + predictions[n].bbox[1] + 'px; width: ' 
                  + predictions[n].bbox[2] + 'px; height: '
                  + predictions[n].bbox[3] + 'px;';
      
              liveView.appendChild(highlighter);
              liveView.appendChild(p);
              children.push(highlighter);
              children.push(p);
            }
          }

          window.requestAnimationFrame(predictWebcam);
    })
}


