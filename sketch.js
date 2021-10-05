
const w = 600;
const h = 800;

let alpha = 0.0;
let beta  = 120.0;

glMatrix.setMatrixArrayType(Array);

const fg = vec3.fromValues(26, 24, 21);
const bg = vec3.fromValues(241, 235, 223);

let pSphere = [];

function rand(a, b) {
    return (b - a) * Math.random() + a;
}

function createPointOnSphere(y) {
    y = y || rand(-1.0, 1.0);
    const r = Math.sqrt(1.0 - y*y);
    const phi = rand(0.0, 2.0 * Math.PI);
    return vec3.fromValues(r * Math.cos(phi), y, r * Math.sin(phi));
}

function drawPoint(p, c) {
    const x = 0.5 * w * (1 + p[0]);
    const y = 0.5 * h * (1 - p[1]);
    stroke(c[0], c[1], c[2]);
    // ellipse(x, y, 10, 10);
    point(x, y);
}

function setup() {
    createCanvas(w, h);
    strokeWeight(1);

    const pointCount = 7500;
    for (let i = 0; i < pointCount; i++) {
        const s = 50;
        const f = (i + s) / (pointCount + s);
        const l = rand(0.0, Math.pow(f, 1.75));
        pSphere.push(createPointOnSphere(1.0 - 2.0 * Math.pow(l, 1.0)));
    }
}

function draw() {
    let projection = mat4.create();
    mat4.perspective(projection, glMatrix.toRadian(30.0), w/h, 0.1);

    const eye     = vec3.fromValues(0.0, 1.5, 10.0);
    const center  = vec3.fromValues(0.0, 0.0, 0.0);
    const up      = vec3.fromValues(0.0, 1.0, 0.0);
    let view      = mat4.create();
    mat4.lookAt(view, eye, center, up);

    let light = vec3.fromValues(1.5, 1.5, 0.9);
    vec3.transformMat4(light, light, view);

    let modelView = mat4.clone(view);
    mat4.rotateY(modelView, modelView, glMatrix.toRadian(alpha));
    mat4.rotateZ(modelView, modelView, glMatrix.toRadian(beta));

    let normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, modelView);

    background(bg[0], bg[1], bg[2]);
    const screenCoordAndColor = pSphere.map(function(v) {
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
        vec3.lerp(color, fg, bg, t);
        return [p, color];
    });
    screenCoordAndColor.sort((a, b) => a[0][3] - b[0][3]);
    screenCoordAndColor.forEach(function(pointAndColor) {
        const p = pointAndColor[0];
        const c = pointAndColor[1];
        drawPoint(p, c);
    });

    alpha += 0.15;
}

function mouseDragged(event) {
    const sensitivity = 0.2;
    alpha += sensitivity * event.movementX;
    beta  += sensitivity * event.movementY;
}
