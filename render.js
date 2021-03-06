/**
 * Created by Hans Dulimarta.
 * Modified by Joshua Crum and Nam Nguyen.
 */
let modelMat = mat4.create();
let canvas, paramGroup;
var currSelection = 0;
var currRotationAxis = "rotx";
let posAttr, colAttr, modelUnif;
let gl;
let obj;

function main() {
  canvas = document.getElementById("gl-canvas");

  /* setup event listener for drop-down menu */
  let menu = document.getElementById("menu");
  menu.addEventListener("change", menuSelected);

  /* setup click listener for th "insert" button */
  let button = document.getElementById("insert");
  button.addEventListener("click", createObject);

  /* setup click listener for the radio buttons (axis of rotation) */
  let radioGroup = document.getElementsByName("rotateGroup");
  for (let r of radioGroup) {
    r.addEventListener('click', rbClicked);
  }

  paramGroup = document.getElementsByClassName("param-group");
  paramGroup[0].hidden = false;

  /* setup window resize listener */
  window.addEventListener('resize', resizeWindow);

  gl = WebGLUtils.create3DContext(canvas, null);
  ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
  .then (prog => {

    /* put all one-time initialization logic here */
    gl.useProgram (prog);
    gl.clearColor (0, 0, 0, 1);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.cullFace(gl.BACK);

    /* the vertex shader defines TWO attribute vars and ONE uniform var */
    posAttr = gl.getAttribLocation (prog, "vertexPos");
    colAttr = gl.getAttribLocation (prog, "vertexCol");
    modelUnif = gl.getUniformLocation (prog, "modelCF");
    gl.enableVertexAttribArray (posAttr);
    gl.enableVertexAttribArray (colAttr);

    /* calculate viewport */
    resizeWindow();

    /* initiate the render loop */
    render();
  });
}

function drawScene() {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  /* in the following three cases we rotate the coordinate frame by 1 degree */
  switch (currRotationAxis) {
    case "rotx":
      mat4.rotateX(modelMat, modelMat, Math.PI / 180);
      break;
    case "roty":
      mat4.rotateY(modelMat, modelMat, Math.PI / 180);
      break;
    case "rotz":
      mat4.rotateZ(modelMat, modelMat, Math.PI / 180);
  }

  if (obj) {
    obj.draw(posAttr, colAttr, modelUnif, modelMat);
  }
}

function render() {
  drawScene();
  requestAnimationFrame(render);
}

function createObject() {
  obj = null;
  mat4.identity(modelMat);
  switch (currSelection) {
    case 0:
      let height = document.getElementById("cone-height").valueAsNumber;
      let radius = document.getElementById("cone-radius").valueAsNumber;
      let subDiv = document.getElementById("cone-subdiv").valueAsNumber;
      let verDiv = document.getElementById("cone-vertical-stacks").valueAsNumber;
      console.log ("Cone radius: " + radius + " height: " + height + " sub division: " + subDiv);
      obj = new Cone(gl, radius, height, subDiv, verDiv);
      break;
    case 1:
        let cylinderHeight = document.getElementById("cylinder-height").valueAsNumber;
        let cylinderBottomRadius = document.getElementById("cylinder-bottom-radius").valueAsNumber;
        let cylinderTopRadius = document.getElementById("cylinder-top-radius").valueAsNumber;
        let cylinderSubDiv = document.getElementById("cylinder-subdiv").valueAsNumber;
        let cylinderVerDiv = document.getElementById("cylinder-vertical-stacks").valueAsNumber;
        console.log ("Cylinder Top Radius: " + cylinderTopRadius + "Cylinder Bottom Radius: " + cylinderBottomRadius + " height: " + cylinderHeight + " sub division: " + cylinderSubDiv);
        obj = new Cylinder(gl, cylinderBottomRadius, cylinderTopRadius, cylinderHeight, cylinderSubDiv, cylinderVerDiv);
        break;

      case 2:
        //cube
          let cubeSize = document.getElementById("cube-height").valueAsNumber;
          let cubeSubDiv = document.getElementById("cube-subdiv").valueAsNumber;
          //console.log();
          obj = new Cube(gl, cubeSize, cubeSubDiv);
          break;

      case 3:
        let gSubDiv = document.getElementById("globe-subdiv").valueAsNumber;
        let gRadius = document.getElementById("globe-radius").valueAsNumber;
        let gVerDiv = document.getElementById("globe-vertical-stacks").valueAsNumber;
        console.log ("Hemishpere radius: " + gRadius + " sub division: " + gSubDiv);
        obj = new Globe(gl, gRadius, gSubDiv, gVerDiv);
      break;

      case 4:
        let rRadius = document.getElementById("recursive-radius").valueAsNumber;
        let rSubDiv = document.getElementById("recursive-subdiv").valueAsNumber;
        obj = new Recursive(gl, rRadius, rSubDiv);
        break;

      case 5:
          let torusSubDiv = document.getElementById("torus-subdiv").valueAsNumber;
          let torusBigRadius = document.getElementById("torus-big-radius").valueAsNumber;
          let torusSmallRadius = document.getElementById("torus-small-radius").valueAsNumber;
          let torusVerDiv = document.getElementById("torus-vertical-stacks").valueAsNumber;
          //console.log ("Hemishpere radius: " + gRadius + " sub division: " + gSubDiv);
          obj = new Torus(gl, torusBigRadius, torusSmallRadius, torusSubDiv, torusVerDiv);
        break;

      case 6:
        let ringHeight = document.getElementById("ring-height").valueAsNumber;
        let ringOuterRadius = document.getElementById("ring-outer-radius").valueAsNumber;
        let ringInnerRadius = document.getElementById("ring-inner-radius").valueAsNumber;
        let ringSubDiv = document.getElementById("ring-subdiv").valueAsNumber;
        let ringVerDiv = document.getElementById("ring-vertical-stacks").valueAsNumber;
        //console.log();
        obj = new Ring(gl, ringOuterRadius, ringInnerRadius, ringHeight, ringSubDiv, ringVerDiv);
        break;
  }
}

function resizeWindow() {
  let w = 0.98 * window.innerWidth;
  let h = 0.6 * window.innerHeight;
  let size = Math.min(0.98 * window.innerWidth, 0.65 * window.innerHeight);
  /* keep a square viewport */
  canvas.width = size;
  canvas.height = size;
  gl.viewport(0, 0, size, size);
}

function menuSelected(ev) {
  let sel = ev.currentTarget.selectedIndex;
  paramGroup[currSelection].hidden = true;
  paramGroup[sel].hidden = false;
  currSelection = sel;
  console.log("New selection is ", currSelection);
}

function rbClicked(ev) {
  currRotationAxis = ev.currentTarget.value;
  console.log(ev);
}