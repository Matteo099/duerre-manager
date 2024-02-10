import Konva from "konva";

export interface IQuad {
    start: Konva.Vector2d
    control: Konva.Vector2d
    end: Konva.Vector2d
    toArray(): number[];
}
export class Quad implements IQuad {
    public readonly start: Konva.Vector2d;
    public readonly control: Konva.Vector2d;
    public readonly end: Konva.Vector2d;

    constructor(start: Konva.Vector2d, control: Konva.Vector2d, end: Konva.Vector2d) {
        this.start = start; 
        this.control = control; 
        this.end = end; 
    }

    public toArray(): number[] {
        return [this.start.x, this.start.y, this.control.x, this.control.y, this.end.x, this.end.y];
    }
}