import type Konva from "konva";
import type { IMeasurableShape } from "./wrappers/imeasurable-shape";
import { Line } from "./line";
import { vec2DDistance } from "../math/vec2d";
import type { EventSubscription } from "../event/lite-event";
import type { ExtendedShapeOpt } from "./wrappers/extended-shape";

export class CutLine extends Line {
    private startPointShape?: IMeasurableShape;
    private startPointShapeOnUpdateSub?: EventSubscription;
    private endPointShape?: IMeasurableShape;
    private endPointShapeOnUpdateSub?: EventSubscription;

    private startPointPercentage: number = 0;
    private endPointPercentage: number = 0;

    constructor(opts: Partial<ExtendedShapeOpt>, startPointShape: IMeasurableShape) {
        super(opts);
        this.setStartPointShape(startPointShape);
    }

    public setStartPointShape(startPointShape: IMeasurableShape) {
        this.startPointShapeOnUpdateSub?.unsubscribe();
        this.startPointShape = startPointShape;
        this.startPointShapeOnUpdateSub = this.startPointShape.extShape.onUpdateEndpoint.subscribe(_ => this.updateCutLine());
    }
    public getStartPointShape() { return this.startPointShape; }

    public setEndPointShape(endPointShape: IMeasurableShape) {
        this.endPointShapeOnUpdateSub?.unsubscribe();
        this.endPointShape = endPointShape;
        this.endPointShapeOnUpdateSub = this.endPointShape.extShape.onUpdateEndpoint.subscribe(_ => this.updateCutLine());
    }

    public getEndPointShape() { return this.endPointShape; }

    public calculatePointsPercentage() {
        const endpoints = this.getEndPoints();
        this.startPointPercentage = this.calculatePointPercentage(endpoints[0], this.startPointShape)
        this.endPointPercentage = this.calculatePointPercentage(endpoints[1], this.endPointShape)
        console.log("calculatePointsPercentage", this);
    }

    private calculatePointPercentage(point: Konva.Vector2d, pointShape?: IMeasurableShape): number {
        const endpoints = pointShape?.getAnchorPoints()
        if (!endpoints) return 0;

        if (endpoints.length == 2) {
            // line
            return this.calculateLinePercentage(endpoints[0], endpoints[1], point);
        } else {
            // bezier line
            return this.calculateBezierPercentage(pointShape!, point);
        }
    }

    private calculateLinePercentage(A: Konva.Vector2d, B: Konva.Vector2d, C: Konva.Vector2d): number {
        // Calculate the distance between points A and C, and between points A and B
        const distanceAC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
        const distanceAB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));

        // Calculate the percentage
        return distanceAC / distanceAB;
    }

    private calculateBezierPercentage(bezieLine: IMeasurableShape, point: Konva.Vector2d): number {
        const points = bezieLine.extShape.computeCurvePoints<Konva.Vector2d>();
        for (let i = 0; i < points.length; i++) {
            const bp = points[i];
            if (bp.x == point.x && bp.y == point.y) {
                return i / points.length;
            }
        }

        let min = Infinity;
        let minI = 0;
        for (let i = 0; i < points.length; i++) {
            const bp = points[i];
            const d = vec2DDistance(bp, point);
            if (d < min) {
                min = d;
                minI = i;
            }
        }
        return minI / points.length;
    }

    updateCutLine(): void {
        const A = this.startPointShape?.extShape?.interpolatePoint(this.startPointPercentage);
        if (A) this.updateEndpoint("start", A)

        const B = this.endPointShape?.extShape?.interpolatePoint(this.endPointPercentage);
        if (B) this.updateEndpoint("end", B)
    }
}