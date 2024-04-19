import type Konva from "konva";
import type { Point } from "../core/math/point";
import { CutLine } from "../core/shape/cut-line";
import { DieShape, type NearestVertex } from "../core/shape/die-shape";
import type { IDieShapeExport } from "../core/shape/model/idie-shape-export";
import type { IDieShapeImport } from "../core/shape/model/idie-shape-import";
import type { IMeasurableShape, LengthChanged } from "../core/shape/wrappers/imeasurable-shape";
import type { EditorOrchestrator } from "../editor-orchestrator";
import { EManager } from "./emanager";
import { GenericManager } from "./generic-manager";
import type { EventSubscription } from "../core/event/lite-event";
import type { IDieLine } from "../core/shape/model/idie-line";

export class StateManager extends GenericManager {

    public readonly dieShape: DieShape = new DieShape();
    private readonly subscriptions: EventSubscription[] = [];

    // TODO: to remove?
    // There should not be used...
    private computedPoints: Konva.Vector2d[] = [];
    private computePointsRequired = true;

    constructor(editor: EditorOrchestrator) {
        super(editor, EManager.STATE);
    }

    public add(line: IMeasurableShape | CutLine) {
        if (line instanceof CutLine) {
            this.dieShape.addCut(line);
        } else {
            this.dieShape.add(line);
            const subscription = line.onLengthChanged.subscribe((v: LengthChanged) => {
                const attachedLine = this.findNeighbors(v.oldPoint).filter(s => s.getId() != line.getId())[0];
                attachedLine?.updateEndpoint(v.oldPoint, v.newPoint);
            });
            this.subscriptions.push(subscription);
            this.computePointsRequired = true;
        }
    }

    public remove(line?: Konva.Shape | Konva.Stage | Konva.Node) {
        const node = this.dieShape.remove(line)
        if (!(node instanceof CutLine)) this.computePointsRequired = true
    }

    /**
     * Checks if it is possible to draw (meaning, if you can add new lines), and then checks if there is a vertex on the passed position
     * @param pos 
     * @returns an object that specify if you can draw new line and the vertex
     */
    public getDrawingPoint(pointer: Konva.Vector2d): { vertex?: Point, canDraw: boolean } {
        if (this.dieShape.hasLines()) {
            const endpoints = this.dieShape.getVertices();
            const vertex = endpoints.find(v => v.equalsByVector(pointer));
            return { vertex, canDraw: !!vertex }
        }
        return { canDraw: true }
    }

    public isDieCreated/*isPolygonCreated*/(): boolean {
        return this.dieShape.hasLines() && this.dieShape.getAvailableEndpoints().length == 0;
    }

    public getEndpoints() {
        return this.dieShape.getAvailableEndpoints();
    }

    public findNearestVertex/*getNearestPolygonPoint*/(pointer: Konva.Vector2d, distanceTreshold?: number): NearestVertex {
        return this.dieShape.findNearestVertex(pointer, distanceTreshold);
    }

    public findNeighbors/*findShapesWithEndpoint*/(vertex: Konva.Vector2d | Point): IMeasurableShape[] {
        return this.dieShape.findNeighbors(vertex);
    }

    public save(): IDieShapeExport {
        const lines: IDieLine[] = [];
        const valid = true;

        const orderedLines: IMeasurableShape[] = [];
        const allLinesCopy = [...this.dieShape.lines];
        const allCutsCopy = [...this.dieShape.cuts];
        let i = 0;

        // Order the lines so that it generates an array of contigous lines
        while (allLinesCopy.length > 0) {
            const currentLine = allLinesCopy[i];
            if (orderedLines.length === 0 || currentLine.hasCommonEndPointWith(orderedLines[orderedLines.length - 1])) {
                orderedLines.push(currentLine);
                allLinesCopy.splice(i, 1);
                i = 0;
            } else {
                i++;
            }
        }

        for (const line of orderedLines)
            lines.push(line.extShape.toDieLine());
        for (const cut of allCutsCopy)
            lines.push(cut.toDieLine());

        return { lines, valid };
    }

    public load(die: IDieShapeImport): void {

    }

    public clear() {
        this.dieShape.clear();
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    public setup(): void { }

    public destroy(): void {
        this.clear();
    }

}