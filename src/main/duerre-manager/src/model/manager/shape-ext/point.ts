import type Konva from "konva";
import type { Vector2d } from "konva/lib/types";

export class Point implements Konva.Vector2d {

    private static latestId = 2;

    public readonly id: number = Point.latestId++;
    public x!: number;
    public y!: number;

    constructor(x: number, y: number);
    constructor(v: Konva.Vector2d);
    constructor(xOrV: number | Konva.Vector2d, y?: number) {
        if (typeof xOrV === 'number' && typeof y === 'number') this.set(xOrV, y);
        else this.set(xOrV as Vector2d)
    }

    set(x: number, y: number): void;
    set(v: Konva.Vector2d): void;
    set(xOrV: number | Konva.Vector2d, y?: number): void {
        if (typeof xOrV === 'number' && typeof y === 'number') {
            this.x = xOrV;
            this.y = y;
        } else {
            this.x = (xOrV as Konva.Vector2d).x;
            this.y = (xOrV as Konva.Vector2d).y;
        }
    }

    get(): number[] {
        return [this.x, this.y]
    }

    public equalsById(other: Point) {
        return other && other.id == this.id;
    }

    public equalsByVector(other: Point | Konva.Vector2d) {
        return other && other.x == this.x && other.y == this.y;
    }

    public static from(v: Point | Konva.Vector2d): Point {
        if (v instanceof Point) return v;
        return new Point(v.x, v.y);
    }
}