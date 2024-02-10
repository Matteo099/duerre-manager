import Konva from "konva";
import { IExtendedShape } from "./iextended-shape";

export abstract class ExtendedShape<S extends Konva.Shape> implements IExtendedShape<S> {
    protected readonly _shape: S;
    get shape(): S { return this._shape; }

    constructor(position: Konva.Vector2d) {
        this._shape = this.createShape(position);
    }

    getId(): number {
        return this.shape._id;
    }

    abstract getEndPoints(): Konva.Vector2d[]
    abstract getPoints(): number[];
    abstract setPoints(p: number[]): S;
    abstract calculateLength(): number;
    abstract calculateMiddlePoint(): Konva.Vector2d;
    abstract calculatePointsGivenLength(length: number): { oldPoints: number[], newPoints: number[] };
    abstract updateEndpoint(oldPoint: Konva.Vector2d | ('start' | 'end'), newValue: Konva.Vector2d): void;

    protected abstract createShape(initialPosition: Konva.Vector2d): S;
}