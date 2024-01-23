import { IDieEditor } from "./idie-editor";
import { ToolHandler } from "./tool-handler";

export class MoveToolHandler extends ToolHandler {

    private isPanning = false;
    private lastPointer: { x: number; y: number } | null = null;

    constructor(editor: IDieEditor) {
        super(editor);
    }

    override onMouseDown(event: fabric.IEvent<Event>): void {
        this.isPanning = true;
        this.lastPointer = this.editor.fabricCanvas.getPointer(event.e);
    }
    override onMouseMove(event: fabric.IEvent<Event>): void {
        if (this.isPanning && this.lastPointer) {
            const currentPointer = this.editor.fabricCanvas.getPointer(event.e);
            const offset = {
                x: currentPointer.x - this.lastPointer.x,
                y: currentPointer.y - this.lastPointer.y,
            };

            this.editor.fabricCanvas.relativePan(offset);
            this.lastPointer = currentPointer;
        }
    }
    override onMouseUp(event: fabric.IEvent<Event>): void {
        this.isPanning = false;
        this.lastPointer = null;
    }
}