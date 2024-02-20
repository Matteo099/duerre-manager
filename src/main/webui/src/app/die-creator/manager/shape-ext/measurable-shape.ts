import { EventEmitter } from "@angular/core";
import Konva from "konva";
import { ERASABLE } from "../constants";
import { IDieEditor } from "../idie-editor";
import { KonvaUtils } from "../konva-utils";
import { ExtendedShape } from "./extended-shape";
import { IMeasurableShape, LengthChanged } from "./imeasurable-shape";
import { KonvaEditableText } from "./konva-editable-text";

export class MeasurableShape<S extends ExtendedShape<any>> implements IMeasurableShape {

    public static readonly UNIT_MM_MINUS_1 = "mm⁻¹";
    public static readonly UNIT_MM = "mm";

    private readonly editor: IDieEditor;
    public readonly group: Konva.Group;
    public readonly extShape: S;
    public readonly text: KonvaEditableText;

    //public onLengthChange?: LengthChangeFn;
    public onLengthChanged: EventEmitter<LengthChanged> = new EventEmitter();

    constructor(editor: IDieEditor, position: Konva.Vector2d, shapeConstructor: new (initialPosition: Konva.Vector2d) => S) {
        this.editor = editor;
        this.extShape = this.createShape(position, shapeConstructor);
        this.text = this.createText(position);
        this.group = this.createGroup();
    }

    private createShape(position: Konva.Vector2d, shapeConstructor: new (initialPosition: Konva.Vector2d) => S): S {
        return new shapeConstructor(position);
    }

    private createText(position: Konva.Vector2d): KonvaEditableText {
        const text = new KonvaEditableText(this.editor, {
            x: position.x,
            y: position.y,
            text: "0 mm",
            fill: '#333',
            fontSize: 25,
            fontFamily: 'Arial',
            align: 'center'
        });
        text.text.setAttr("MEASUREMENT", true);
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
        const length = (this.extShape.calculateLength() / 10).toFixed(1);
        this.text.text.x(middlePoint.x - width / 2);
        this.text.text.y(middlePoint.y - height / 2);
        this.text.text.text(length + " " + MeasurableShape.UNIT_MM);
    }

    public getLength(): number {
        return this.extShape.calculateLength();
    }

    public destroy() {
        this.group.destroy();
    }

    public getEndPoints(): Konva.Vector2d[] {
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

    public getAnchorPoints(): Konva.Vector2d[] {
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
            //this.onLengthChange?.(KonvaUtils.pointsVector2d(points.oldPoints)[1], KonvaUtils.pointsVector2d(points.newPoints)[1]);
            this.onLengthChanged.emit({ oldPoint: KonvaUtils.pointsVector2d(points.oldPoints)[1], newPoint: KonvaUtils.pointsVector2d(points.newPoints)[1] });
        } catch (error) { }
    }

    public updateEndpoint(oldPoint: Konva.Vector2d | ('start' | 'end'), newValue: Konva.Vector2d) {
        this.extShape.updateEndpoint(oldPoint, newValue);
        this.updateText();
    }

    public toggleText(active?: boolean) {
        this.text.text.visible(active ?? this.text.text.visible());
    }
}