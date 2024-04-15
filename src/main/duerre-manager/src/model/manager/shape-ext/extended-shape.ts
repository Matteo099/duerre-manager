import Konva from "konva";
import type { IExtendedShape, ShapeChanged } from "./iextended-shape";
import type { IDieDataShapeDao } from "../models/idie-data-shape-dao";
import type { Vector2d } from "konva/lib/types";
import { Subject } from "rxjs";
import type { Point } from "./point";

export abstract class ExtendedShape<S extends Konva.Shape> implements IExtendedShape<S> {

    protected readonly _shape: S;
    protected readonly _onUpdateEndpoint: Subject<ShapeChanged> = new Subject();
    get shape(): S { return this._shape; }
    get onUpdateEndpoint(): Subject<ShapeChanged> { return this._onUpdateEndpoint }

    constructor(position: Point | Konva.Vector2d) {
        this._shape = this.createShape(position);
    }

    getId(): number {
        return this.shape._id;
    }

    abstract getEndPoints(): Point[]
    abstract overrideStartPoint(point: Point): void;
    abstract overrideEndPoint(point: Point): void;
    abstract getPoints(): number[];
    abstract setPoints(p: number[]): S;
    /**
     * Return the length of the shape; the unit of measure is decimeter of millimiters (mm⁻¹)
     */
    abstract calculateLength(): number;
    abstract calculateMiddlePoint(): Konva.Vector2d;
    abstract calculateClientRect(): Konva.Vector2d & {width: number, height: number};
    abstract calculatePointsGivenLength(length: number): { oldPoints: number[], newPoints: number[] };
    abstract getAnchorPoints(): Point[];
    abstract computeCurvePoints<T extends number | Konva.Vector2d>(precision?: number): T[];
    abstract getNearestPoint(pointer: Konva.Vector2d): Konva.Vector2d | undefined;
    abstract interpolatePoint(percentage: number): Vector2d;
    protected abstract createShape(initialPosition: Point | Konva.Vector2d): S;
    
    public updateEndpoint(oldPoint: Point | ('start' | 'end'), newValue: Konva.Vector2d): void{
        this._onUpdateEndpoint.next({});
    }
    
    abstract toDieDataShape(): IDieDataShapeDao;

    protected calculateClientRectGivenPoints(points: number[]): Konva.Vector2d & { width: number; height: number; } {
        let i = 0;
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        points.forEach(p => {
            if (i++ % 2 == 0) {
                minX = Math.min(minX, p);
                maxX = Math.max(maxX, p);
            } else {
                minY = Math.min(minY, p);
                maxY = Math.max(maxY, p);
            }
        })
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        }
    }
}