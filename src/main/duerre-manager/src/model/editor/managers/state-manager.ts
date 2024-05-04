import type Konva from "konva";
import { Point } from "../core/math/point";
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
import { MeasurableShape } from "../core/shape/wrappers/measurable-shape";
import { Line } from "../core/shape/line";
import { BezierLine } from "../core/shape/bezier-line";
import { toVec2DArray, vec2DEquals } from "../core/math/vec2d";
import { toast } from "vue3-toastify";
import Client from '@/plugins/http/openapi';

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


    public setup(): void { }

    public clear() {
        this.dieShape.clear();
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    public destroy(): void {
        this.clear();
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

    public getVertices() {
        return this.dieShape.getVertices();
    }

    public getVerticesExceptEndpoints() {
        return this.dieShape.getVerticesExceptEndpoints();
    }

    public findNearestVertex/*getNearestPolygonPoint*/(pointer: Konva.Vector2d, distanceTreshold?: number): NearestVertex | undefined {
        return this.dieShape.findNearestVertex(pointer, distanceTreshold);
    }

    public findNeighbors/*findShapesWithEndpoint*/(vertex: Konva.Vector2d | Point): IMeasurableShape[] {
        return this.dieShape.findNeighbors(vertex);
    }

    public findCutsConnectedTo(shape: Konva.Shape | Konva.Stage | Konva.Node): Konva.Shape[] | undefined {
        return this.dieShape.findCutsConnectedTo(shape)?.map(c => c.shape);
    }

    public save(): IDieShapeExport {
        const lines: IDieLine[] = [];
        const valid = this.isDieCreated();

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

    public load(die: IDieShapeImport | Client.Components.Schemas.DieData): boolean {
        if(!die.lines) return false;

        this.editor.clear();

        const points: Point[] = [];
        die.lines.forEach(l => {
            const vecs = toVec2DArray(l.points!);
            vecs.forEach(v => {
                const index = points.findIndex(p => p.equalsByVector(v))
                if (index == -1) {
                    points.push(Point.from(v));
                }
            })
        });
        console.log(points);

        die.lines.forEach(l => {
            if (l.type == 'line' || l.type == 'bezier') {
                const vecs = toVec2DArray(l.points!);
                const shapePoints: Point[] = vecs.map(v => points.find(p => p.equalsByVector(v))!);
                console.log(shapePoints);
                const drawingLine = new MeasurableShape<Line | BezierLine>(this.editor, { x: 0, y: 0 }, l.type == 'line' ? Line : BezierLine);
                drawingLine.updatePoints(l.points!);
                drawingLine.extShape.overrideStartPoint(shapePoints[0]);
                drawingLine.extShape.overrideEndPoint(shapePoints[2] ?? shapePoints[1]);
                this.editor.layer.add(drawingLine.group);
                this.add(drawingLine);
            }
        });

        let cutLineLoadError = false;
        die.lines.forEach(l => {
            if (l.type == 'cut') {
                const [startPoint, endPoint] = toVec2DArray(l.points!);
                const startPointShape = this.findNearestVertex(startPoint);
                const endPointShape = this.findNearestVertex(endPoint);
                if (!startPointShape?.shape || !endPointShape?.shape) {
                    cutLineLoadError = true;
                } else {
                    const cut = new CutLine({ initialPosition: startPoint, color: "#00FFCC" }, startPointShape.shape);
                    cut.updateEndpoint('end', endPoint);
                    cut.setEndPointShape(endPointShape.shape);
                    this.add(cut);
                    this.editor.layer.add(cut.shape);
                }
            }
        });
        if (cutLineLoadError)
            toast.error("Impossibile caricare correttamente lo stampo. I dati sono incompleti o corrotti... (invalid cut lines)")
    
        
        const valid = this.isDieCreated();
        return valid;
    }
}