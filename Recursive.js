/**
 * Created by NamNguyen on 2/17/17.
 */
let topPoint = vec3.fromValues(1,1,1);
let basePoint1 = vec3.fromValues(-1, -1, 1);
let basePoint2 = vec3.fromValues(-1, 1, -1);
let basePoint3 = vec3.fromValues(1, -1, -1);

vec3.normalize(topPoint, topPoint);
vec3.normalize(basePoint1, basePoint1);
vec3.normalize(basePoint2, basePoint2);
vec3.normalize(basePoint3, basePoint3);

vec3.scale(topPoint, topPoint, 0.8);
vec3.scale(basePoint1, basePoint1, 0.8);
vec3.scale(basePoint2, basePoint2, 0.8);
vec3.scale(basePoint3, basePoint3, 0.8);

let topX = topPoint[0];
let topY = topPoint[1];
let topZ = topPoint[2];

let base1X = basePoint1[0];
let base1Y = basePoint1[1];
let base1Z = basePoint1[2];

let base2X = basePoint2[0];
let base2Y = basePoint2[1];
let base2Z = basePoint2[2];

let base3X = basePoint3[0];
let base3Y = basePoint3[1];
let base3Z = basePoint3[2];