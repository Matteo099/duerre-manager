import { KonvaEventObject } from "konva/lib/Node";
import { IDieEditor } from "../idie-editor";
import { ToolHandler } from "./tool-handler";
import Konva from "konva";
import { IMeasurableShape } from "../shape-ext/imeasurable-shape";
import { BezierLineExt } from "../shape-ext/bezier-line-ext";
import { REMOVE_ONLY } from "../constants";
import { Subscription } from "rxjs";

export class EditToolHandler extends ToolHandler {

    public static readonly GIZMO_LAYER_NAME = "GIZMO_LAYER_NAME";

    private gizmoLayer!: Konva.Layer;
    private tempSubscriptions: Subscription[] = [];

    constructor(editor: IDieEditor) {
        super(editor);
    }

    protected override createLayers(): void {
        this.gizmoLayer = new Konva.Layer({
            name: EditToolHandler.GIZMO_LAYER_NAME
        });
        this.layers.push(this.gizmoLayer);
    }

    override onToolSelected(): void {
        super.onToolSelected();
        this.gizmoLayer.moveToTop();
        this.createAnchorPoints();
    }

    override onToolDeselected(): void {
        super.onToolDeselected();
        this.gizmoLayer.removeChildren();
        this.tempSubscriptions.forEach(s => s.unsubscribe());
        this.tempSubscriptions = [];
    }

    private createAnchorPoints() {
        this.gizmoLayer.removeChildren();

        const dAnchorPoints = this.editor.state.lines.flatMap(l => {
            if (l.extShape instanceof BezierLineExt && l.extShape.quadLinePath)
                this.gizmoLayer.add(l.extShape.quadLinePath);

            this.tempSubscriptions.push(l.onLengthChanged.subscribe(v => {
                this.createAnchorPoints();
            }));

            return { l, v: l.getAnchorPoints() }
        });

        // Remove duplicate points
        const anchorPoints: Map<string, IMeasurableShape[]> = new Map();
        for (const anchorObj of dAnchorPoints) {
            for (const point of anchorObj.v) {
                const pointKey = `${point.x},${point.y}`;
                if (!anchorPoints.has(pointKey)) {
                    anchorPoints.set(pointKey, [anchorObj.l]);
                } else {
                    const objArr = anchorPoints.get(pointKey);
                    if (!objArr?.includes(anchorObj.l)) objArr?.push(anchorObj.l);
                }
            }
        }

        anchorPoints.forEach((shapes, pointKey) => {
            const [x, y] = pointKey.split(',').map(parseFloat);
            this.buildAnchor(shapes, { x, y });
        });
    }

    // function to build anchor point
    private buildAnchor(shapes: IMeasurableShape[], vector: Konva.Vector2d): void {
        const controlPoint = shapes.length == 1 && shapes[0].extShape instanceof BezierLineExt && shapes[0].extShape.isControlPoint(vector);
        const anchor = new Konva.Circle({
            x: vector.x,
            y: vector.y,
            radius: 20,
            stroke: '#666',
            fill: '#ddd',
            strokeWidth: 2,
            draggable: true,
        });
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
        anchor.on('mousedown touch', (event) => {
            lastPosition = anchor.position();
        });

        anchor.on('dragmove', (event) => {
            //currentPosition = anchor.position();
            if (!controlPoint) {
                currentPosition = this.editor.getSnappedToNearObject().v;
                anchor.position(currentPosition);
            } else {
                currentPosition = anchor.position();
            }

            shapes.forEach(s => {
                s.updateEndpoint(lastPosition, currentPosition);
                console.log(s.extShape.shape, lastPosition, currentPosition);
                // this.updateDottedLines();
            });
            lastPosition = anchor.position();
        });
    }

    override onMouseDown(event: KonvaEventObject<any>): void {

    }

    override onMouseMove(event: KonvaEventObject<any>): void {

    }

    override onMouseUp(event: KonvaEventObject<any>): void {

    }
}