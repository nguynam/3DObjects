class Cube {

    constructor (gl, size, subDiv, col1, col2) {

        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();
        this.indices = [];
        this.vbuff = gl.createBuffer();
        let step = size / (subDiv - 1);
        let vertices = [];

        //top face of the cube
        let top = [];
        this.topIndices = [];

        //bottom face of the cube
        let bottom = [];
        this.bottomIndices = [];

        //front face of the cube
        let front = [];
        this.frontIndices = [];

        //back of the cube
        let back = [];
        this.backIndices = [];

        //top and bottom of cube
        let x = -size / 2;
        for (let row = 0; row < subDiv; row++) {
            let y = -size / 2;
            for (let col = 0; col < subDiv; col++) {
                vec3.lerp(randColor, col1, col2, Math.random());
                top.push(x, y, size / 2);
                top.push(randColor[0], randColor[1], randColor[2]);

                bottom.push(x, y,  -size / 2);
                bottom.push(randColor[0], randColor[1], randColor[2]);
                y += step;
            }
            x += step;
        }

        //front and back side of cube
        let xx = -size / 2;
        for (let row = 0; row < subDiv; row++) {
            let yy = -size / 2;
            for (let col = 0; col < subDiv; col++) {
                vec3.lerp(randColor, col1, col2, Math.random());
                front.push(size / 2, yy, xx);
                front.push(randColor[0], randColor[1], randColor[2]);

                back.push(-size / 2, xx, yy);
                back.push(randColor[0], randColor[1], randColor[2]);
                yy += step;
            }
            x += step;
        }

        //right and left side of cube

        //generate the order of the points

        let facePoints = subDiv * subDiv;
        for (let k = 0; k < subDiv; k++) {
            for (let l = 0; l < subDiv; l++) {
                if (k < subDiv - 1) {
                    this.topIndices.push(subDiv * k + l);
                    this.topIndices.push(subDiv * (k + 1) + l);

                    this.bottomIndices.push((subDiv * k + l) + facePoints);
                    this.bottomIndices.push((subDiv * (k + 1) + l) + facePoints);

                    this.frontIndices.push((subDiv * k + l) + (facePoints * 2));
                    this.frontIndices.push((subDiv * (k + 1) + l) + (facePoints * 2));

                    this.backIndices.push((subDiv * k + l) + (facePoints * 3));
                    this.backIndices.push((subDiv * (k + 1) + l) + (facePoints * 3));
                }
            }
        }

        for (let topI = 0; topI < top.length; topI++) {
            vertices.push(top[topI]);
        }

        for (let botI = 0; botI < bottom.length; botI++) {
            vertices.push(bottom[botI]);
        }

        for (let frontI = 0; frontI < bottom.length; frontI++) {
            vertices.push(front[frontI]);
        }

        for (let backI = 0; backI < bottom.length; backI++) {
            vertices.push(back[backI]);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

        this.topIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(this.topIndices), gl.STATIC_DRAW);

        this.botIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.botIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(this.bottomIndices), gl.STATIC_DRAW);

        this.frontIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.frontIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(this.frontIndices), gl.STATIC_DRAW);

        this.backIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.backIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(this.backIndices), gl.STATIC_DRAW);

        let topFace = {"primitive": gl.TRIANGLE_STRIP, "buffer": this.topIdxBuff, "numPoints": this.topIndices.length};
        let bottomFace = {"primitive": gl.TRIANGLE_STRIP, "buffer": this.botIdxBuff, "numPoints": this.bottomIndices.length};
        let frontFace = {"primitive": gl.POINTS, "buffer": this.frontIdxBuff, "numPoints": this.frontIndices.length};
        let backFace = {"primitive": gl.POINTS, "buffer": this.backIdxBuff, "numPoints": this.backIndices.length};

        this.indices.push(topFace);
        this.indices.push(bottomFace);
        this.indices.push(frontFace);
        this.indices.push(backFace);
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