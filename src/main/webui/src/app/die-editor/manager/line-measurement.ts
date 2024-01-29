import Konva from "konva";
import { KonvaEditableText } from "./konva-editable-text";
import { IDieEditor } from "./idie-editor";
import { KonvaHelper } from "./konva-helper";
import { ERASABLE } from "./constants";
import { DrawToolHandler } from "./draw-tool-handler";

export class LineMeasurement {

    private readonly drawTool: DrawToolHandler;
    private readonly group: Konva.Group;
    public readonly line: Konva.Line;
    private readonly text: KonvaEditableText;
    private readonly helper: KonvaHelper;

    public get editor(): IDieEditor {
        return this.drawTool.editor;
    }


    constructor(drawTool: DrawToolHandler, position: Konva.Vector2d) {
        this.drawTool = drawTool;
        this.helper = new KonvaHelper(drawTool.editor);
        this.line = this.createLine(position);
        this.text = this.createText(position);
        this.group = new Konva.Group();
        this.group.setAttr(ERASABLE, true);
        this.group.add(this.line, this.text.text);
    }

    private createLine(position: Konva.Vector2d) {
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
        //line.setAttr(ERASABLE, true);
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
        text.beforeCreateTextarea = () => { this.text.text.text(this.helper.calculateLength(this.line).toFixed(2).toString()); }
        return text;
    }

    public addToLayer() {
        this.editor.layer.add(this.group);
    }

    public updatePoints(newPoints: number[]) {
        this.line.points(newPoints);
        this.updateText();
    }

    public updateText() {
        const width = this.text.text.width() || 0;
        const height = this.text.text.height() || 0;
        const middlePoint = this.helper.calculateMiddlePoint(this.line);
        const length = this.helper.calculateLength(this.line).toFixed(2);
        this.text.text.x(middlePoint.x - width / 2);
        this.text.text.y(middlePoint.y - height / 2);
        this.text.text.text(length + " mm");
    }

    public getLength(): number {
        return this.helper.calculateLength(this.line);
    }

    public destroy() {
        // TODO: check if the children are removed
        this.group.destroy();
        // this.line.destroy();
        // this.text.text.destroy();
    }

    private onDeleteTextarea(value: string) {
        console.log(value);
        try {
            const length = parseFloat(value);
            const point = this.helper.findPoint(this.line, length);
            const points = this.line.points();
            const pointToUpdate = { x: points[points.length - 2], y: points[points.length - 1] };
            console.log(this.drawTool.findLinesWithEndpoint(pointToUpdate), this.drawTool.findLinesWithEndpoint(pointToUpdate).filter(l => l.line.id() != this.line.id()));
            const attachedLine = this.drawTool.findLinesWithEndpoint(pointToUpdate).filter(l => {
                console.log(l.line._id, this.line._id);
                return l.line._id != this.line._id;
            })[0];
            console.log(attachedLine, this.line);
            const newX = points[points.length - 2] = point.x;
            const newY = points[points.length - 1] = point.y;
            this.line.points(points);
            attachedLine?.updateEndPoint(pointToUpdate, { x: newX, y: newY });

            this.updateText();
        } catch (error) { }
    }

    public updateEndPoint(oldPoint: Konva.Vector2d, newValue: Konva.Vector2d) {
        const coords = this.helper.lineToCoords(this.line);
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