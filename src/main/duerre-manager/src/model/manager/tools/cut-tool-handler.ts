import Konva from "konva";
import type { IDieEditor } from "../idie-editor";
import { BezierLineExt } from "../shape-ext/bezier-line-ext";
// import { LineExt } from "../shape-ext/line-ext";
import { MeasurableShape } from "../shape-ext/measurable-shape";
import { ToolHandler } from "./tool-handler";
import { UnscaleManager } from "../managers/unscale-manager";
import { ERASABLE } from "../constants";
import { CutLine } from "../shape-ext/cut-line";
import type { Vector2d } from "konva/lib/types";
import type { IMeasurableShape } from "../shape-ext/imeasurable-shape";

export class CutToolHandler extends ToolHandler {

    public static readonly GIZMO_LAYER_NAME = "CUT_GIZMO_LAYER";
    private static readonly SNAP_PRECISION = 10;

    private isDrawing: boolean = false;
    private startingPoint?: Konva.Vector2d;
    private drawingLine?: CutLine;

    // I memorize a reference only to optimize the animations
    declare private animationLayer?: Konva.Layer;
    declare private gizmoLayer?: Konva.Layer;

    constructor(editor: IDieEditor) {
        super(editor, true);
    }

    protected override createLayers(): void {
        const gizmoLayer = this.gizmoLayer = new Konva.Layer({
            name: CutToolHandler.GIZMO_LAYER_NAME
        });
        this.layers.push(gizmoLayer);
    }

    override selectionConditionsSatisfied(): { value: boolean, message?: string } {
        const polygon = this.editor.state.isPolygonCreated();
        return polygon ? { value: true } : { value: false, message: "è necessario completare il poligono prima di poter definire delle regioni" }
    }

    override clear(): void {
        super.clear();

        this.drawingLine?.shape.destroy();
        this.drawingLine = undefined;
        this.isDrawing = false;
        this.startingPoint = undefined;
    }

    override onMouseDown(event: Konva.KonvaEventObject<any>): void {
        const pointer = this.getPointer('polygon-only');
        if (!pointer || !pointer.point) return;

        this.startingPoint = pointer.point;
        this.showGitzmoOnPointer(pointer.point);
        this.isDrawing = true;
        this.drawingLine = new CutLine(pointer.point, pointer.shape!);
        this.drawingLine.shape.setAttr(ERASABLE, true);
        this.editor.layer.add(this.drawingLine.shape);

        super.onMouseDown(event);
    }

    override onMouseMove(event: Konva.KonvaEventObject<any>): void {
        if (!this.isDrawing) {
            return;
        }

        // prevent scrolling on touch devices
        event.evt.preventDefault();
        const pos = this.editor.stage.getRelativePointerPosition();
        if (!pos) return;
        const polygonPoint = this.editor.state.getNearestPolygonPoint(pos, CutToolHandler.SNAP_PRECISION);

        if (polygonPoint?.point) this.showGitzmoOnPointer(polygonPoint.point);
        else this.clearGitzmos();

        const actualPos = polygonPoint.point ?? pos;
        const newPoints = [this.startingPoint!.x, this.startingPoint!.y, actualPos.x, actualPos.y];
        this.drawingLine!.setPoints(newPoints);

        super.onMouseMove(event);
    }

    override onMouseUp(event: Konva.KonvaEventObject<any>): void {
        super.onMouseUp(event);

        this.isDrawing = false;
        if (!this.drawingLine) return;

        this.clearGitzmos();
        const pointer = this.getPointer('polygon-only');

        if (pointer) {
            if(pointer.point) this.drawingLine.updateEndpoint('end', pointer.point);
            if(pointer.shape) this.drawingLine.setEndPointShape(pointer.shape);
        }
        if (this.drawingLine.calculateLength() > 0 && pointer) {
            this.editor.state.addCutLine(this.drawingLine);
        } else {
            this.drawingLine.shape.destroy();
        }

        this.drawingLine = undefined;
    }

    private getPointer(opt: 'polygon-only' | 'polygon-or-pointer' = 'polygon-or-pointer'): {
        point?: Vector2d | undefined;
        shape?: IMeasurableShape | undefined;
    } | undefined {
        const pos = this.editor.stage.getRelativePointerPosition();
        if (!pos) return;
        const polygonPoint = this.editor.state.getNearestPolygonPoint(pos, CutToolHandler.SNAP_PRECISION);

        if (opt == 'polygon-only')
            return polygonPoint;
        return !polygonPoint.point ? { point: pos } : polygonPoint;
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