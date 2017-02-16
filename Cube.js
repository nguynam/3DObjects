class Cube {

    constructor (gl, size, subDiv, col1, col2) {

        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();
        let step = size / (subDiv - 1);

        let top = [];
        this.topIndexBuff;
        this.topBuff = gl.createBuffer();

        let bottom = [];
        let frontBack = [];
        let rightLeft = [];
        this.indices = [];
        this.topIndices = [];

        //top and bottom of cube
        for (let row = 0; row < subDiv; row++) {
            for (let col = 0; col < subDiv; col++) {
                vec3.lerp(randColor, col1, col2, Math.random());
                /* linear interpolation between two colors */
                /* the next three floats are RGB */
                top.push(row * step, col * step, size);
                top.push(randColor[0], randColor[1], randColor[2]);
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.topBuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(top), gl.STATIC_DRAW);

        //right and left side of cube

        //front and back side of cube

        //generate the order of the points
        for (let k = 0; k < subDiv; k++) {
            for (let l = 0; l < subDiv; l++) {
                if (k < subDiv - 1) {
                    this.topIndices.push(subDiv * k + l);
                    this.topIndices.push(subDiv * (k + 1) + l);
                }
            }
        }

        this.topIndexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIndexBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(this.topIndices), gl.STATIC_DRAW);

        let topFace = {"primitive": gl.TRIANGLE_STRIP, "buffer": this.topIndexBuff, "numPoints": this.topIndices.length};
        this.indices.push(topFace);
    }

    draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
        /* copy the coordinate frame matrix to the uniform memory in shader */
        gl.uniformMatrix4fv(modelUniform, false, coordFrame);

        /* binder the (vertex+color) buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.topIndexBuff);

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