function draw() {
  update(); // Update Function always runs first.

  image(video, 0, 0, width, height);

  drawCluster();
  drawKeypoints();
  drawSkeleton();
}

var center;

function clockwise_sort(a, b) {
    if (a.x - center.x >= 0 && b.x - center.x < 0)
        return true;
    if (a.x - center.x < 0 && b.x - center.x >= 0)
        return false;
    if (a.x - center.x == 0 && b.x - center.x == 0) {
        if (a.y - center.y >= 0 || b.y - center.y >= 0)
            return a.y > b.y;
        return b.y > a.y;
    }

    // compute the cross product of vectors (center -> a) x (center -> b)
    let det = (a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y);
    if (det < 0)
        return true;
    if (det > 0)
        return false;

    // points a and b are on the same line from the center
    // check which point is closer to the center
    let d1 = (a.x - center.x) * (a.x - center.x) + (a.y - center.y) * (a.y - center.y);
    let d2 = (b.x - center.x) * (b.x - center.x) + (b.y - center.y) * (b.y - center.y);
    return d1 > d2;
}

function drawCluster() {
  for (let i = 0; i < point_cluster.length; i++) {
    if (point_cluster[i]) {

      var p = point_cluster[i].length;
      while (p--) {
        point_cluster[i][p]["decay"] = point_cluster[i][p]["decay"] - 0.05;
        if (point_cluster[i][p]["decay"] <= 0) {
          point_cluster[i].splice(p, 1);
        }
      }

      let poly_points = hull(point_cluster[i], 20, [".x", ".y"]);
      //global ;(
      center = {"x": width/2, "y": height/2}

      if (poly_points[0]) {
        let region = new Region(poly_points);
        center = region.centroid();

        // Sort Points Here

        poly_points.sort(clockwise_sort);

        fill(255,90);
        stroke(255, 255 * (i / poses.length), 255 * ((poses.length - i) / poses.length));
        strokeWeight(1);

        beginShape()
        vertex(poly_points[0].x, poly_points[0].y);
        for(var p = 1; p < poly_points.length; p++) {
          let interx = lerp(center.x, poly_points[p].x, 1.2);
          let intery = lerp(center.y, poly_points[p].y, 1.2);
          //quadraticVertex(interx, intery, poly_points[p].x, poly_points[p].y);
          vertex(poly_points[p].x, poly_points[p].y);
        }
        endShape(CLOSE)

        fill(0,0,0);
        strokeWeight(2);
        ellipse(center.x, center.y, 20, 20);

        for(var p = 0; p < poly_points.length; p++) {
          ellipse(poly_points[p].x, poly_points[p].y, 4, 4);
        }

      }
    }
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(0, 255 * (i / poses.length), 255 * ((poses.length - i) / poses.length));
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(0, 255 * (i / poses.length), 255 * ((poses.length - i) / poses.length));
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}
