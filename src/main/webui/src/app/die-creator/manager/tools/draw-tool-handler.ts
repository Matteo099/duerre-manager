import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { IFrame } from "konva/lib/types";
import { IDieEditor } from "../idie-editor";
import { KonvaEditableText } from "../shape-ext/konva-editable-text";
import { Tool } from "./tool";
import { ToolHandler } from "./tool-handler";
import { LineExt } from "../shape-ext/line-ext";
import { BezierLineExt } from "../shape-ext/bezier-line-ext";
import { MeasurableShape } from "../shape-ext/measurable-shape";

export class DrawToolHandler extends ToolHandler {

    public static readonly ANIMATION_LAYER_NAME = "ANIMATION_LAYER";
    public static readonly GIZMO_LAYER_NAME = "GIZMO_LAYER";

    private isDrawing: boolean = false;
    private startingPoint?: Konva.Vector2d;
    private drawingLine?: MeasurableShape<LineExt | BezierLineExt>;

    public get isDrawingLine(): boolean { return this.editor.selectedTool == Tool.DRAW_LINE; }
    public get isDrawingCurve(): boolean { return this.editor.selectedTool == Tool.DRAW_CURVE; }

    // I memorize a reference only to optimize the animations
    private animationLayer?: Konva.Layer;
    private anim?: Konva.Animation;
    private animationTimer?: any;
    private gizmoLayer?: Konva.Layer;

    private unit: string = "mm";

    constructor(editor: IDieEditor) {
        super(editor);
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

    protected override createLayers(): void {
        this.animationLayer = new Konva.Layer({
            name: DrawToolHandler.ANIMATION_LAYER_NAME
        });
        this.layers.push(this.animationLayer);
        this.gizmoLayer = new Konva.Layer({
            name: DrawToolHandler.GIZMO_LAYER_NAME
        });
        this.layers.push(this.gizmoLayer);
    }

    override onMouseDown(event: KonvaEventObject<any>): void {
        if (KonvaEditableText.editing) return;

        const pos = this.getSnappingPoint().v;
        const hoverEndpoints = this.editor.state.canDrawNewLine(pos);
        if (!hoverEndpoints) {
            this.startAnimationAvailablePoints();
            return;
        }

        this.startingPoint = pos;
        this.stopAnimationAvailablePoints();
        this.showGitzmoOnPointer(pos);
        this.isDrawing = true;
        this.drawingLine = new MeasurableShape<any>(this.editor, pos, this.isDrawingLine ? LineExt : BezierLineExt);
        this.editor.layer.add(this.drawingLine.group);
    }

    override onMouseMove(event: KonvaEventObject<any>): void {
        if (!this.isDrawing) {
            return;
        }

        // prevent scrolling on touch devices
        event.evt.preventDefault();
        const pos = this.getSnappingPoint();
        const newPoints = [this.startingPoint!.x, this.startingPoint!.y, pos.v.x, pos.v.y];
        this.drawingLine!.updatePoints(newPoints);
        pos.obj == "grid" ? this.clearGitzmos() : this.showGitzmoOnPointer(pos.v);
    }

    override onMouseUp(event: KonvaEventObject<any>): void {
        this.isDrawing = false;
        if (!this.drawingLine) return;

        this.clearGitzmos();
        const pos = this.getSnappingPoint().v;
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

        const endpoints = this.editor.state.getEndPoints().map(e => new Konva.Circle({
            x: e.x,
            y: e.y,
            radius: 10,
            stroke: '#00ff00',
            strokeWidth: 2,
        }));
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
        this.animationLayer?.clear();
        this.animationLayer?.destroyChildren();
    }

    private showGitzmoOnPointer(pos: Konva.Vector2d) {
        this.clearGitzmos();
        this.gizmoLayer?.add(new Konva.Circle({
            x: pos.x,
            y: pos.y,
            radius: 10,
            stroke: '#0000ff',
            strokeWidth: 2,
        }));
    }

    private clearGitzmos() {
        this.gizmoLayer?.clear();
        this.gizmoLayer?.destroyChildren();
    }
}