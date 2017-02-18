/**
 * Created by Hans Dulimarta on 2/1/17.
 */
class Torus {
    /**
     * Create a 3D cone with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl      the current WebGL context
     * @param {Number} radius  radius of the cone base
     * @param {Number} height  height of the cone
     * @param {Number} subDiv  number of radial subdivision of the cone base
     * @param {vec3}   col1    color #1 to use
     * @param {vec3}   col2    color #2 to use
     */
    constructor(gl, bigRadius, smallRadius, subDiv, verDiv, col1, col2) {

        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let vertices = [];
        let randColor = vec3.create();
        this.vbuff = gl.createBuffer();
        this.stackIdxBuff = gl.createBuffer();
        let circleStep = 360 / verDiv;
        let startAngle = 0;
        let currentRadius;

        /* Instead of allocating two separate JS arrays (one for position and one for color),
         in the following loop we pack both position and color
         so each tuple (x,y,z,r,g,b) describes the properties of a vertex
         */

        let equator = [];
        let firstCircle = [];
        let secondCircle = [];
        this.indices = [];
        let stackIndex = [];
        let vertexNum = 0;
        for (let i = 0; i <= verDiv; i++) {
            if(i > 1){
                firstCircle = secondCircle;
                secondCircle = [];
            }
            let circRad = smallRadius * Math.cos(startAngle * (Math.PI / 180));
            let circHeight = (smallRadius * Math.sin(startAngle * (Math.PI / 180)));
            currentRadius = bigRadius + circRad;
            for (let k = 0; k < subDiv; k++) {
                let angle = k * 2 * Math.PI / subDiv;
                let x = currentRadius * Math.cos(angle);
                let y = currentRadius * Math.sin(angle);

                /* the first three floats are 3D (x,y,z) position */
                vertices.push(x, y, circHeight);

                if(i == 0) {
                    firstCircle.push(vertexNum);
                    equator.push(vertexNum);
                    vertexNum++;
                } else if(i > 0) {
                    secondCircle.push(vertexNum);
                    vertexNum++;
                }

                /* perimeter of base */
                vec3.lerp(randColor, col1, col2, Math.random());
                /* linear interpolation between two colors */
                /* the next three floats are RGB */
                vertices.push(randColor[0], randColor[1], randColor[2]);
            }
            startAngle += circleStep;
            if(i == verDiv){
                var first = firstCircle[0];
                var second = secondCircle[0];
                for(var j = 0; j < subDiv; j++){
                    stackIndex.push(firstCircle[j]);
                    stackIndex.push(equator[j]);
                }
                stackIndex.push(first);
                stackIndex.push(second);
            }
            else if(i >= 1 && i != verDiv){
                var first = firstCircle[0];
                var second = secondCircle[0];
                for(var j = 0; j < subDiv; j++){
                    stackIndex.push(firstCircle[j]);
                    stackIndex.push(secondCircle[j]);
                }
                stackIndex.push(first);
                stackIndex.push(second);

            }
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.stackIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(stackIndex), gl.STATIC_DRAW);
        var x = {"primitive": gl.TRIANGLE_STRIP, "buffer": this.stackIdxBuff, "numPoints": stackIndex.length};
        this.indices.push(x);

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
