/**
 * Created by NamNguyen on 2/17/17.
 */
let vertices = [];
let draw = [];
let vertexNum = 4;

class Recursive{
    constructor(gl, radius, subDiv, col1, col2){
        let side1 = [0,1,2];
        let side2 = [0,2,3];
        let side3 = [0,3,1];
        let base = [3,2,1];
        this.indicies = [];

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

        for(var i = 0; i < 3; i++){
            draw.push(side1[i]);
        }
        for(var j = 0; j < 3; j++){
            draw.push(side2[j]);
        }
        for(var k = 0; k < 3; k++){
            draw.push(side3[k]);
        }
        for(var l = 0; l < 3; l++){
            draw.push(base[l]);
        }

        this.stackIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.stackIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(draw), gl.STATIC_DRAW);
        var x = {"primitive": gl.TRIANGLES, "buffer": this.stackIdxBuff, "numPoints": draw.length};
        this.indicies.push(x);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
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