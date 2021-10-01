
const w = 600;
const h = 800;

let alpha = 0;

glMatrix.setMatrixArrayType(Array);

let pSphere = [];

function sphere2cat(out, r, theta, phi) {
    // theta: inclination [0, pi]
    // phi: azimuth [0, 2pi)
    out[0] = r * Math.cos(phi) * Math.sin(theta);
    out[1] = r * Math.sin(phi) * Math.sin(theta);
    out[2] = r * Math.cos(theta);
    out[3] = 1.0;
}

function hom2cat(out, v) {
    out[0] = v[0] / v[3];
    out[1] = v[1] / v[3];
    out[2] = v[2] / v[3];
    out[3] = 1.0;
}

function draw_point(v) {
    let x = 0.5 * w * (1 + v[0]);
    let y = 0.5 * h * (1 - v[1]);
    // ellipse(x, y, 10, 10);
    point(x, y);
}

function setup() {
    createCanvas(w, h);
    stroke(26, 24, 21);
    strokeWeight(1);

    for (let i = 0; i <= 1000; i++) {
        let v = vec4.create();
        const theta = Math.random() * Math.PI;
        const phi = Math.random() * 2.0 * Math.PI;
        sphere2cat(v, 1.0, theta, phi);
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
    mat4.fromYRotation(model, glMatrix.toRadian(alpha));
    mat4.multiply(modelViewProjection, modelViewProjection, model);

    background(241, 235, 223);
    pSphere.forEach(function(vin) {
        let v = vec4.clone(vin);
        vec4.transformMat4(v, v, modelViewProjection);
        hom2cat(v, v);
        draw_point(v);
    });

    alpha += 0.5;
}
