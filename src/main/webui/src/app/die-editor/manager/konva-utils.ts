import Konva from "konva";
import { GridManager } from "./tools/grid-manager";

export class KonvaUtils {

    public static snapToGrid(pointer: Konva.Vector2d): Konva.Vector2d {

        // Calculate the offset based on the grid step size
        const gridOffset = {
            x: Math.round(pointer.x / GridManager.STEP_SIZE) * GridManager.STEP_SIZE,
            y: Math.round(pointer.y / GridManager.STEP_SIZE) * GridManager.STEP_SIZE,
        };

        return {
            x: gridOffset.x,
            y: gridOffset.y,
        };
    }

    public static lineToCoords(line: Konva.Line): { x1: number, y1: number, x2: number, y2: number } {
        const coords = line.points();
        return { x1: coords[0], y1: coords[1], x2: coords[2], y2: coords[3] };
    }

    public static calculateDistance(coords: { x1: number, y1: number, x2: number, y2: number }): number {
        return Math.sqrt(Math.pow(coords.x2 - coords.x1, 2) + Math.pow(coords.y2 - coords.y1, 2));
    }

    public static calculateAngle(coords: { x1: number, y1: number, x2: number, y2: number } | number[], degree: boolean = true): number {
        let points: { x1: number, y1: number, x2: number, y2: number };
        if (!('x1' in coords)) {
            points = { x1: coords[0], y1: coords[1], x2: coords[2], y2: coords[3] };
        } else {
            points = coords;
        }

        const angleRad = Math.atan2(points.y2 - points.y1, points.x2 - points.x1);
        if (degree) {
            let angleDeg = (angleRad * 180) / Math.PI;

            // Ensure the angle is positive
            if (angleDeg < 0) {
                angleDeg += 360;
            }

            return 360 - angleDeg;
        }
        return angleRad;
    }

    public static calculateLength(line: Konva.Line): number {
        const points = line.points();
        return KonvaUtils.calculateDistance({
            x1: points[0],
            y1: points[1],
            x2: points[points.length - 2],
            y2: points[points.length - 1]
        });
    }

    public static calculateMiddlePoint(line: Konva.Line): Konva.Vector2d {
        const points = line.points();
        return {
            x: points[0] - (points[0] - points[points.length - 2]) / 2,
            y: points[1] - (points[1] - points[points.length - 1]) / 2
        };
    }

    public static pointsVector2d(points: number[]): Konva.Vector2d[] {
        const v: Konva.Vector2d[] = [];
        for (let i = 0; i < points.length - 1; i += 2) {
            const x = points[i];
            const y = points[i + 1];
            v.push({ x, y });
        }
        return v;
    }

    public static findPoint(line: Konva.Line, distance: number): { x: number, y: number } {
        const points = KonvaUtils.lineToCoords(line);

        // Calculate the direction vector of the line
        const dx = points.x2 - points.x1;
        const dy = points.y2 - points.y1;

        // Calculate the length of the line segment
        const length = Math.sqrt(dx * dx + dy * dy);

        // Normalize the direction vector
        const normalizedDx = dx / length;
        const normalizedDy = dy / length;

        // Calculate the coordinates of the third point
        const x3 = points.x1 + normalizedDx * distance;
        const y3 = points.y1 + normalizedDy * distance;

        return { x: x3, y: y3 };
    }
}