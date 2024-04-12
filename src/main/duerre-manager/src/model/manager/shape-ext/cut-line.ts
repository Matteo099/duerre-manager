import type Konva from "konva";
import type { IMeasurableShape } from "./imeasurable-shape";
import { LineExt } from "./line-ext";

export class CutLine extends LineExt {
    private startPointShape?: IMeasurableShape;
    private endPointShape?: IMeasurableShape;

    private startPointPercentage: number = 0;
    private endPointPercentage: number = 0;

    public calculatePointsPercentage() {
        const endpoints = this.getEndPoints();
        this.startPointPercentage = this.calculatePointPercentage(endpoints[0], this.startPointShape)
        this.endPointPercentage = this.calculatePointPercentage(endpoints[1], this.endPointShape)
    }

    private calculatePointPercentage(point: Konva.Vector2d, pointShape?: IMeasurableShape): number {
        const endpoints = pointShape?.getAnchorPoints()
        if (!endpoints) return 0;

        if (endpoints.length == 2) {
            // line
            return this.calculateLinePercentage(endpoints[0], endpoints[1], point);
        } else {
            // bezier line
            return this.calculateBezierPercentage(endpoints[0], endpoints[1], endpoints[2], point);
        }
    }

    private calculateLinePercentage(A: Konva.Vector2d, B: Konva.Vector2d, C: Konva.Vector2d): number {
        // Calculate the distance between points A and C, and between points A and B
        const distanceAC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
        const distanceAB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));

        // Calculate the percentage
        return distanceAC / distanceAB;
    }

    // TODO: complete the method...
    private calculateBezierPercentage(start: Konva.Vector2d, end: Konva.Vector2d, control: Konva.Vector2d, D: Konva.Vector2d): number {
        const numberOfPoints = 100;
        let distanceAC = 0;
        let distanceAB = 0;
        let length = 0;

        for (let i = 0; i < numberOfPoints; i++) {
            const t1 = i / numberOfPoints;
            const t2 = (i + 1) / numberOfPoints;
            const t = (t1 + t2) / 2;

            const derivativeX = 2 * (1 - t) * (control.x - start.x) + 2 * t * (end.x - control.x);
            const derivativeY = 2 * (1 - t) * (control.y - start.y) + 2 * t * (end.y - control.y);
            const dLength = Math.sqrt(derivativeX ** 2 + derivativeY ** 2);

            length += dLength * (t2 - t1);
        }

        return distanceAC / distanceAB;
    }
}