const video = document.getElementById("video");
let predictedAges = [];
let contenedorEdades = [];

  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models")
  ]).then(startVideo);

    function startVideo() {
      navigator.getUserMedia(
        { video: {} },
        stream => (video.srcObject = stream),
        err => console.error(err)
      );
    }
    function resumeVideo(){
        location.reload();
    }
    function stopVideo(){
      var stream = video.srcObject;
            var tracks = stream.getTracks();

            for (var i = 0; i < tracks.length; i++) {
                var track = tracks[i];
                track.stop();
            }
            video.srcObject = null;
    }
  video.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  canvas.style.border = 'white';
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

      for(i=0; i<resizedDetections.length; i++){
     
        const age = resizedDetections[i].age;
        const interpolatedAge = interpolateAgePredictions(age);
        const frame = {
          x: resizedDetections[i].detection.box.frame.x,
          y: resizedDetections[i].detection.box.frame.y,
        };
    
    if(age !== 0){
      contenedorEdades.push(age);
      let sum = contenedorEdades.reduce((previous, current) => current += previous);
      let avg = sum / contenedorEdades.length;
      var objetivo = document.getElementById('ageHome');
      objetivo.innerHTML = avg;
      console.log(contenedorEdades);
    }
    new faceapi.draw.DrawTextField(
      [`${faceapi.utils.round(interpolatedAge, 0)} years`],
      frame
    ).draw(canvas);
    }}, 100);
      }
    );

    // PROMEDIO
    
    function interpolateAgePredictions(age) {
      predictedAges = [age].concat(predictedAges).slice(0, 10);
      const avgPredictedAge =
        predictedAges.reduce((total, a) => total + a) / predictedAges.length;
        // console.log(avgPredictedAge);
      return avgPredictedAge;
    }

