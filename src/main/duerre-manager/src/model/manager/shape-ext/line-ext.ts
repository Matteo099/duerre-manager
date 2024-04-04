import Konva from "konva";
import { KonvaUtils } from "../konva-utils";
import { UnscaleManager } from "../managers/unscale-manager";
import type { IDieDataShapeDao } from "../models/idie-data-shape-dao";
import { ExtendedShape } from "./extended-shape";

export class LineExt extends ExtendedShape<Konva.Line> {

    protected override createShape(position: Konva.Vector2d): Konva.Line {
        const line = new Konva.Line({
            stroke: '#df4b26',
            strokeWidth: 5,
            globalCompositeOperation: 'source-over',
            // round cap for smoother lines
            lineCap: 'round',
            lineJoin: 'round',
            hitStrokeWidth: 20,
            // add point twice, so we have some drawings even on a simple click
            points: [position.x, position.y, position.x, position.y],
        });
        UnscaleManager.getInstance()?.registerShape(line);
        return line;
    }

    override getEndPoints(): Konva.Vector2d[] {
        return KonvaUtils.pointsVector2d(this.getPoints());
    }

    override getAnchorPoints(): Konva.Vector2d[] {
        return this.getEndPoints();
    }

    override toDieDataShape(): IDieDataShapeDao {
        return {
            type: 'line',
            points: this.getPoints()
        };
    }

    override computeCurvePoints<T extends number | Konva.Vector2d>(precision: number = 10): T[] {
        const points: T[] = [];
        const [A, B] = KonvaUtils.pointsVector2d(this.getPoints());

        for (let i = 0; i <= precision; i++) {
            const t = i / precision;
            const x = A.x + (B.x - A.x) * t;
            const y = A.y + (B.y - A.y) * t;

            if (typeof points[0] === 'number') {
                points.push(x as T, y as T);
            } else {
                points.push({ x, y } as T);
            }
        }

        return points;
    }


    override getNearestPoint(pointer: Konva.Vector2d): Konva.Vector2d | undefined {
        const [A, B] = KonvaUtils.pointsVector2d(this.getPoints());
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

    getPoints(): number[] {
        return this._shape.points();
    }

    setPoints(p: number[]): Konva.Line {
        return this._shape.points(p);
    }

    calculateLength(): number {
        return KonvaUtils.calculateLength(this._shape);
    }

    calculateMiddlePoint(): Konva.Vector2d {
        return KonvaUtils.calculateMiddlePoint(this._shape);
    }

    calculatePointsGivenLength(length: number): { oldPoints: number[], newPoints: number[] } {
        const point = KonvaUtils.findPoint(this._shape, length);
        const oldPoints = this._shape.points();
        const newPoints = [...oldPoints];
        newPoints[newPoints.length - 2] = point.x;
        newPoints[newPoints.length - 1] = point.y;
        return { oldPoints, newPoints };
    }

    updateEndpoint(oldPoint: Konva.Vector2d | ('start' | 'end'), newValue: Konva.Vector2d): void {
        const coords = KonvaUtils.lineToCoords(this._shape);
        if (oldPoint == 'start' || (typeof oldPoint === 'object' && coords.x1 == oldPoint.x && coords.y1 == oldPoint.y)) {
            this.setPoints([
                newValue.x, newValue.y, coords.x2, coords.y2
            ]);
        } else if (oldPoint == 'end' || (typeof oldPoint === 'object' && coords.x2 == oldPoint.x && coords.y2 == oldPoint.y)) {
            this.setPoints([
                coords.x1, coords.y1, newValue.x, newValue.y
            ]);
        }
    }

    override calculateClientRect(): Konva.Vector2d & { width: number; height: number; } {
        return super.calculateClientRectGivenPoints(this.getPoints());
    }
}
