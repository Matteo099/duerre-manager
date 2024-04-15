import Konva from "konva";
import { Point } from "./point";

export interface IQuad {
    start: Konva.Vector2d
    control: Konva.Vector2d
    end: Konva.Vector2d
    toArray(): number[];
}
export class Quad implements IQuad {
    public start: Point;
    public control: Point;
    public end: Point;

    constructor(start: Point | Konva.Vector2d, control: Point | Konva.Vector2d, end: Point | Konva.Vector2d) {
        this.start = Point.from(start); 
        this.control = Point.from(control); 
        this.end = Point.from(end); 
    }

    public toArray(): number[] {
        return [this.start.x, this.start.y, this.control.x, this.control.y, this.end.x, this.end.y];
    }
}