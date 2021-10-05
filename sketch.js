
const w = 600;
const h = 800;

let alpha = 0.0;
let beta  = 120.0;

glMatrix.setMatrixArrayType(Array);

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

function drawPoint(v) {
    const x = 0.5 * w * (1 + v[0]);
    const y = 0.5 * h * (1 - v[1]);
    // ellipse(x, y, 10, 10);
    point(x, y);
}

function setup() {
    createCanvas(w, h);
    stroke(26, 24, 21);
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
    let modelView = mat4.create();
    mat4.lookAt(modelView, eye, center, up);

    mat4.rotateY(modelView, modelView, glMatrix.toRadian(alpha));
    mat4.rotateZ(modelView, modelView, glMatrix.toRadian(beta));

    let normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, modelView);

    let modelViewProjection = mat4.create();
    mat4.multiply(modelViewProjection, projection, modelView);

    background(241, 235, 223);
    pSphere.forEach(function(v) {
        let p = vec3.create();
        vec3.transformMat4(p, v, modelViewProjection);
        let n = vec3.create();
        vec3.transformMat3(n, v, normalMatrix);

        if(n[2] > 0.0) {
            stroke(26, 24, 21);
        } else {
            stroke(156, 144, 126);
        }
        drawPoint(p);
    });

    alpha += 0.15;
}

function mouseDragged(event) {
    const sensitivity = 0.2;
    alpha += sensitivity * event.movementX;
    beta  += sensitivity * event.movementY;
}
