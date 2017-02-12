/**
 * Created by Hans Dulimarta on 2/1/17.
 */
class holder {
    /**
     * Create a 3D cone with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl      the current WebGL context
     * @param {Number} radius  radius of the cone base
     * @param {Number} height  height of the cone
     * @param {Number} subDiv  number of radial subdivision of the cone base
     * @param {vec3}   col1    color #1 to use
     * @param {vec3}   col2    color #2 to use
     */
    constructor(gl, radius, height, subDiv, verDiv, col1, col2) {

        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();
        let vertices = [];
        this.vbuff = gl.createBuffer();
        let heightStep = height / verDiv;


        /* Instead of allocating two separate JS arrays (one for position and one for color),
         in the following loop we pack both position and color
         so each tuple (x,y,z,r,g,b) describes the properties of a vertex
         */
        vertices.push(0, 0, height);
        /* tip of cone */
        vec3.lerp(randColor, col1, col2, Math.random());
        /* linear interpolation between two colors */
        vertices.push(randColor[0], randColor[1], randColor[2]);
        let tempHeight = 0;

        var firstCircle = [];
        var secondCircle = [];
        this.indices = [];
        var vertexNum = 0;
        let angle = (90 / verDiv) * (Math.PI / 180);

        for (let i = 0; i < verDiv; i++) {
            let stackIndex = [];

            let tempRadius;
            if (i == 0) {
                tempRadius = radius;
            } else {
                tempRadius = radius * Math.cos(angle);
            }

            if (i > 1) {
                firstCircle = secondCircle;
                secondCircle = [];
            }

            for (let k = 0; k < verDiv; k++) {
                let circAngle = k * 2 * Math.PI / subDiv;
                let x = tempRadius * Math.cos(angle);
                let y = tempRadius * Math.sin(angle);

                if (i == 0) {
                    firstCircle.push(vertexNum);
                    vertexNum++;
                }

                if (i > 1) {
                    secondCircle.push(vertexNum);
                    vertexNum++;
                }

                /* perimeter of base */
                vec3.lerp(randColor, col1, col2, Math.random());
                /* linear interpolation between two colors */
                /* the next three floats are RGB */
                vertices.push(randColor[0], randColor[1], randColor[2]);
            }

            tempHeight += heightStep;
            if (i >= 1) {
                for (var j = 0; j < subDiv; j++) {
                    stackIndex.push(firstCircle[j]);
                    stackIndex.push(secondCircle[j]);
                }
                stackIndex.push(stackIndex[0]);
                stackIndex.push(stackIndex[1]);
                this.stackIdxBuff = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.stackIdxBuff);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(stackIndex), gl.STATIC_DRAW);
            }
            var x = {"primitive": gl.TRIANGLE_STRIP, "buffer": this.stackIdxBuff, "numPoints": stackIndex.length};
            this.indices.push(x);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

        // Generate index order for top of cone
        let topIndex = [];
        topIndex.push(0);
        for (let k = 1; k <= subDiv; k++)
            topIndex.push(k);
        topIndex.push(1);
        this.topIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(topIndex), gl.STATIC_DRAW);

        /* Put the indices as an array of objects. Each object has three attributes:
         primitive, buffer, and numPoints */
        var top = {"primitive": gl.TRIANGLE_FAN, "buffer": this.topIdxBuff, "numPoints": topIndex.length};
        this.indices.push(top);
    }

    /**
     * Draw the object
     * @param {Number} vertexAttr a handle to a vec3 attribute in the vertex shader for vertex xyz-position
     * @param {Number} colorAttr  a handle to a vec3 attribute in the vertex shader for vertex rgb-color
     * @param {Number} modelUniform a handle to a mat4 uniform in the shader for the coordinate frame of the model
     * @param {mat4} coordFrame a JS mat4 variable that holds the actual coordinate frame of the object
     */
    draw(vertexAttr, colorAttr, modelUniform, coordFrame)
    {
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
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
        }
    }
}
