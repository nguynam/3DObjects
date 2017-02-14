/**
 * Created by Hans Dulimarta on 2/1/17.
 */
class Ring {
    /**
     * Create a 3D cone with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl      the current WebGL context
     * @param {Number} radius  radius of the cone base
     * @param {Number} height  height of the cone
     * @param {Number} subDiv  number of radial subdivision of the cone base
     * @param {vec3}   col1    color #1 to use
     * @param {vec3}   col2    color #2 to use
     */
    constructor(gl, outerRadius, innerRadius, height, subDiv, verDiv, col1, col2) {

        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();
        let vertices = [];
        this.vbuff = gl.createBuffer();
        let heightStep = height / verDiv;
        let currentRadius = outerRadius;

        /* Instead of allocating two separate JS arrays (one for position and one for color),
         in the following loop we pack both position and color
         so each tuple (x,y,z,r,g,b) describes the properties of a vertex
         */

        var firstCircle = [];
        var secondCircle = [];
        var firstOuterCircle = [];
        var secondOuterCircle = [];
        var firstInnerCircle = [];
        var secondInnerCircle = [];

        this.indices = [];
        var vertexNum = 0;
        for (let i = 0; i < verDiv; i++) {
            let outerIndex = [];
            let innerIndex = [];
            let circIndex = [];
            if (i > 1) {
                firstOuterCircle = secondOuterCircle;
                firstInnerCircle = secondInnerCircle;
                secondOuterCircle = [];
                secondInnerCircle = [];
            }

            for (let j = 0; j < 2; j++) {
                for (let k = 0; k < subDiv; k++) {
                    let angle = k * 2 * Math.PI / subDiv;
                    let x = currentRadius * Math.cos(angle);
                    let y = currentRadius * Math.sin(angle);

                    /* the first three floats are 3D (x,y,z) position */
                    vertices.push(x, y, height);

                    if (i == 0 && j == 0) {
                        firstOuterCircle.push(vertexNum);
                    }
                    else if (i >= 1 && j == 0) {
                        secondOuterCircle.push(vertexNum);
                    }
                    else if (i == 0 && j > 0){
                        firstInnerCircle.push(vertexNum);
                    }
                    else if (i >= 1 && j > 0){
                        secondInnerCircle.push(vertexNum);
                    }

                    if (j == 0) {
                        firstCircle.push(vertexNum);
                        vertexNum++;
                    }
                    else if (j >= 1) {
                        secondCircle.push(vertexNum);
                        vertexNum++;
                    }
                    /* perimeter of base */
                    vec3.lerp(randColor, col1, col2, Math.random());
                    /* linear interpolation between two colors */
                    /* the next three floats are RGB */
                    vertices.push(randColor[0], randColor[1], randColor[2]);
                }
                currentRadius = innerRadius;
            }
            currentRadius = outerRadius;
            height -= heightStep;
            var last = verDiv - 1;
            if(i == 0){
                for (var l = 0; l < subDiv; l++) {
                    circIndex.push(secondCircle[l]);
                    circIndex.push(firstCircle[l]);
                }
                circIndex.push(circIndex[0]);
                circIndex.push(circIndex[1]);
                this.circIdxBuff = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.circIdxBuff);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(circIndex), gl.STATIC_DRAW);

                var y = {"primitive": gl.TRIANGLE_STRIP, "buffer": this.circIdxBuff, "numPoints": circIndex.length};
                this.indices.push(y);
            }
            else if (i == last){
                for (var l = 0; l < subDiv; l++) {
                    circIndex.push(firstCircle[l]);
                    circIndex.push(secondCircle[l]);
                }
                circIndex.push(circIndex[0]);
                circIndex.push(circIndex[1]);
                this.circIdxBuff = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.circIdxBuff);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(circIndex), gl.STATIC_DRAW);

                var y = {"primitive": gl.TRIANGLE_STRIP, "buffer": this.circIdxBuff, "numPoints": circIndex.length};
                this.indices.push(y);
            }
            firstCircle = [];
            secondCircle = [];

            if (i >= 1) {
                for (let m = 0; m < subDiv; m++) {
                    outerIndex.push(firstOuterCircle[m]);
                    outerIndex.push(secondOuterCircle[m]);
                    innerIndex.push(secondInnerCircle[m]);
                    innerIndex.push(firstInnerCircle[m]);
                }
                outerIndex.push(outerIndex[0]);
                outerIndex.push(outerIndex[1]);
                innerIndex.push(innerIndex[0]);
                innerIndex.push(innerIndex[1]);
                this.stackIdxBuff = gl.createBuffer();
                this.innerIdxBuff = gl.createBuffer();

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.stackIdxBuff);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(outerIndex), gl.STATIC_DRAW);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.innerIdxBuff);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(innerIndex), gl.STATIC_DRAW);

                var x = {"primitive": gl.TRIANGLE_STRIP, "buffer": this.stackIdxBuff, "numPoints": outerIndex.length};
                this.indices.push(x);
                var z = {"primitive": gl.TRIANGLE_STRIP, "buffer": this.innerIdxBuff, "numPoints": innerIndex.length};
                this.indices.push(z);

            }
        }
        /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
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

        for (let k = 0; k < this.indices.length; k++) {
            let obj = this.indices[k];
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_SHORT, 0);
        }
    }
}
//comment