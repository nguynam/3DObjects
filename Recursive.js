/**
 * Created by Nam Nguyen and Joshua Crum.
 */
let draw;
let vertexNum;

class Recursive{
    constructor(gl, radius, subDiv, col1, col2){
        let side1 = [0,1,2];
        let side2 = [0,2,3];
        let side3 = [3,1,0];
        let base = [3,2,1];
        this.indicies = [];
        let vertices = [];
        draw = [];
        vertexNum = 4;

        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();
        this.vbuff = gl.createBuffer();

        let topPoint = vec3.fromValues(1,1,1);
        let basePoint1 = vec3.fromValues(-1, -1, 1);
        let basePoint2 = vec3.fromValues(-1, 1, -1);
        let basePoint3 = vec3.fromValues(1, -1, -1);

        vec3.normalize(topPoint, topPoint);
        vec3.normalize(basePoint1, basePoint1);
        vec3.normalize(basePoint2, basePoint2);
        vec3.normalize(basePoint3, basePoint3);

        vec3.scale(topPoint, topPoint, radius);
        vec3.scale(basePoint1, basePoint1, radius);
        vec3.scale(basePoint2, basePoint2, radius);
        vec3.scale(basePoint3, basePoint3, radius);

        let topX = topPoint[0];
        let topY = topPoint[1];
        let topZ = topPoint[2];
        vertices.push(topX, topY, topZ);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);

        let base1X = basePoint1[0];
        let base1Y = basePoint1[1];
        let base1Z = basePoint1[2];
        vertices.push(base1X, base1Y, base1Z);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);

        let base2X = basePoint2[0];
        let base2Y = basePoint2[1];
        let base2Z = basePoint2[2];
        vertices.push(base2X, base2Y, base2Z);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);

        let base3X = basePoint3[0];
        let base3Y = basePoint3[1];
        let base3Z = basePoint3[2];
        vertices.push(base3X, base3Y, base3Z);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);

        for(let i = 0; i < 3; i++){
            draw.push(side1[i]);
        }
        for(let j = 0; j < 3; j++){
            draw.push(side2[j]);
        }
        for(let k = 0; k < 3; k++){
            draw.push(side3[k]);
        }
        for(let l = 0; l < 3; l++){
            draw.push(base[l]);
        }

        //Call Recursive Function
        recursive(subDiv, topPoint, basePoint1, basePoint2, 0, 1, 2);
        recursive(subDiv, topPoint, basePoint2, basePoint3, 0, 2, 3);
        recursive(subDiv, topPoint, basePoint3, basePoint1, 0, 3, 1);
        recursive(subDiv, basePoint3, basePoint2, basePoint1, 3, 2, 1);

        this.stackIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.stackIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(draw), gl.STATIC_DRAW);
        let x = {"primitive": gl.TRIANGLES, "buffer": this.stackIdxBuff, "numPoints": draw.length};
        this.indicies.push(x);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

        //Recursive Function
        function recursive(N, a, b, c, na, nb, nc) {
            if(N == 0){
                //TO-DO
                return;
            }
            else{
                //A
                let aX = a[0];
                let aY = a[1];
                let aZ = a[2];
                //B
                let bX = b[0];
                let bY = b[1];
                let bZ = b[2];
                //C
                let cX = c[0];
                let cY = c[1];
                let cZ = c[2];

                //Point A to B
                let m1X = 0.5*(aX + bX);
                let m1Y = 0.5*(aY + bY);
                let m1Z = 0.5*(aZ + bZ);
                let m1 = vec3.fromValues(m1X, m1Y, m1Z);
                vec3.normalize(m1,m1);
                vec3.scale(m1,m1,radius);
                vertices.push(m1[0], m1[1], m1[2]);
                vec3.lerp(randColor, col1, col2, Math.random());
                vertices.push(randColor[0], randColor[1], randColor[2]);
                let m1Index = vertexNum;
                vertexNum++;

                //Point A to C
                let m2X = 0.5*(aX + cX);
                let m2Y = 0.5*(aY + cY);
                let m2Z = 0.5*(aZ + cZ);
                let m2 = vec3.fromValues(m2X, m2Y, m2Z);
                vec3.normalize(m2,m2);
                vec3.scale(m2,m2,radius);
                vertices.push(m2[0], m2[1], m2[2]);
                vec3.lerp(randColor, col1, col2, Math.random());
                vertices.push(randColor[0], randColor[1], randColor[2]);
                let m2Index = vertexNum;
                vertexNum++;

                //Point B to C
                let m3X = 0.5*(bX + cX);
                let m3Y = 0.5*(bY + cY);
                let m3Z = 0.5*(bZ + cZ);
                let m3 = vec3.fromValues(m3X, m3Y, m3Z);
                vec3.normalize(m3,m3);
                vec3.scale(m3,m3,radius);
                vertices.push(m3[0], m3[1], m3[2]);
                vec3.lerp(randColor, col1, col2, Math.random());
                vertices.push(randColor[0], randColor[1], randColor[2]);
                let m3Index = vertexNum;
                vertexNum++;

                //Push to draw array
                draw.push(na, m1Index, m2Index);
                draw.push(nb, m3Index, m1Index);
                draw.push(nc, m2Index, m3Index);
                draw.push(m1Index, m3Index,m2Index);

                recursive(N-1, a, m1, m2, na, m1Index, m2Index);
                recursive(N-1, m1, b, m3, m1Index, nb, m3Index);
                recursive(N-1, m3, c, m2, m3Index, nc, m2Index);
                recursive(N-1, m3, m2, m1, m3Index, m2Index, m1Index);
            }
        }
    }

    /**
     * Draw the object
     * @param {Number} vertexAttr a handle to a vec3 attribute in the vertex shader for vertex xyz-position
     * @param {Number} colorAttr  a handle to a vec3 attribute in the vertex shader for vertex rgb-color
     * @param {Number} modelUniform a handle to a mat4 uniform in the shader for the coordinate frame of the model
     * @param {mat4} coordFrame a JS mat4 variable that holds the actual coordinate frame of the object
     */
    draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
        /* copy the coordinate frame matrix to the uniform memory in shader */
        gl.uniformMatrix4fv(modelUniform, false, coordFrame);

        /* binder the (vertex+color) buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);

        /* with the "packed layout"  (x,y,z,r,g,b),
         the stride distance between one group to the next is 24 bytes */
        gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0);
        /* (x,y,z) begins at offset 0 */
        gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12);
        /* (r,g,b) begins at offset 12 */

        for (let k = 0; k < this.indicies.length; k++) {
            let obj = this.indicies[k];
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_SHORT, 0);
        }
    }
}