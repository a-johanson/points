
const { jsPDF } = window.jspdf;

glMatrix.setMatrixArrayType(Array);

const canvasDim = [600, 800];

let sliderNoiseC;
let sliderNoiseScale;
let sliderNoiseMag;

let alpha = 30.0;
let beta  = 135.0;

let noiseC     = 5.48;
let noiseScale = 3.83;
let noiseMag   = 0.13;

 const fg = vec3.fromValues(26, 24, 21);
// const bg = vec3.fromValues(241, 235, 223);
const bg = vec3.fromValues(250, 247, 242);
// const bg = vec3.fromValues(238,226,211);
const fgColors = [
    fg, fg, fg, fg,
    vec3.fromValues(255,119,119),
    vec3.fromValues(162,65,107),
    vec3.fromValues(133,39,71),
    vec3.fromValues(201,193,159),
    vec3.fromValues(137,147,124),
    vec3.fromValues(148,185,175),
    vec3.fromValues(84,150,166),
    vec3.fromValues(250,209,5)
];

let pSphere = [];

function pointsAndNormalsOnSphere(pointCount) {
    let p = [];
    for (let i = 0; i < pointCount; i++) {
        const s = 0.01 * pointCount;
        const f = (i + s) / (pointCount + s);
        const l = rand(0.0, Math.pow(f, 1.75));
        p.push(pointAndNormalOnSphere(1.0 - 2.0 * Math.pow(l, 1.0)));
    }
    return p;
}

function rand(a, b) {
    return (b - a) * Math.random() + a;
}

function pointOnSphere(y, phi) {
    const r = Math.sqrt(1.0 - y*y);
    const x = r * Math.cos(phi);
    const z = r * Math.sin(phi);
    const m = noiseMag * (2.0 * noise(noiseScale * (x + noiseC), noiseScale * (y + noiseC), noiseScale * (z + noiseC)) - 1.0) + 1.0;
    // const m = 0.2 * Math.cos(noiseScale * (x + noiseC)) * Math.cos(noiseScale * (y + noiseC)) * Math.cos(noiseScale * (z + noiseC)) + 0.9;
    // const m = 1.0;
    return vec3.fromValues(m * x, m * y, m * z);
}

function sgn(x) {
    return x < 0.0 ? -1.0 : 1.0;
}

function pointAndNormalOnSphere(y, phi) {
    y = y || rand(-1.0, 1.0);
    phi = phi || rand(0.0, 2.0 * Math.PI);
    const p0 = pointOnSphere(y, phi);
    const eps = 0.001;
    let p1 = pointOnSphere(y - sgn(y) * eps, phi);
    let p2 = pointOnSphere(y, phi + eps);
    vec3.subtract(p1, p1, p0);
    vec3.subtract(p2, p2, p0);
    vec3.cross(p1, p1, p2);
    vec3.normalize(p1, p1);
    if(vec3.dot(p0, p1) < 0.0) {
        vec3.scale(p1, p1, -1.0);
    }
    return [p0, p1];
}

function screenProjection(pointsAndNormals, aspectRatio) {
    let projection = mat4.create();
    mat4.perspective(projection, glMatrix.toRadian(30.0), aspectRatio, 0.1);

    const eye     = vec3.fromValues(0.0, 0.5, 8.5);
    const center  = vec3.fromValues(0.0, 0.0, 0.0);
    const up      = vec3.fromValues(0.0, 1.0, 0.0);
    let view      = mat4.create();
    mat4.lookAt(view, eye, center, up);

    let light = vec3.fromValues(2.5, 2.5, 0.0);
    vec3.transformMat4(light, light, view);

    let modelView = mat4.clone(view);
    mat4.rotateY(modelView, modelView, glMatrix.toRadian(alpha));
    mat4.rotateZ(modelView, modelView, glMatrix.toRadian(beta));

    let normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, modelView);

    const screenCoordAndColor = pointsAndNormals.map(function(v) {
        let p = vec3.create();
        vec3.transformMat4(p, v[0], modelView);

        let l = vec3.clone(light);
        vec3.subtract(l, l, p);
        vec3.normalize(l, l);

        vec3.transformMat4(p, p, projection);

        let n = vec3.create();
        vec3.transformMat3(n, v[1], normalMatrix);
        vec3.normalize(n, n);

        let color = vec3.create();
        const s = 0.5 * (vec3.dot(n, l) + 1.0);
        const t = 1.0 - Math.pow(1.0 - s, 1.5);
        vec3.lerp(color, fgColors[Math.floor(Math.random() * fgColors.length)], bg, t);
        return [p, color];
    });
    screenCoordAndColor.sort((a, b) => a[0][3] - b[0][3]);
    return screenCoordAndColor;
}


function drawPointOnCanvas(p, c) {
    const x = 0.5 * canvasDim[0] * (1 + p[0]);
    const y = 0.5 * canvasDim[1] * (1 - p[1]);
    stroke(c[0], c[1], c[2]);
    // ellipse(x, y, 10, 10);
    point(x, y);
}

function setup() {
    createCanvas(canvasDim[0], canvasDim[1]);
    strokeWeight(1);

    noiseSeed(425960);
    noiseDetail(4, 0.5);

    sliderNoiseC = createSlider(0, 10, noiseC, 0.01);
    sliderNoiseC.position(10, 10);
    sliderNoiseC.style("width", "580px");

    sliderNoiseScale = createSlider(0, 10, noiseScale, 0.01);
    sliderNoiseScale.position(10, 35);
    sliderNoiseScale.style("width", "580px");

    sliderNoiseMag = createSlider(0, 1, noiseMag, 0.01);
    sliderNoiseMag.position(10, 60);
    sliderNoiseMag.style("width", "580px");

    let button = createButton("Save PDF");
    button.position(10, 85);
    button.mousePressed(savePdf);
}

function draw() {
    noiseC = sliderNoiseC.value();
    noiseScale = sliderNoiseScale.value();
    noiseMag = sliderNoiseMag.value();
    pSphere = pointsAndNormalsOnSphere(10000);
    const screenCoordAndColor = screenProjection(pSphere, canvasDim[0] / canvasDim[1]);
    background(bg[0], bg[1], bg[2]);
    screenCoordAndColor.forEach(function(pointAndColor) {
        const p = pointAndColor[0];
        const c = pointAndColor[1];
        drawPointOnCanvas(p, c);
    });
    // alpha += 0.15;
    // noiseC += 0.01;
}

function mouseDragged(event) {
    // const sensitivity = 0.2;
    // alpha += sensitivity * event.movementX;
    // beta  += sensitivity * event.movementY;
    // console.log("alpha = " + alpha + " deg, beta = " + beta + " deg");
}


function savePdf() {
    const pageDim = [210, 297];
    const drawDim = [150, 200];
    const drawOrigin = [0.5 * (pageDim[0] - drawDim[0]), 0.5 * (pageDim[1] - drawDim[1])];

    const pointsAndNormals = pointsAndNormalsOnSphere(100000);

    const doc = new jsPDF({
        format: [pageDim[0], pageDim[1]],
        compress: true
    });
    // doc.setLineWidth(0.5);
    // doc.setDrawColor(fg[0], fg[1], fg[2]);
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(drawOrigin[0], drawOrigin[1], drawDim[0], drawDim[1], "F");

    const screenCoordAndColor = screenProjection(pointsAndNormals, drawDim[0] / drawDim[1]);
    screenCoordAndColor.forEach(function(pointAndColor) {
        const p = pointAndColor[0];
        const c = pointAndColor[1];
        const x = drawOrigin[0] + 0.5 * drawDim[0] * (1 + p[0]);
        const y = drawOrigin[1] + 0.5 * drawDim[1] * (1 - p[1]);
        doc.setFillColor(c[0], c[1], c[2]);
        doc.circle(x, y, 0.05, "F");
    });

    doc.save("a4.pdf");
}
