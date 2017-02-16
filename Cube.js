class Cube {

    constructor (gl, size, subDiv, col1, col2) {

        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();
        let vertices = [];
        let step = size / subDiv;
        let top = [];
        let bottom = [];
        let frontBack = [];
        let rightLeft = [];
        this.indices = [];
        this.vbuff = gl.createBuffer();

        //top and bottom of cube
        for (let row = 0; row < subDiv; row++) {
            for (let col = 0; col < subDiv; col++) {
                vec3.lerp(randColor, col1, col2, Math.random());
                /* linear interpolation between two colors */
                /* the next three floats are RGB */
                if (col == 0) {
                    top.push(row * step, col * step, size);
                    top.push(randColor[0], randColor[1], randColor[2]);

                    top.push((row + 1) * step, col * step, size);
                    top.push(randColor[0], randColor[1], randColor[2]);

                    top.push(row * step, (col + 1) * step, size);
                    top.push(randColor[0], randColor[1], randColor[2]);
                } else if (col == (subDiv - 1)) {
                    top.push((row + 1) * step, col * step, size);
                    top.push(randColor[0], randColor[1], randColor[2]);

                    top.push((row + 1) * step, col * step, size);
                    top.push(randColor[0], randColor[1], randColor[2]);

                    top.push((row + 1) * step, (col - (subDiv - 1)) * step, size);
                    top.push(randColor[0], randColor[1], randColor[2]);

                } else {
                    top.push((row + 1)* step, col * step, size);
                    top.push(randColor[0], randColor[1], randColor[2]);

                    top.push(row * step, (col + 1) * step, size);
                    top.push(randColor[0], randColor[1], randColor[2]);

                }

            }
        }

        this.topBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.topBuff);
        gl.bufferData(gl.ARRAY_BUFFER, Uint16Array.from(top), gl.STATIC_DRAW);

        var x = {"primitive": gl.POINTS, "buffer": this.topBuff, "numPoints": top.length};
        this.indices.push(x);

        for (let k = 0; k < this.indices.size; k++) {

        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Float32Array.from(this.indices), gl.STATIC_DRAW);
    }

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