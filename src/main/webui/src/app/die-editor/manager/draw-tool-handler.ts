import { KonvaEventObject } from "konva/lib/Node";
import { IDieEditor } from "./idie-editor";
import { ToolHandler } from "./tool-handler";
import Konva from "konva";

export class DrawToolHandler extends ToolHandler {

    private isDrawing: boolean = false;
    private startingPoint?: Konva.Vector2d;
    private currentLine?: Konva.Line;
    private currentText?: Konva.Text;
    private lines: { object: Konva.Line, text: Konva.Text }[] = [];

    private unit: string = "mm";

    constructor(editor: IDieEditor) {
        super(editor);
    }

    override onMouseDown(event: KonvaEventObject<any>): void {
        this.isDrawing = true;
        const pos = this.startingPoint = this.editor.getSnappedToGridPointer();
        this.currentLine = new Konva.Line({
            stroke: '#df4b26',
            strokeWidth: 5,
            globalCompositeOperation: 'source-over',
            // round cap for smoother lines
            lineCap: 'round',
            lineJoin: 'round',
            hitStrokeWidth: 20,
            // add point twice, so we have some drawings even on a simple click
            points: [pos.x, pos.y, pos.x, pos.y],
        });
        this.currentLine.setAttr("ERASABLE", true);
        this.currentText = new Konva.Text({
            x: pos.x,
            y: pos.y,
            text: "0 mm",
            fill: '#333',
            fontSize: 25,
            fontFamily: 'Arial',
            align: 'center'
        });
        this.editor.layer.add(this.currentLine);
        this.editor.layer.add(this.currentText);
    }

    override onMouseMove(event: KonvaEventObject<any>): void {
        if (!this.isDrawing) {
            return;
        }

        // prevent scrolling on touch devices
        event.evt.preventDefault();
        const pos = this.editor.getSnappedToGridPointer();
        const newPoints = [this.startingPoint!.x, this.startingPoint!.y, pos.x, pos.y];
        this.currentLine!.points(newPoints);

        const width = this.currentText?.width() || 0;
        const height = this.currentText?.height() || 0;
        const middlePoint = this.helper.calculateMiddlePoint(this.currentLine!);
        const length = this.helper.calculateLength(this.currentLine!).toFixed(2);
        this.currentText?.x(middlePoint.x - width / 2);
        this.currentText?.y(middlePoint.y - height / 2);
        this.currentText?.text(length + " mm");
    }

    override onMouseUp(event: KonvaEventObject<any>): void {
        this.isDrawing = false;

        if (this.currentLine) {
            if (this.helper.calculateLength(this.currentLine) > 0) {
                const pos = this.editor.getSnappedToGridPointer();
                const newPoints = [this.startingPoint!.x, this.startingPoint!.y, pos.x, pos.y];
                this.currentLine.points(newPoints);
                this.lines.push({ object: this.currentLine, text: this.currentText! });
                // this.editor.layer.add(this.helper.createHorizontalInfo(this.currentLine));
            } else {
                this.currentLine.destroy();
                this.currentText?.destroy();
            }
        }
    }
}