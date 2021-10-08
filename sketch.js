
const { jsPDF } = window.jspdf;

glMatrix.setMatrixArrayType(Array);

const canvasDim = [600, 900];

let alpha = 30.0;
let beta  = 135.0;

const fg = vec3.fromValues(26, 24, 21);
const bg = vec3.fromValues(241, 235, 223);

let pSphere = pointsSphere(7500);

function pointsSphere(pointCount) {
    let p = [];
    for (let i = 0; i < pointCount; i++) {
        const s = 0.01 * pointCount;
        const f = (i + s) / (pointCount + s);
        const l = rand(0.0, Math.pow(f, 1.75));
        p.push(createPointOnSphere(1.0 - 2.0 * Math.pow(l, 1.0)));
    }
    return p;
}

function rand(a, b) {
    return (b - a) * Math.random() + a;
}

function createPointOnSphere(y) {
    y = y || rand(-1.0, 1.0);
    const r = Math.sqrt(1.0 - y*y);
    const phi = rand(0.0, 2.0 * Math.PI);
    return vec3.fromValues(r * Math.cos(phi), y, r * Math.sin(phi));
}

function screenProjection(points, aspectRatio) {
    let projection = mat4.create();
    mat4.perspective(projection, glMatrix.toRadian(30.0), aspectRatio, 0.1);

    const eye     = vec3.fromValues(0.0, 0.5, 10.5);
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

    const screenCoordAndColor = points.map(function(v) {
        let p = vec3.create();
        vec3.transformMat4(p, v, modelView);

        let l = vec3.clone(light);
        vec3.subtract(l, l, p);
        vec3.normalize(l, l);

        vec3.transformMat4(p, p, projection);

        let n = vec3.create();
        vec3.transformMat3(n, v, normalMatrix);
        vec3.normalize(n, n);

        const t = 0.5 * (vec3.dot(n, l) + 1.0);
        let color = vec3.create();
        vec3.lerp(color, fg, bg, 1.0 - Math.pow(1.0 - t, 1.5));
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
}

function draw() {
    const screenCoordAndColor = screenProjection(pSphere, canvasDim[0] / canvasDim[1]);
    background(bg[0], bg[1], bg[2]);
    screenCoordAndColor.forEach(function(pointAndColor) {
        const p = pointAndColor[0];
        const c = pointAndColor[1];
        drawPointOnCanvas(p, c);
    });
    // alpha += 0.15;
}

function mouseDragged(event) {
    const sensitivity = 0.2;
    alpha += sensitivity * event.movementX;
    beta  += sensitivity * event.movementY;
    // console.log("alpha = " + alpha + " deg, beta = " + beta + " deg");
}


function savePdf() {
    const pageDim = [210, 297];
    const drawDim = [150, 225];
    const drawOrigin = [0.5 * (pageDim[0] - drawDim[0]), 0.5 * (pageDim[1] - drawDim[1])];

    const points = pointsSphere(100000);

    const doc = new jsPDF({
        format: [pageDim[0], pageDim[1]],
        compress: true
    });
    // doc.setLineWidth(0.5);
    // doc.setDrawColor(fg[0], fg[1], fg[2]);
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(drawOrigin[0], drawOrigin[1], drawDim[0], drawDim[1], "F");

    const screenCoordAndColor = screenProjection(points, drawDim[0] / drawDim[1]);
    screenCoordAndColor.forEach(function(pointAndColor) {
        const p = pointAndColor[0];
        const c = pointAndColor[1];
        const x = drawOrigin[0] + 0.5 * drawDim[0] * (1 + p[0]);
        const y = drawOrigin[1] + 0.5 * drawDim[1] * (1 - p[1]);
        doc.setFillColor(c[0], c[1], c[2]);
        doc.circle(x, y, 0.1, "F");
    });

    doc.save("a4.pdf");
}

// savePdf();
