import { EditorOrchestrator } from "@/model/editor/editor-orchestrator";
import { UnscaleManager } from "@/model/editor/managers/unscale-manager";
import Konva from "konva";
import type { Vector2d } from "konva/lib/types";
import type { ILiteEvent } from "../../event/ilite-event";
import { LiteEvent } from "../../event/lite-event";
import type { Point } from "../../math/point";
import type { IDieLine } from "../model/idie-line";
import type { IExtendedShape, N, ShapeChanged, V2 } from "./iextended-shape";

export type ExtendedShapeOpt = {
    initialPosition: Point | Konva.Vector2d,
    color?: string
}

export abstract class ExtendedShape<S extends Konva.Shape> implements IExtendedShape<S> {

    protected readonly _shape: S;
    protected readonly _onUpdateEndpoint: LiteEvent<ShapeChanged> = new LiteEvent();
    get shape(): S { return this._shape; }
    get onUpdateEndpoint(): ILiteEvent<ShapeChanged> { return this._onUpdateEndpoint.expose() }

    protected unscaleManager?: UnscaleManager;

    constructor(opts: Partial<ExtendedShapeOpt>) {
        this.unscaleManager = EditorOrchestrator.instance?.getManager(UnscaleManager);
        this._shape = this.createShape(opts);
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
    abstract calculateClientRect(): Konva.Vector2d & { width: number, height: number };
    abstract calculatePointsGivenLength(length: number): { oldPoints: number[], newPoints: number[] };
    abstract getAnchorPoints(): Point[];
    abstract computeCurvePoints<T extends number | Konva.Vector2d>(type: N | V2, precision?: number): T[];
    abstract getNearestPoint(pointer: Konva.Vector2d): Konva.Vector2d | undefined;
    abstract interpolatePoint(percentage: number): Vector2d;
    protected abstract createShape(opts: Partial<ExtendedShapeOpt>): S;

    public updateEndpoint(oldPoint: Point | ('start' | 'end'), newValue: Konva.Vector2d): void {
        this._onUpdateEndpoint.next({});
    }

    abstract toDieLine(): IDieLine;

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