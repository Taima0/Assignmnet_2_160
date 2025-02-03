class Circle {
    constructor() {
        this.type = 'circle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = g_segments;
    }

    render() {
        var xy = this.position;  // Position of the circle
        var rgba = this.color;  // Color of the circle
        var size = this.size;  // Size of the circle

        // Pass the color to the fragment shader
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    

        var d = this.size / 200; // Delta
        let angleStep = 360 / this.segments; // Step size for angles

        // Draw each segment of the circle using triangles
        for (var angle = 0; angle < 360; angle=angle += angleStep) {
            let count = [xy[0], xy[1]]; // Circle center

            // Compute two consecutive angles
            let angle1 = angle;
            let angle2 = angle + angleStep;

            // Compute the position of the two vertices
            let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d];
            let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];

            let pt1 = [count[0]+vec1[0], count[1] + vec1[1]];
            let pt2 = [count[0]+vec2[0], count[1]+vec2[1]];

            // Draw the triangle
            drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
        }
    }
}