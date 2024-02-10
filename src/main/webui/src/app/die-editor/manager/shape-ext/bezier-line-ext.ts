import Konva from "konva";
import { ExtendedShape } from "./extended-shape";
import { Quad } from "./quad";

export class BezierLineExt extends ExtendedShape<Konva.Shape> {
    public quad!: Quad;
    private readonly numberOfPoints: number = 100;

    protected override createShape(position: Konva.Vector2d): Konva.Shape {
        this.quad = new Quad(
            { x: position.x, y: position.y },
            { x: position.x, y: position.y + 50 },
            { x: position.x, y: position.y });

        const bezierLine = new Konva.Shape({
            stroke: '#df4b26',
            strokeWidth: 5,
            globalCompositeOperation: 'source-over',
            // round cap for smoother lines
            lineCap: 'round',
            lineJoin: 'round',
            hitStrokeWidth: 20,
            sceneFunc: (ctx, shape) => {
                console.log(JSON.stringify(this.quad));
                ctx.beginPath();
                ctx.moveTo(this.quad.start.x, this.quad.start.y);
                ctx.quadraticCurveTo(
                    this.quad.control.x,
                    this.quad.control.y,
                    this.quad.end.x,
                    this.quad.end.y
                );
                ctx.fillStrokeShape(shape);
            }
        });
        return bezierLine;
    }

    getEndPoints(): Konva.Vector2d[] {
        return [{ x: this.quad.start.x, y: this.quad.start.y }, { x: this.quad.end.x, y: this.quad.end.y }];
    }

    getPoints(): number[] {
        const points: number[] = [];
        for (let t = 0; t <= 1; t += 1 / this.numberOfPoints) {
            const x = Math.pow(1 - t, 2) * this.quad.start.x + 2 * (1 - t) * t * this.quad.control.x + t * t * this.quad.end.x;
            const y = Math.pow(1 - t, 2) * this.quad.start.y + 2 * (1 - t) * t * this.quad.control.y + t * t * this.quad.end.y;
            points.push(x, y);
        }
        return points;
    }

    setPoints(p: number[] | Quad): Konva.Shape {
        if (p instanceof Array && p.length % 2 === 0) {
            if (p.length == 2) {
                this.quad.start.x = p[0];
                this.quad.start.y = p[1];

            } else if (p.length == 4) {
                this.quad.start.x = p[0];
                this.quad.start.y = p[1];
                this.quad.end.x = p[2];
                this.quad.end.y = p[3];

            } else {
                this.quad.start.x = p[0];
                this.quad.start.y = p[1];
                this.quad.control.x = p[2];
                this.quad.control.y = p[3];
                this.quad.end.x = p[4];
                this.quad.end.y = p[5];
            }
        } else {
            this.quad = p as Quad;
        }
        return this._shape;
    }

    calculateLength(): number {
        let length = 0;

        for (let i = 0; i < this.numberOfPoints; i++) {
            const t1 = i / this.numberOfPoints;
            const t2 = (i + 1) / this.numberOfPoints;
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

    calculateMiddlePoint(): Konva.Vector2d {
        const t = 0.5; // middle point

        const x = Math.pow(1 - t, 2) * this.quad.start.x + 2 * (1 - t) * t * this.quad.control.x + t * t * this.quad.end.x;
        const y = Math.pow(1 - t, 2) * this.quad.start.y + 2 * (1 - t) * t * this.quad.control.y + t * t * this.quad.end.y;

        return { x, y };
    }

    calculatePointsGivenLength(length: number): { oldPoints: number[], newPoints: number[] } {
        //const points: number[] = [];
        const oldPoints = this.quad.toArray();

        let totalLength = 0;
        let prevX = this.quad.start.x;
        let prevY = this.quad.start.y;

        for (let t = 0; t <= 1; t += 1 / this.numberOfPoints) {
            const x = Math.pow(1 - t, 2) * this.quad.start.x + 2 * (1 - t) * t * this.quad.control.x + t * t * this.quad.end.x;
            const y = Math.pow(1 - t, 2) * this.quad.start.y + 2 * (1 - t) * t * this.quad.control.y + t * t * this.quad.end.y;

            let segmentLength = 0;
            if (t > 0) {
                segmentLength = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2));
                totalLength += segmentLength;
            }

            if (length <= totalLength || t === 1) {
                // Calculate the adjusted t value to match the target length
                const adjustedT = t - (totalLength - length) / (length - (totalLength - segmentLength));

                const adjustedX =
                    Math.pow(1 - adjustedT, 2) * this.quad.start.x +
                    2 * (1 - adjustedT) * adjustedT * this.quad.control.x +
                    adjustedT * adjustedT * this.quad.end.x;

                const adjustedY =
                    Math.pow(1 - adjustedT, 2) * this.quad.start.y +
                    2 * (1 - adjustedT) * adjustedT * this.quad.control.y +
                    adjustedT * adjustedT * this.quad.end.y;

                // Update the quad points
                this.quad.end.x = adjustedX;
                this.quad.end.y = adjustedY;

                break;
            }

            //points.push(x, y);
            prevX = x;
            prevY = y;
        }

        return { oldPoints, newPoints: this.quad.toArray() };
    }

    updateEndpoint(oldPoint: Konva.Vector2d | ('start' | 'end'), newValue: Konva.Vector2d): void {
        if (oldPoint == 'start' || (typeof oldPoint === 'object' &&
            oldPoint.x === this.quad.start.x &&
            oldPoint.y === this.quad.start.y)
        ) {
            this.quad.start.x = newValue.x;
            this.quad.start.y = newValue.y;
        } else if (typeof oldPoint === 'object' &&
            oldPoint.x === this.quad.control.x &&
            oldPoint.y === this.quad.control.y
        ) {
            this.quad.control.x = newValue.x;
            this.quad.control.y = newValue.y;
        } else if (oldPoint == 'end' || (typeof oldPoint === 'object' &&
            oldPoint.x === this.quad.end.x &&
            oldPoint.y === this.quad.end.y
        )) {
            this.quad.end.x = newValue.x;
            this.quad.end.y = newValue.y;
        }

        // Update the shape based on the new quad points
        // this._shape.points(this.getPoints());
    }
}