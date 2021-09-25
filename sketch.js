
const w = 600;
const h = 800;

function hom2cat(out, v) {
    out[0] = v[0] / v[3];
    out[1] = v[1] / v[3];
    out[2] = v[2] / v[3];
    out[3] = 1.0;
}

function draw_point(v) {
    let x = 0.5 * w * (1 + v[0]);
    let y = 0.5 * h * (1 - v[1]);
    point(x, y);
}

function setup() {
    createCanvas(w, h);
    background(241, 235, 223);
    stroke(26, 24, 21);
    strokeWeight(1);

    glMatrix.setMatrixArrayType(Array);

    let vs = [
        vec4.fromValues( 0,  1, -1, 1),
        vec4.fromValues( 0, -1, -1, 1),
        vec4.fromValues( 1,  0, -1, 1),
        vec4.fromValues(-1,  0, -1, 1)
    ];
    console.log(vs);

    let modelview = mat4.create();
    mat4.lookAt(modelview, [0.0, 0.0, 1.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    console.log(modelview);

    let projection = mat4.create();
    mat4.perspective(projection, glMatrix.toRadian(90.0), w/h, 0.1, 100.0 );
    console.log(projection);

    vs.forEach(function(vin) {
        let v = vec4.clone(vin);
        vec4.transformMat4(v, v, modelview);
        console.log(v);
        vec4.transformMat4(v, v, projection);
        console.log(v);

        hom2cat(v, v);
        console.log(v);

        draw_point(v);
    });
    
}
