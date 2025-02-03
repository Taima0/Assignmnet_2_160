// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  ' gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  //' gl_PointSize = u_Size;\n' +
  //'  gl_PointSize = 10.0;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

//Global Varibales
let canvas;
let gl;
let a_Position;
let u_FragColor;
//let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL(){
    // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

}

function connectVariablesToGLSL(){
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
/*
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
*/
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

  u_GlobalRotateMatrix= gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);


}

function convertCoord(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

const POINT=0;
const TRIANGLE=1;
const CIRCLE=2;
//UI Global Varibales
let g_selectionColor = [1.0,1.0,1.0,1.0];
let g_sizeSlider = 5;
let g_selectedType=POINT;
let g_segments=10;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_boxAngle=0;
let g_yellowAnimation=false;
let g_magAnimation=false;


function addActionsForHtmlUI(){
    document.getElementById('green').addEventListener('input', function() { g_selectionColor[1] = this.value/100;});
    document.getElementById('red').addEventListener('input', function() { g_selectionColor[0] = this.value/100;});
    document.getElementById('blue').addEventListener('input', function() { g_selectionColor[2] = this.value/100});
    document.getElementById('clearButton').onclick = function() { g_shapesList=[]; renderAllShapes();};

    document.getElementById('pointButton').onclick = function() { g_selectedType=POINT};
    document.getElementById('triangleButton').onclick = function() { g_selectedType=TRIANGLE};
    document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE};
    //Shape slider
    document.getElementById('sizeSlider').addEventListener('input', function() { g_sizeSlider = this.value});
    document.getElementById('circleSlider').addEventListener('input', function() { g_segments = this.value});
    document.getElementById('angleSlider').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
    document.getElementById('armSlider').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });
    document.getElementById('footSlider').addEventListener('mousemove', function() { g_boxAngle = this.value; renderAllShapes(); });
    document.getElementById('animationYellowOn').onclick = function() {g_yellowAnimation=true;};
    document.getElementById('animationYellowOff').onclick = function() {g_yellowAnimation=false;};
    document.getElementById('animationMagOn').onclick = function() {g_magAnimation=true;};
    document.getElementById('animationMagOff').onclick = function() {g_magAnimation=false;};
    

}


function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = click;
  //canvas.onmousemove = function(ev){if (ev.button == 1) {click(ev)}};// click;
  //canvas.onmousedown = function(ev) {if (ev.button = 1) {click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);

  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

var g_shapesList = []; 

function tick(){
  g_seconds=performance.now()/1000.0-g_startTime;
  console.log(g_seconds);

  updateAnimationAngle();

  renderAllShapes();

  requestAnimationFrame(tick);
}







//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

function updateAnimationAngle(){
  if (g_yellowAnimation){
    g_yellowAngle = (45*Math.sin(g_seconds));
  } 
  if (g_magAnimation) {
    g_boxAngle = (45*Math.sin(3*g_seconds));
  }
}

function renderAllShapes(){

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
  /*
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();

  }
    */

  //draw a test traingle
  //drawTriangle3D( [-1.0,0.0,0.0, -0.5,-1.0,0.0,  0.0,0.0,0.0] );


  //draw a cube
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-.25, -.75, 0.0);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5, .3, .5);
  body.render();

  //draw a cube
  var smallerbody = new Cube();
  smallerbody.color = [0.0, 0.0, 1.0, 1.0];
  smallerbody.matrix.translate(-.55, -.75, 0.0);
  smallerbody.matrix.rotate(-5,1,0,0);
  smallerbody.matrix.scale(0.3, .2, .3);
  smallerbody.render();

  var tail  = new Cube();
  tail.color = [0.0, 1.0, 0.0, 1.0];
  tail.matrix.translate(-.75, -.75, 0.0);
  tail.matrix.rotate(-5,1,0,0);
  tail.matrix.scale(0.2, .15, .2);
  tail.render();


  //left arm
  var leftArm = new Cube();
  leftArm.color = [1, 1, 0, 1];
  leftArm.matrix.setTranslate(0, -.5, 0.0);
  leftArm.matrix.rotate(-5, 1, 0, 0);

  leftArm.matrix.rotate(-g_yellowAngle, 0, 0,1);
  //leftArm.matrix.rotate(-g_yellowAngle,0, 0, 1);
  //leftArm.matrix.rotate(45*Math.sin(g_seconds),0, 0, 1);
  var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
  leftArm.matrix.scale(0.25, .7, .5);
  leftArm.matrix.translate(-.5,0,0);
  leftArm.render();

  //Test Box
  var box = new Cube();
  box.color = [1,0,1,1];
  box.matrix = yellowCoordinatesMat;
  box.matrix.translate(0,0.65,0);
  box.matrix.rotate(g_boxAngle,0,0,1);
  box.matrix.scale(.3,.3,.3);
  box.matrix.translate(-.5,0,-0.001);
  //box.matrix.rotate(0,1,0,0);
  //box.matrix.scale(.3,.3,.3);
  //box.matrix.scale(-.5,0,.0,0);
  box.render();

}

function click(ev) {
  [x,y] = convertCoord(ev);

  let point;
  if (g_selectedType==POINT){
    point = new Point();
  } else if (g_selectedType==TRIANGLE){
    point = new Triangle();
  } else {
    point = new Circle();
  }
  point.position = [x,y];
  point.color = g_selectionColor.slice();
  point.size = g_sizeSlider;
  g_shapesList.push(point);

  // Store the coordinates to g_points array
  //g_points.push([x, y]);

  //g_colors.push(g_selectionColor.slice());

  //g_sizes.push(g_sizeSlider);
  // Store the coordinates to g_points array
  //if (x >= 0.0 && y >= 0.0) {      // First quadrant
 //   g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
 // } else if (x < 0.0 && y < 0.0) { // Third quadrant
 //   g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
 // } else {                         // Others
 //   g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
 // }

  renderAllShapes();
}