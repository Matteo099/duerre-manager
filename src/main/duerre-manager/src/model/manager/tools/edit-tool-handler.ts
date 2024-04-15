import Konva from "konva";
import { Subscription } from "rxjs";
import { BezierLineExt } from "../shape-ext/bezier-line-ext";
import { ToolHandler } from "./tool-handler";
import { UnscaleManager } from "../managers/unscale-manager";
import type { IDieEditor } from "../idie-editor";
import type { IMeasurableShape } from "../shape-ext/imeasurable-shape";
import type { Point } from "../shape-ext/point";

export class EditToolHandler extends ToolHandler {

    public static readonly GIZMO_LAYER_NAME = "GIZMO_LAYER_NAME";

    declare private gizmoLayer: Konva.Layer;
    private tempSubscriptions: Subscription[] = [];

    constructor(editor: IDieEditor) {
        super(editor, false);
    }

    protected override createLayers(): void {
        this.gizmoLayer = new Konva.Layer({
            name: EditToolHandler.GIZMO_LAYER_NAME
        });
        this.layers.push(this.gizmoLayer);
    }

    override onToolSelected(): boolean {
        if (!super.onToolSelected()) return false;

        this.gizmoLayer.moveToTop();
        this.createAnchorPoints();
        return true;
    }

    override onToolDeselected(): void {
        super.onToolDeselected();
        UnscaleManager.getInstance()?.unregisterLayer(this.gizmoLayer);
        this.gizmoLayer.removeChildren();
        this.tempSubscriptions.forEach(s => s.unsubscribe());
        this.tempSubscriptions = [];
    }

    override clear(): void {
        super.clear();

        this.tempSubscriptions.forEach(s => s.unsubscribe());
        this.tempSubscriptions = [];
    }

    private createAnchorPoints() {
        this.gizmoLayer.removeChildren();

        const anchorPoints: { point: Point, shapes: IMeasurableShape[] }[] = [];

        this.editor.state.lines.forEach(shape => {
            if (shape.extShape instanceof BezierLineExt && shape.extShape.quadLinePath)
                this.gizmoLayer.add(shape.extShape.quadLinePath);
            this.tempSubscriptions.push(shape.onLengthChanged.subscribe(_ => this.createAnchorPoints()));

            shape.getAnchorPoints().forEach(point => {
                const index = anchorPoints.findIndex(p => p.point.equalsById(point))
                if (index != -1) {
                    anchorPoints[index].shapes.push(shape);
                } else {
                    anchorPoints.push({ point, shapes: [shape] })
                }
            })
        })
        console.log(anchorPoints)

        anchorPoints.forEach(anchorObj => {
            this.buildAnchor(anchorObj.point, anchorObj.shapes);
        });
    }

    // function to build anchor point
    private buildAnchor(point: Point, shapes: IMeasurableShape[]): void {
        const controlPoint = shapes.length == 1 && shapes[0].extShape instanceof BezierLineExt && shapes[0].extShape.isControlPoint(point);
        const anchor = new Konva.Circle({
            x: point.x,
            y: point.y,
            radius: 10,
            stroke: '#666',
            fill: '#ddd',
            strokeWidth: 2,
            draggable: true,
        });
        UnscaleManager.getInstance()?.registerShape(anchor);
        this.gizmoLayer.add(anchor);

        // add hover styling
        anchor.on('mouseover', () => {
            document.body.style.cursor = 'pointer';
            anchor.strokeWidth(4);
        });
        anchor.on('mouseout', () => {
            document.body.style.cursor = 'default';
            anchor.strokeWidth(2);
        });

        let lastPosition = anchor.position();
        let currentPosition = anchor.position();
        anchor.on('mousedown touchstart', (event) => {
            lastPosition = anchor.position();
            this.highlightShapes(true, shapes);
            this.editor.guidelinesManager.activate();
        });

        anchor.on('mouseup touchend', (event) => {
            this.highlightShapes(false, shapes);
            this.editor.guidelinesManager.deactivate();
        });

        anchor.on('dragmove', (event) => {
            //currentPosition = anchor.position();
            if (!controlPoint) {
                currentPosition = this.editor.getSnapToNearest();
                anchor.position(currentPosition);
            } else {
                currentPosition = anchor.position();
            }

            if (currentPosition.x == lastPosition.x && currentPosition.y == lastPosition.y)
                return;

            shapes.forEach(s => {
                console.log(s.getId());
                s.updateEndpoint(point, currentPosition);
                // console.log(s.extShape.shape, lastPosition, currentPosition);
                // this.updateDottedLines();
            });
            lastPosition = anchor.position();

            this.editor.guidelinesManager.update();
        });

        anchor.on('dragend', (event) => {
            this.highlightShapes(false, shapes);
        });
    }

    private highlightShapes(active: boolean, shapes: IMeasurableShape[]) {

        shapes?.forEach(s => {
            const shape: Konva.Shape = s.extShape.shape;
            //shape.dash(active ? [10, 20, 0.001, 20] : []);
            //shape.dashEnabled(active);
            shape.stroke(active ? "#26df48" : "#df4b26");
        });
    }
}