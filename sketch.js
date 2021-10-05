
const w = 600;
const h = 800;

let alpha = 0.0;
let beta  = 120.0;

glMatrix.setMatrixArrayType(Array);

let pSphere = [];

function rand(a, b) {
    return (b - a) * Math.random() + a;
}

function pointOnSphere(out, y) {
    y = y || rand(-1.0, 1.0);
    const r = Math.sqrt(1.0 - y*y);
    const phi = rand(0.0, 2.0 * Math.PI);
    out[0] = r * Math.cos(phi);
    out[1] = y;
    out[2] = r * Math.sin(phi);
    out[3] = 1.0;
}

function hom2Cat(out, v) {
    out[0] = v[0] / v[3];
    out[1] = v[1] / v[3];
    out[2] = v[2] / v[3];
    out[3] = 1.0;
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
        let v = vec4.create();
        const s = 50;
        const f = (i + s) / (pointCount + s);
        const l = rand(0.0, Math.pow(f, 1.75));
        pointOnSphere(v, 1.0 - 2.0 * Math.pow(l, 1.0));
        pSphere.push(v);
    }
}

function draw() {
    let projection = mat4.create();
    mat4.perspective(projection, glMatrix.toRadian(30.0), w/h, 0.1);

    const eye    = [0.0, 1.5, 10.0];
    const center = [0.0, 0.0, 0.0];
    const up     = [0.0, 1.0, 0.0];
    let view     = mat4.create();
    mat4.lookAt(view, eye, center, up);

    let modelViewProjection = mat4.create();
    mat4.multiply(modelViewProjection, projection, view);

    let model = mat4.create();
    mat4.rotateY(model, model, glMatrix.toRadian(alpha));
    mat4.rotateZ(model, model, glMatrix.toRadian(beta));
    mat4.multiply(modelViewProjection, modelViewProjection, model);

    background(241, 235, 223);
    pSphere.forEach(function(vin) {
        let v = vec4.clone(vin);
        vec4.transformMat4(v, v, modelViewProjection);
        hom2Cat(v, v);
        drawPoint(v);
    });

    alpha += 0.15;
}

function mouseDragged(event) {
    const sensitivity = 0.2;
    alpha += sensitivity * event.movementX;
    beta  += sensitivity * event.movementY;
}
