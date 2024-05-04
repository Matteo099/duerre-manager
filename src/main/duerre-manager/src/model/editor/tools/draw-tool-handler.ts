import Konva from "konva";
import type { IFrame } from "konva/lib/types";
import type { EditorOrchestrator } from "../editor-orchestrator";
import { GenericToolHandler } from "./generic-tool-handler";
import { Tool } from "./tool";
import { VirtualLayer } from "../core/layer/virtual-layer";
import { MeasurableShape } from "../core/shape/wrappers/measurable-shape";
import { Line } from "../core/shape/line";
import { BezierLine } from "../core/shape/bezier-line";
import { EditableText } from "../core/shape/editable-text";
import { vec2DEquals } from "../core/math/vec2d";

export class DrawToolHandler extends GenericToolHandler {

    public static readonly ANIMATION_LAYER_NAME = "ANIMATION_LAYER";
    public static readonly GIZMO_LAYER_NAME = "GIZMO_LAYER";

    private isDrawing: boolean = false;
    private startingPoint?: Konva.Vector2d;
    private drawingLine?: MeasurableShape<Line | BezierLine>;

    public get isDrawingLine(): boolean { return this.editor.selectedTool == Tool.DRAW_LINE; }
    public get isDrawingCurve(): boolean { return this.editor.selectedTool == Tool.DRAW_CURVE; }

    // I memorize a reference only to optimize the animations
    declare private animationLayer?: VirtualLayer;
    declare private gizmoLayer?: VirtualLayer;
    private anim?: Konva.Animation;
    private animationTimer?: any;

    private unit: string = "mm";

    constructor(editor: EditorOrchestrator) {
        super(editor, true);

        this.subscriptions.push(EditableText.Edit.subscribe(() => {
            this.stopAnimationAvailablePoints();
            this.clearGitzmos();
        }));
    }

    override clear(): void {
        super.clear();

        this.stopAnimationAvailablePoints();
        this.clearGitzmos();
        this.drawingLine?.destroy();
        this.drawingLine = undefined;
        this.isDrawing = false;
        this.startingPoint = undefined;
    }

    override canBeUsed(): { value: boolean, message?: string } {
        const polygon = this.stateManager?.isDieCreated();
        return !polygon ? { value: true } : { value: false, message: "il poligono è stato creato; elimina qualche linea o modifica i vertici" }
    }

    protected override createLayers(): void {
        const animationLayer = this.animationLayer = new VirtualLayer(this.mainLayer, DrawToolHandler.ANIMATION_LAYER_NAME);
        this.layers.push(animationLayer);
        const gizmoLayer = this.gizmoLayer = new VirtualLayer(this.mainLayer, DrawToolHandler.GIZMO_LAYER_NAME);
        this.layers.push(gizmoLayer);
    }

    override onMouseDown(event: Konva.KonvaEventObject<any>): void {
        if (EditableText.editing) return;

        const pos = this.getSnappingPoint();
        const hoverEndpoints = this.stateManager?.getDrawingPoint(pos);
        if (!hoverEndpoints?.canDraw) {
            this.startAnimationAvailablePoints();
            return;
        }

        this.startingPoint = hoverEndpoints.vertex ?? pos;
        this.stopAnimationAvailablePoints();
        this.showGitzmoOnPointer(pos);
        this.isDrawing = true;
        this.drawingLine = new MeasurableShape<any>(this.editor, this.startingPoint, this.isDrawingLine ? Line : BezierLine);
        this.editor.layer.add(this.drawingLine.group);

        super.onMouseDown(event);
    }

    override onMouseMove(event: Konva.KonvaEventObject<any>): void {
        if (!this.isDrawing) {
            return;
        }

        // prevent scrolling on touch devices
        event.evt.preventDefault();
        const pos = this.getSnappingPoint();
        const newPoints = [this.startingPoint!.x, this.startingPoint!.y];
        if (this.drawingLine?.extShape instanceof BezierLine)
            newPoints.push(...this.getPerpendicularMiddlePoint(this.startingPoint!, pos, 100))
        newPoints.push(pos.x, pos.y);
        this.drawingLine!.updatePoints(newPoints);
        pos.source == 'grid' ? this.clearGitzmos() : this.showGitzmoOnPointer(pos);

        super.onMouseMove(event);
    }

    /**
     * 
     * @param A start point
     * @param B end point
     * @param distance to point C 
     * @returns point C that is perpendicular to segment AB and distant from it distance
     */
    private getPerpendicularMiddlePoint(A: Konva.Vector2d, B: Konva.Vector2d, distance: number): number[] {
        if (vec2DEquals(A, B)) {
            return [A.x, A.y + distance];
        }
        // Calculate the midpoint between A and B
        const midPoint = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };

        // Calculate the direction from A to B
        const direction = { x: B.x - A.x, y: B.y - A.y };

        // Calculate the perpendicular direction
        const perpendicularDirection = { x: -direction.y, y: direction.x };

        // Normalize the perpendicular direction
        const length = Math.sqrt(perpendicularDirection.x * perpendicularDirection.x + perpendicularDirection.y * perpendicularDirection.y);
        const normalizedPerpendicularDirection = { x: perpendicularDirection.x / length, y: perpendicularDirection.y / length };

        // Scale the normalized perpendicular direction by the distance
        const scaledDirection = { x: normalizedPerpendicularDirection.x * distance, y: normalizedPerpendicularDirection.y * distance };

        // Calculate and return point C
        const pointC = { x: midPoint.x + scaledDirection.x, y: midPoint.y + scaledDirection.y };
        return [pointC.x, pointC.y];
    }

    override onMouseUp(event: Konva.KonvaEventObject<any>): void {
        super.onMouseUp(event);

        this.isDrawing = false;
        if (!this.drawingLine) return;

        this.clearGitzmos();
        const pos = this.getSnappingPoint();
        const hoverEndpoints = this.stateManager?.getDrawingPoint(pos);
        console.log(hoverEndpoints);

        //const newPoints = [this.startingPoint!.x, this.startingPoint!.y, pos.x, pos.y];
        //this.drawingLine.updatePoints(newPoints);
        if (hoverEndpoints?.vertex)
            this.drawingLine.extShape.overrideEndPoint(hoverEndpoints.vertex);
        else this.drawingLine.updateEndpoint('end', pos);

        if (this.drawingLine.getLength() > 0 && !vec2DEquals(...this.drawingLine.extShape.getEndPoints())) {
            this.stateManager?.add(this.drawingLine);
        } else {
            this.unscaleManager?.unregisterObject(this.drawingLine.extShape.shape);
            this.drawingLine.destroy();
        }

        this.drawingLine = undefined;
    }

    private startAnimationAvailablePoints(): void {
        this.stopAnimationAvailablePoints();

        const endpoints = this.stateManager?.getEndpoints().map(e => {
            const circle = new Konva.Circle({
                x: e.x,
                y: e.y,
                radius: 20,
                stroke: '#00ff00',
                strokeWidth: 2,
            });
            this.unscaleManager?.registerShape(circle);
            return circle;
        }) ?? [];
        this.animationLayer?.add(...endpoints);
        const period = 750;
        this.anim = new Konva.Animation((frame?: IFrame) => {
            if (!frame) return;

            const scale = Math.sin((frame.time * 2 * Math.PI) / period) + 0.001;
            // scale x and y
            endpoints.forEach(e => e.scale({ x: scale, y: scale }));
        }, this.animationLayer);
        this.anim.start();

        this.animationTimer = setTimeout(() => this.stopAnimationAvailablePoints(), 1500);
    }

    private stopAnimationAvailablePoints(): void {
        clearTimeout(this.animationTimer);
        this.animationTimer = undefined;
        this.anim?.stop();
        this.anim = undefined;
        this.unscaleManager?.unregisterLayer(this.animationLayer);
        // this.animationLayer?.clear();
        this.animationLayer?.destroyChildren();
    }

    private showGitzmoOnPointer(pos: Konva.Vector2d) {
        this.clearGitzmos();
        const pointerCircle = new Konva.Circle({
            x: pos.x,
            y: pos.y,
            radius: 20,
            stroke: '#0000ff',
            strokeWidth: 3,
        });
        this.gizmoLayer?.add(pointerCircle);
        this.unscaleManager?.registerShape(pointerCircle);
    }

    private clearGitzmos() {
        this.unscaleManager?.unregisterLayer(this.gizmoLayer);

        // this.gizmoLayer?.clear();
        this.gizmoLayer?.destroyChildren();
    }
}