import Konva from "konva";
import { Subject } from 'rxjs';
import type { Point } from "../../math/point";
import type { IDieLine } from "../model/idie-line";
import type { ILiteEvent } from "../../event/ilite-event";

export type ShapeChanged = {};
export interface IExtendedShape<S extends Konva.Shape> {
    getPoints(): number[];
    setPoints(p: number[]): S;
    calculateLength(): number;
    calculateMiddlePoint(): Konva.Vector2d;
    calculatePointsGivenLength(length: number): { oldPoints: number[], newPoints: number[] };
    updateEndpoint(oldPoint: Point, newValue: Konva.Vector2d): void;
    getAnchorPoints(): Point[];
    getNearestPoint(pointer: Konva.Vector2d): Konva.Vector2d | undefined;
    computeCurvePoints<T extends number | Konva.Vector2d>(precision?: number): T[];
    toDieLine(): IDieLine;
    interpolatePoint(percentage: number): Konva.Vector2d;

    overrideEndPoint(point: Point): void;
    overrideStartPoint(point: Point): void;

    get onUpdateEndpoint(): ILiteEvent<ShapeChanged>
    get shape(): S;
}