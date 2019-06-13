let point_cluster_check = [];

function update() {
  getKeypoints();
}

/** Class for "Region" allows to get the center of the distribution **/

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Region(points) {
  this.points = points || [];
  this.length = points.length;
}

Region.prototype.area = function () {
  var area = 0,
    i,
    j,
    point1,
    point2;

  for (i = 0, j = this.length - 1; i < this.length; j=i,i++) {
    point1 = this.points[i];
    point2 = this.points[j];
    area += point1.x * point2.y;
    area -= point1.y * point2.x;
  }
  area /= 2;

  return area;
};

Region.prototype.centroid = function () {
  var x = 0,
    y = 0,
    i,
    j,
    f,
    point1,
    point2;

  for (i = 0, j = this.length - 1; i < this.length; j=i,i++) {
    point1 = this.points[i];
    point2 = this.points[j];
    f = point1.x * point2.y - point2.x * point1.y;
    x += (point1.x + point2.x) * f;
    y += (point1.y + point2.y) * f;
  }

  f = this.area() * 6;

  return new Point(x / f, y / f);
};

function getKeypoints() {

  for (let i = 0; i < poses.length; i += 2) {

    if (!point_cluster[i]) {
      point_cluster[i] = [];
      point_cluster_check[i] = [];
    }

    let t_bod = [poses[i], poses[i + 1]];

    if (t_bod[i] && t_bod[i + 1]) {

      let keypoints = [[],[]];

      for (let t = 0; t < 2; t++) {
        for (let j = 0; j < t_bod[t].pose.keypoints.length; j++) {
          let keypoint = t_bod[t].pose.keypoints[j];
          if (keypoint.score > 0.6) {
            keypoints[t].push(keypoint);
          }
        }
      }

      const l0 = t_bod[0].pose.keypoints.length;
      const l1 = t_bod[1].pose.keypoints.length;

      let length = l0 > l1 ? l1 : l0;
      let longest = 0;
      let shortest = width;

      let hull_points = [];

      for (let j = 0; j < length; j++) {
        for (let k = 0; k < length; k++) {

          if (keypoints[0][j] && keypoints[1][k]) {
            const p1 = keypoints[0][j].position;
            const p2 = keypoints[1][k].position;

            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

            if (dist > longest) {
              longest = dist;
            }

            if (dist < shortest) {
              shortest = dist;
            }

            //if (dist < (longest - shortest) * 0.8) {
              if (hull_points.indexOf(p1) === -1) {
                hull_points.push(p1);
              }
              if (hull_points.indexOf(p2) === -1) {
                hull_points.push(p2);
              }
            //}
          }
        }
      }

      for (var n = 0; n < hull_points.length; n++) {
        // Using Check here to speed up detection.
        if (point_cluster_check[i].indexOf(hull_points[n]) === -1) {
          point_cluster_check[i].push(hull_points[n]);
          hull_points[n]["decay"] = 1.0;
          point_cluster[i].push(hull_points[n]);
        }
      }

    }
  }
}
