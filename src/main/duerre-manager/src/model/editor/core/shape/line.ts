import Konva from "konva";
import { Point } from "../math/point";
import { ExtendedShape, type ExtendedShapeOpt } from "./wrappers/extended-shape";
import type { IDieLine } from "./model/idie-line";
import { lengthOf, middlePointOf, pointOf } from "../math/vec2d";
import { ERASABLE } from "../constants";
import type { N, V2 } from "./wrappers/iextended-shape";

export class Line extends ExtendedShape<Konva.Line> {

    declare startPoint: Point;
    declare endPoint: Point;

    protected override createShape(opts: Partial<ExtendedShapeOpt>): Konva.Line {
        const position = opts.initialPosition!;
        const line = new Konva.Line({
            stroke: opts.color ?? '#df4b26',
            strokeWidth: 5,
            globalCompositeOperation: 'source-over',
            // round cap for smoother lines
            lineCap: 'round',
            lineJoin: 'round',
            hitStrokeWidth: 20,
            // add point twice, so we have some drawings even on a simple click
            points: [position.x, position.y, position.x, position.y],
        });
        this.unscaleManager?.registerShape(line);
        this.startPoint = Point.from(position);
        this.endPoint = new Point(position);
        return line;
    }

    overrideStartPoint(point: Point) {
        this.startPoint = point
        this._shape.points([...this.startPoint.get(), ...this.endPoint.get()])
    }

    setStartPoint(point: Konva.Vector2d) {
        this.startPoint.set(point.x, point.y);
        this._shape.points([...this.startPoint.get(), ...this.endPoint.get()])
    }

    overrideEndPoint(point: Point) {
        this.endPoint = point
        this._shape.points([...this.startPoint.get(), ...this.endPoint.get()])
    }

    setEndPoint(point: Konva.Vector2d) {
        this.endPoint.set(point.x, point.y);
        this._shape.points([...this.startPoint.get(), ...this.endPoint.get()])
    }

    override getEndPoints(): Point[] {
        return [this.startPoint, this.endPoint]
    }

    override getAnchorPoints(): Point[] {
        return this.getEndPoints();
    }

    override toDieLine(): IDieLine {
        return {
            type: 'line',
            points: this.getPoints()
        };
    }

    override computeCurvePoints<T extends number | Konva.Vector2d>(type: N | V2, precision: number = 10): T[] {
        const points: T[] = [];
        const [A, B] = [this.startPoint, this.endPoint];

        for (let i = 0; i <= precision; i++) {
            const t = i / precision;
            const x = A.x + (B.x - A.x) * t;
            const y = A.y + (B.y - A.y) * t;

            if (typeof type === 'number') {
                points.push(x as T, y as T);
            } else {
                points.push({ x, y } as T);
            }
        }

        return points;
    }


    override getNearestPoint(pointer: Konva.Vector2d): Konva.Vector2d | undefined {
        const [A, B] = [this.startPoint, this.endPoint];
        const AP = { x: pointer.x - A.x, y: pointer.y - A.y };
        const AB = { x: B.x - A.x, y: B.y - A.y };
        const magnitudeAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
        const ABunit = { x: AB.x / magnitudeAB, y: AB.y / magnitudeAB };
        const dotProduct = AP.x * ABunit.x + AP.y * ABunit.y;

        if (dotProduct <= 0) return A;
        if (dotProduct >= magnitudeAB) return B;

        const nearest = {
            x: A.x + ABunit.x * dotProduct,
            y: A.y + ABunit.y * dotProduct
        };
        return nearest;
    }

    override interpolatePoint(percentage: number): Konva.Vector2d {
        const [A, B] = [this.startPoint, this.endPoint];
        const x = A.x + (B.x - A.x) * percentage;
        const y = A.y + (B.y - A.y) * percentage;
        return { x, y };
    }

    getPoints(): number[] {
        return this._shape.points();
    }

    setPoints(p: number[]): Konva.Line {
        this.startPoint.set(p[0], p[1])
        this.endPoint.set(p[2], p[3])
        return this._shape.points(p);
    }

    calculateLength(): number {
        return lengthOf(this._shape);
    }

    calculateMiddlePoint(): Konva.Vector2d {
        return middlePointOf(this._shape);
    }

    calculatePointsGivenLength(length: number): { oldPoints: number[], newPoints: number[] } {
        const point = pointOf(this._shape, length);
        const oldPoints = this._shape.points();
        const newPoints = [...oldPoints];
        newPoints[newPoints.length - 2] = point.x;
        newPoints[newPoints.length - 1] = point.y;
        return { oldPoints, newPoints };
    }

    updateEndpoint(oldPoint: Point | ('start' | 'end'), newValue: Konva.Vector2d): void {
        console.log("updateEndpoint BEFORE", this.getPoints(), this.getId(), oldPoint, newValue)
        if (oldPoint == 'start') {
            this.setStartPoint(newValue);
        } else if (oldPoint == 'end') {
            this.setEndPoint(newValue);
        } else {
            this.getEndPoints().find(p => p.equalsById(oldPoint))?.set(newValue);
            this._shape.points([...this.startPoint.get(), ...this.endPoint.get()])
        }
        console.log("updateEndpoint AFTER", this.getPoints(), this.getId())

        super.updateEndpoint(oldPoint, newValue);
    }

    override calculateClientRect(): Konva.Vector2d & { width: number; height: number; } {
        return super.calculateClientRectGivenPoints(this.getPoints());
    }
}
