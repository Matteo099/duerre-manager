import Konva from "konva";
import { KonvaUtils } from "../konva-utils";
import { ExtendedShape } from "./extended-shape";
import { DieDataShapeDao } from "../../../models/dao/die-data-shape-dao";

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
        return line;
    }

    override getEndPoints(): Konva.Vector2d[] {
        return KonvaUtils.pointsVector2d(this.getPoints());
    }
    
    override getAnchorPoints(): Konva.Vector2d[] {
        return this.getEndPoints();
    }

    override toDieDataShape(): DieDataShapeDao {
        // TODO
        throw new Error("Method not implemented.");
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
}
