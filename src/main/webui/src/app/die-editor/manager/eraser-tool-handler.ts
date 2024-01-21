import { IDieEditor } from "./idie-editor";
import { ToolHandler } from "./tool-handler";

export class EraserToolHandler extends ToolHandler {

    constructor(editor: IDieEditor) {
        super(editor);
    }

    override onMouseDown(event: fabric.IEvent<Event>): void {
    }
    override onMouseMove(event: fabric.IEvent<Event>): void {
    }
    override onMouseUp(event: fabric.IEvent<Event>): void {
    }
}