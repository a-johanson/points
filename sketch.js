
const w = 600;
const h = 800;

let alpha = 0;

glMatrix.setMatrixArrayType(Array);

let view = mat4.create();
mat4.lookAt(view, [0.0, 1.5, 10.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
console.log(view);

let projection = mat4.create();
mat4.perspective(projection, glMatrix.toRadian(30.0), w/h, 0.1, 100.0);
console.log(projection);

let vs = [
    vec4.fromValues( 0,  1, 0, 1),
    vec4.fromValues( 0, -1, 0, 1),
    vec4.fromValues( 1,  0, 0, 1),
    vec4.fromValues(-1,  0, 0, 1)
];
console.log(vs);

function hom2cat(out, v) {
    out[0] = v[0] / v[3];
    out[1] = v[1] / v[3];
    out[2] = v[2] / v[3];
    out[3] = 1.0;
}

function draw_point(v) {
    let x = 0.5 * w * (1 + v[0]);
    let y = 0.5 * h * (1 - v[1]);
    ellipse(x, y, 10, 10);
}

function setup() {
    createCanvas(w, h);
    stroke(26, 24, 21);
    strokeWeight(1);
}

function draw() {
    let model = mat4.create();
    mat4.fromYRotation(model, glMatrix.toRadian(alpha));
    //clear();
    background(241, 235, 223);
    vs.forEach(function(vin) {
        let v = vec4.clone(vin);
        vec4.transformMat4(v, v, model);
        // console.log(v);
        vec4.transformMat4(v, v, view);
        // console.log(v);
        vec4.transformMat4(v, v, projection);
        // console.log(v);

        hom2cat(v, v);
        // console.log(v);

        draw_point(v);
    });

    alpha += 0.5;
}
