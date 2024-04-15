import Konva from "konva";
import { Point } from "./point";

export interface IQuad {
    start: Konva.Vector2d
    control: Konva.Vector2d
    end: Konva.Vector2d
    toArray(): number[];
}
export class Quad implements IQuad {
    public readonly start: Point;
    public readonly control: Point;
    public readonly end: Point;

    constructor(start: Konva.Vector2d, control: Konva.Vector2d, end: Konva.Vector2d) {
        this.start = Point.from(start); 
        this.control = Point.from(control); 
        this.end = Point.from(end); 
    }

    public toArray(): number[] {
        return [this.start.x, this.start.y, this.control.x, this.control.y, this.end.x, this.end.y];
    }
}