import Konva from "konva";
import { UnscaleFunction } from "../../managers/unscale-manager";
import { REMOVE_ONLY } from "../constants";
import type { Point } from "../math/point";
import { Quad } from "../math/quad";
import type { IDieLine } from "./model/idie-line";
import { ExtendedShape, type ExtendedShapeOpt } from "./wrappers/extended-shape";
import { N, V2 } from "./wrappers/iextended-shape";

export class BezierLine extends ExtendedShape<Konva.Shape> {

    declare public quad: Quad;
    declare public quadLinePath?: Konva.Line;
    private readonly numberOfPoints: number = 100;

    protected override createShape(opts: Partial<ExtendedShapeOpt>): Konva.Shape {
        const position = opts.initialPosition!;
        this.quad = new Quad(position,
            { x: position.x, y: position.y + 50 },
            { x: position.x, y: position.y });

        const bezierLine = new Konva.Shape({
            stroke: opts.color ?? '#df4b26',
            strokeWidth: 5,
            globalCompositeOperation: 'source-over',
            // round cap for smoother lines
            lineCap: 'round',
            lineJoin: 'round',
            hitStrokeWidth: 20,
            sceneFunc: (ctx, shape) => {
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
        this.unscaleManager?.registerShape(bezierLine);

        this.quadLinePath = new Konva.Line({
            dash: [10, 10, 0, 10],
            strokeWidth: 3,
            stroke: 'black',
            lineCap: 'round',
            id: 'quadLinePath',
            opacity: 0.3,
            points: [0, 0],
        });
        this.quadLinePath.setAttr(REMOVE_ONLY, true);
        this.unscaleManager?.registerShape(this.quadLinePath, UnscaleFunction.unscaleDash);

        return bezierLine;
    }

    override getAnchorPoints(): Point[] {
        return [...this.getEndPoints(), this.quad.control];
    }

    override toDieLine(): IDieLine {
        return {
            type: 'bezier',
            points: this.getPoints()
        };
    }

    override interpolatePoint(percentage: number): Konva.Vector2d {
        const { start, end, control } = this.quad;
        const t = percentage; // Assuming percentage is already in the range [0, 1]
        const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
        const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
        return { x, y };
    }

    getEndPoints(): Point[] {
        return [this.quad.start, this.quad.end];
    }

    overrideStartPoint(point: Point) {
        this.quad.start = point
    }

    setStartPoint(point: Konva.Vector2d) {
        this.quad.start.set(point.x, point.y);
    }

    overrideEndPoint(point: Point) {
        this.quad.end = point
    }

    setEndPoint(point: Konva.Vector2d) {
        this.quad.end.set(point.x, point.y);
    }

    getPoints(): number[] {
        return [
            this.quad.start.x,
            this.quad.start.y,
            this.quad.control.x,
            this.quad.control.y,
            this.quad.end.x,
            this.quad.end.y,
        ];
    }

    public computeCurvePoints<T extends number | Konva.Vector2d>(type: N | V2, precision?: number): T[] {
        const points: T[] = [];
        precision ??= this.numberOfPoints;
        for (let t = 0; t <= 1; t += 1 / precision) {
            const x = Math.pow(1 - t, 2) * this.quad.start.x + 2 * (1 - t) * t * this.quad.control.x + t * t * this.quad.end.x;
            const y = Math.pow(1 - t, 2) * this.quad.start.y + 2 * (1 - t) * t * this.quad.control.y + t * t * this.quad.end.y;

            if (typeof type === 'number') {
                points.push(x as T, y as T);
            } else {
                points.push({ x, y } as T);
            }
        }

        return points;
    }

    override getNearestPoint(pointer: Konva.Vector2d): Konva.Vector2d | undefined {
        let nearest: Konva.Vector2d | undefined;
        let minDistanceSquared = Infinity;
        const points = this.computeCurvePoints<Konva.Vector2d>(V2);
        points.forEach((point: Konva.Vector2d) => {
            const distanceSquared = Math.pow(point.x - pointer.x, 2) + Math.pow(point.y - pointer.y, 2);
            if (distanceSquared < minDistanceSquared) {
                minDistanceSquared = distanceSquared;
                nearest = point;
            }
        })

        return nearest;
    }

    // public getCurvePoints(precision?: number): number[] {
    //     const points: number[] = [];
    //     precision ??= this.numberOfPoints;
    //     for (let t = 0; t <= 1; t += 1 / precision) {
    //         const x = Math.pow(1 - t, 2) * this.quad.start.x + 2 * (1 - t) * t * this.quad.control.x + t * t * this.quad.end.x;
    //         const y = Math.pow(1 - t, 2) * this.quad.start.y + 2 * (1 - t) * t * this.quad.control.y + t * t * this.quad.end.y;
    //         points.push(x, y);
    //     }
    //     return points;
    // }

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
        this.updateDottedLines();
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

    protected calculateLineLength(t: number) {
        const derivativeX = 2 * (1 - t) * (this.quad.control.x - this.quad.start.x) + 2 * t * (this.quad.end.x - this.quad.control.x);
        const derivativeY = 2 * (1 - t) * (this.quad.control.y - this.quad.start.y) + 2 * t * (this.quad.end.y - this.quad.control.y);
        return Math.sqrt(derivativeX ** 2 + derivativeY ** 2);
    }

    calculateMiddlePoint(): Konva.Vector2d {
        const t = 0.5; // middle point

        const x = (Math.pow(1 - t, 2) * this.quad.start.x + 2 * (1 - t) * t * this.quad.control.x + t * t * this.quad.end.x) || 0;
        const y = (Math.pow(1 - t, 2) * this.quad.start.y + 2 * (1 - t) * t * this.quad.control.y + t * t * this.quad.end.y) || 0;

        return { x, y };
    }

    calculatePointsGivenLength(length: number): { oldPoints: number[], newPoints: number[] } {
        // No implemetation... => too expensive (moreover, maybe, this feature is not required) 
        return { oldPoints: this.quad.toArray(), newPoints: this.quad.toArray() };
    }

    updateEndpoint(oldPoint: Point | ('start' | 'end' | 'control'), newValue: Konva.Vector2d): void {
        if (oldPoint == 'start') {
            this.quad.start.x = newValue.x;
            this.quad.start.y = newValue.y;
        } else if (oldPoint == 'end') {
            this.quad.end.x = newValue.x;
            this.quad.end.y = newValue.y;
        } else if (oldPoint == 'control') {
            this.quad.control.x = newValue.x;
            this.quad.control.y = newValue.y;
        } else {
            this.getAnchorPoints().find(p => p.equalsById(oldPoint))?.set(newValue);
        }

        this.updateDottedLines();
        super.updateEndpoint(oldPoint as any, newValue);
    }

    public isControlPoint(vector: Konva.Vector2d) {
        return vector.x === this.quad.control.x && vector.y === this.quad.control.y;
    }

    public updateDottedLines(): void {
        this.quadLinePath?.points(this.getPoints());
    }

    override calculateClientRect(): Konva.Vector2d & { width: number; height: number; } {
        return super.calculateClientRectGivenPoints(this.computeCurvePoints<number>(N));
    }
}