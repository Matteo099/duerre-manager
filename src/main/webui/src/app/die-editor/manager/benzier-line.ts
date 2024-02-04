import Konva from "konva";

export interface IQuad {
    start: Konva.Vector2d
    control: Konva.Vector2d
    end: Konva.Vector2d
    toArray(): number[];
}
export class Quad implements IQuad {
    public readonly start: Konva.Vector2d;
    public readonly control: Konva.Vector2d;
    public readonly end: Konva.Vector2d;

    constructor(start: Konva.Vector2d, control: Konva.Vector2d, end: Konva.Vector2d) {
        this.start = start; 
        this.control = control; 
        this.end = end; 
    }

    public toArray(): number[] {
        return [this.start.x, this.start.y, this.control.x, this.control.y, this.end.x, this.end.y];
    }
}

export class BezierLine extends Konva.Shape {

    private quad: Quad;

    constructor(config: { quad: Quad } & Konva.ShapeConfig) {
        super({
            ...config,
            sceneFunc: (ctx, shape) => {
                const { quad } = config;
                ctx.beginPath();
                ctx.moveTo(quad.start.x, quad.start.y);
                ctx.quadraticCurveTo(
                    quad.control.x,
                    quad.control.y,
                    quad.end.x,
                    quad.end.y
                );
                ctx.fillStrokeShape(shape);
            }
        });
        this.className = 'BezierLine';
        this.quad = config.quad;
    }

    private createControls() {
        // TODO...
    }

    public points(p?: number[] | Quad, numberOfPoints: number = 100): number[] {
        if (p) {
            // Modify the BezierLine if points are provided
            if (p instanceof Array && p.length % 2 === 0) {
                this.quad.start.x = p[0];
                this.quad.start.y = p[1];
                this.quad.control.x = p[2];
                this.quad.control.y = p[3];
                this.quad.end.x = p[4];
                this.quad.end.y = p[5];
            } else {
                this.quad = p as Quad;
            }
        }

        const points: number[] = [];
        for (let t = 0; t <= 1; t += 1 / numberOfPoints) {
            const x = Math.pow(1 - t, 2) * this.quad.start.x + 2 * (1 - t) * t * this.quad.control.x + t * t * this.quad.end.x;
            const y = Math.pow(1 - t, 2) * this.quad.start.y + 2 * (1 - t) * t * this.quad.control.y + t * t * this.quad.end.y;
            points.push(x, y);
        }
        return points;
    }


    public calculateLength(numberOfPoints: number = 100): number {
        let length = 0;

        for (let i = 0; i < numberOfPoints; i++) {
            const t1 = i / numberOfPoints;
            const t2 = (i + 1) / numberOfPoints;
            const midpoint = (t1 + t2) / 2;

            length += this.calculateLineLength(midpoint) * (t2 - t1);
        }

        return length;
    }

    private calculateLineLength(t: number) {
        const derivativeX = 2 * (1 - t) * (this.quad.control.x - this.quad.start.x) + 2 * t * (this.quad.end.x - this.quad.control.x);
        const derivativeY = 2 * (1 - t) * (this.quad.control.y - this.quad.start.y) + 2 * t * (this.quad.end.y - this.quad.control.y);
        return Math.sqrt(derivativeX ** 2 + derivativeY ** 2);
    }
}