import Konva from "konva";
import { UnscaleManager } from "../managers/unscale-manager";
import { BezierLineExt } from "../shape-ext/bezier-line-ext";
import { KonvaEditableText } from "../shape-ext/konva-editable-text";
// import { LineExt } from "../shape-ext/line-ext";
import { MeasurableShape } from "../shape-ext/measurable-shape";
import { Tool } from "./tool";
import { ToolHandler } from "./tool-handler";
import type { IDieEditor } from "../idie-editor";
import type { IFrame } from "konva/lib/types";
import { Line } from "../shape-ext/line";

export class DrawToolHandler extends ToolHandler {

    public static readonly ANIMATION_LAYER_NAME = "ANIMATION_LAYER";
    public static readonly GIZMO_LAYER_NAME = "GIZMO_LAYER";

    private isDrawing: boolean = false;
    private startingPoint?: Konva.Vector2d;
    private drawingLine?: MeasurableShape<Line | BezierLineExt>;

    public get isDrawingLine(): boolean { return this.editor.selectedTool == Tool.DRAW_LINE; }
    public get isDrawingCurve(): boolean { return this.editor.selectedTool == Tool.DRAW_CURVE; }

    // I memorize a reference only to optimize the animations
    declare private animationLayer?: Konva.Layer;
    declare private gizmoLayer?: Konva.Layer;
    private anim?: Konva.Animation;
    private animationTimer?: any;

    private unit: string = "mm";

    constructor(editor: IDieEditor) {
        super(editor, true);
        this.subscriptions.push(KonvaEditableText.onEdit.subscribe(() => {
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

    override selectionConditionsSatisfied(): { value: boolean, message?: string } {
        const polygon = this.editor.state.isPolygonCreated();
        return !polygon ? { value: true } : { value: false, message: "il poligono è stato creato; elimina qualche linea o modifica i vertici" }
    }

    protected override createLayers(): void {
        // const animationLayer = new Konva.Layer({
        //     name: DrawToolHandler.ANIMATION_LAYER_NAME
        // });
        // this.layers.push(animationLayer);
        // const gizmoLayer = new Konva.Layer({
        //     name: DrawToolHandler.GIZMO_LAYER_NAME
        // });
        // this.layers.push(gizmoLayer);

        const animationLayer = this.animationLayer = new Konva.Layer({
            name: DrawToolHandler.ANIMATION_LAYER_NAME
        });
        this.layers.push(animationLayer);
        const gizmoLayer = this.gizmoLayer = new Konva.Layer({
            name: DrawToolHandler.GIZMO_LAYER_NAME
        });
        this.layers.push(gizmoLayer);
    }

    override onMouseDown(event: Konva.KonvaEventObject<any>): void {
        if (KonvaEditableText.editing) return;

        const pos = this.getSnappingPoint();
        const hoverEndpoints = this.editor.state.getDrawingPoint(pos);
        if (!hoverEndpoints.canDraw) {
            this.startAnimationAvailablePoints();
            return;
        }
        console.log(this.gizmoLayer, this.layers);

        this.startingPoint = hoverEndpoints.vertex ?? pos;
        this.stopAnimationAvailablePoints();
        this.showGitzmoOnPointer(pos);
        this.isDrawing = true;
        //debugger;
        this.drawingLine = new MeasurableShape<any>(this.editor, pos, this.isDrawingLine ? Line : BezierLineExt);
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
        const newPoints = [this.startingPoint!.x, this.startingPoint!.y, pos.x, pos.y];
        this.drawingLine!.updatePoints(newPoints);
        pos.source == 'grid' ? this.clearGitzmos() : this.showGitzmoOnPointer(pos);

        super.onMouseMove(event);
    }

    override onMouseUp(event: Konva.KonvaEventObject<any>): void {
        super.onMouseUp(event);

        this.isDrawing = false;
        if (!this.drawingLine) return;

        this.clearGitzmos();
        const pos = this.getSnappingPoint();
        //const newPoints = [this.startingPoint!.x, this.startingPoint!.y, pos.x, pos.y];
        //this.drawingLine.updatePoints(newPoints);
        this.drawingLine.updateEndpoint('end', pos);

        if (this.drawingLine.getLength() > 0) {
            this.editor.state.addLine(this.drawingLine);
        } else {
            this.drawingLine.destroy();
        }

        this.drawingLine = undefined;
    }

    private startAnimationAvailablePoints(): void {
        this.stopAnimationAvailablePoints();

        const endpoints = this.editor.state.getEndPoints().map(e => {
            const circle = new Konva.Circle({
                x: e.x,
                y: e.y,
                radius: 20,
                stroke: '#00ff00',
                strokeWidth: 2,
            });
            UnscaleManager.getInstance()?.registerShape(circle);
            return circle;
        });
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
        UnscaleManager.getInstance()?.unregisterLayer(this.animationLayer);
        this.animationLayer?.clear();
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
        UnscaleManager.getInstance()?.registerShape(pointerCircle);
    }

    private clearGitzmos() {
        UnscaleManager.getInstance()?.unregisterLayer(this.gizmoLayer);

        this.gizmoLayer?.clear();
        this.gizmoLayer?.destroyChildren();
    }
}