import Konva from "konva";
import { ERASABLE } from "./constants";
import { IDieEditor } from "./idie-editor";
import { KonvaEditableText } from "./konva-editable-text";
import { KonvaUtils } from "./konva-utils";

export class LineMeasurement {

    private readonly editor: IDieEditor;
    public readonly group: Konva.Group;
    public readonly line: Konva.Line;
    public readonly text: KonvaEditableText;

    public onLengthChange?: Function;

    constructor(editor: IDieEditor, position: Konva.Vector2d) {
        this.editor = editor;
        this.line = this.createLine(position);
        this.text = this.createText(position);
        this.group = this.createGroup();
    }

    private createLine(position: Konva.Vector2d): Konva.Line {
        const line = new Konva.Line({
            stroke: '#df4b26',
            strokeWidth: 5,
            globalCompositeOperation: 'source-over',
            // round cap for smoother lines
            lineCap: 'round',
            lineJoin: 'round',
            hitStrokeWidth: 20,
            // add point twice, so we have some drawings even on a simple click
            points: [position.x, position.y, position.x, position.y],
        });
        return line;
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
        text.beforeCreateTextarea = () => { this.text.text.text(KonvaUtils.calculateLength(this.line).toFixed(2).toString()); }
        return text;
    }

    private createGroup() : Konva.Group {
        const group = new Konva.Group();
        group.setAttr(ERASABLE, true);
        group.add(this.line, this.text.text);
        return group;
    }

    public updatePoints(newPoints: number[]) {
        this.line.points(newPoints);
        this.updateText();
    }

    public updateText() {
        const width = this.text.text.width() || 0;
        const height = this.text.text.height() || 0;
        const middlePoint = KonvaUtils.calculateMiddlePoint(this.line);
        const length = KonvaUtils.calculateLength(this.line).toFixed(2);
        this.text.text.x(middlePoint.x - width / 2);
        this.text.text.y(middlePoint.y - height / 2);
        this.text.text.text(length + " mm");
    }

    public getLength(): number {
        return KonvaUtils.calculateLength(this.line);
    }

    public destroy() {
        this.group.destroy();
    }

    private onDeleteTextarea(value: string) {
        console.log(value);
        try {
            const length = parseFloat(value);
            const point = KonvaUtils.findPoint(this.line, length);
            const oldPoints = this.line.points();
            const newPoints = [...oldPoints];
            newPoints[newPoints.length - 2] = point.x;
            newPoints[newPoints.length - 1] = point.y;
            this.updatePoints(newPoints);
            this.onLengthChange?.(KonvaUtils.pointsVector2d(oldPoints)[1], KonvaUtils.pointsVector2d(newPoints)[1]);
        } catch (error) { }
    }

    public updateEndPoint(oldPoint: Konva.Vector2d, newValue: Konva.Vector2d) {
        const coords = KonvaUtils.lineToCoords(this.line);
        if (coords.x1 == oldPoint.x && coords.y1 == oldPoint.y) {
            this.updatePoints([
                newValue.x, newValue.y, coords.x2, coords.y2
            ]);
        } else if (coords.x2 == oldPoint.x && coords.y2 == oldPoint.y) {
            this.updatePoints([
                coords.x1, coords.y1, newValue.x, newValue.y
            ]);
        }
    }
}