let video;
let poseNet;
let poses = [];
let point_cluster = [];
let big;

function setup() {
  createCanvas(640, 400);
  video = createCapture(VIDEO);
  video.size(width, height);

  big = {
		top: [height],
		right: [0],
		bottom: [0],
		left: [width]
	}

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  select('#status').html('Model Loaded');
}
