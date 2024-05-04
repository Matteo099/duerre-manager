import type { EditorOrchestrator } from "@/model/editor/editor-orchestrator";
import { UnscaleManager } from "@/model/editor/managers/unscale-manager";
import Konva from "konva";
import { LiteEvent } from "../../event/lite-event";
import type { Point } from "../../math/point";
import { toVec2DArray } from "../../math/vec2d";
import { EditableText } from "../editable-text";
import type { ExtendedShape, ExtendedShapeOpt } from "./extended-shape";
import type { IMeasurableShape, LengthChanged } from "./imeasurable-shape";
import { ERASABLE, MEASUREMENT, UPDATE_UNSCALE } from "../../constants";

export class MeasurableShape<S extends ExtendedShape<any>> implements IMeasurableShape {

    public static readonly UNITS = [
        { exp: 100, name: "mm" },
        { exp: 10, name: "mm⁻¹" },
    ];

    private currentUnit = MeasurableShape.UNITS[0];

    private readonly editor: EditorOrchestrator;
    private declare readonly unscaleManager?: UnscaleManager;
    public readonly group: Konva.Group;
    public readonly extShape: S;
    public readonly text: EditableText;

    //public onLengthChange?: LengthChangeFn;
    public onLengthChanged: LiteEvent<LengthChanged> = new LiteEvent();

    constructor(editor: EditorOrchestrator, position: Point | Konva.Vector2d, shapeConstructor: (new (opts: Partial<ExtendedShapeOpt>) => S) | S) {
        this.editor = editor;
        this.unscaleManager = editor.getManager(UnscaleManager);
        console.log(this.unscaleManager)
        this.extShape = shapeConstructor instanceof Function ? this.createShape({ initialPosition: position }, shapeConstructor) : shapeConstructor;
        this.text = this.createText(position);
        this.group = this.createGroup();
    }

    private createShape(opts: Partial<ExtendedShapeOpt>, shapeConstructor: new (opts: Partial<ExtendedShapeOpt>) => S): S {
        return new shapeConstructor(opts);
    }

    private createText(position: Konva.Vector2d): EditableText {
        const text = new EditableText(this.editor, {
            x: position.x,
            y: position.y,
            text: "0 mm",
            fill: '#333',
            fontSize: 25,
            fontFamily: 'Arial',
            align: 'center'
        });
        text.text.setAttr(MEASUREMENT, true);
        text.text.setAttr(UPDATE_UNSCALE, (scale: number) => this.updateText());
        text.onDeleteTextarea = (v: string) => this.onDeleteTextarea(v);
        text.beforeCreateTextarea = () => { this.text.text.text(this.extShape.calculateLength().toFixed(2).toString()); }
        return text;
    }

    private createGroup(): Konva.Group {
        const group = new Konva.Group();
        group.setAttr(ERASABLE, true);
        group.add(this.extShape.shape, this.text.text);
        return group;
    }

    public updatePoints(newPoints: number[]) {
        this.extShape.setPoints(newPoints);
        this.updateText();
    }

    public updateText() {
        const width = this.text.text.width() || 0;
        const height = this.text.text.height() || 0;
        const middlePoint = this.extShape.calculateMiddlePoint();
        const length = (this.extShape.calculateLength() / (this.currentUnit.exp)).toFixed(1);
        this.text.text.x(middlePoint.x - width / 2);
        this.text.text.y(middlePoint.y - height / 2);
        this.text.text.text(length + " " + this.currentUnit.name);
    }

    public getLength(): number {
        return this.extShape.calculateLength();
    }

    public destroy() {
        this.unscaleManager?.unregisterObject(this.text.text);
        this.unscaleManager?.unregisterObject(this.extShape.shape);

        this.group.destroy();
    }

    public getEndPoints(): Point[] {
        return this.extShape.getEndPoints();
    }

    public hasCommonEndPointWith(shape: IMeasurableShape): boolean {
        const myEndpoints = this.getEndPoints();
        const otherEndpoints = shape.getEndPoints();
        for (let i = 0; i < myEndpoints.length; i++) {
            const ep = myEndpoints[i];
            for (let j = 0; j < otherEndpoints.length; j++) {
                const oEp = otherEndpoints[j];
                if (oEp.x == ep.x && oEp.y == ep.y) {
                    return true;
                }
            }
        }
        return false;
    }

    public getAnchorPoints(): Point[] {
        return this.extShape.getAnchorPoints();
    }

    public getId(): number {
        return this.extShape.getId();
    }

    private onDeleteTextarea(value: string) {
        try {
            const length = parseFloat(value);
            const points = this.extShape.calculatePointsGivenLength(length);
            this.updatePoints(points.newPoints);
            // TODO: remove as any
            this.onLengthChanged.next({ oldPoint: toVec2DArray(points.oldPoints)[1] as any, newPoint: toVec2DArray(points.newPoints)[1] });
        } catch (error) { }
    }

    public updateEndpoint(oldPoint: Point | ('start' | 'end'), newValue: Konva.Vector2d) {
        this.extShape.updateEndpoint(oldPoint, newValue);
        this.updateText();
    }

    public toggleText(active?: boolean) {
        this.text.text.visible(active ?? this.text.text.visible());
    }
}