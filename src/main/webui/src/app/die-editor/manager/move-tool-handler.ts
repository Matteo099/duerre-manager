import { KonvaEventObject } from "konva/lib/Node";
import { IDieEditor } from "./idie-editor";
import { ToolHandler } from "./tool-handler";

export class MoveToolHandler extends ToolHandler {

    constructor(editor: IDieEditor) {
        super(editor);
    }

    override onToolSelected(): void {
        this.editor.stage.draggable(true);
    }

    override onToolDeselected(): void {
        this.editor.stage.draggable(false);
    }

    override onMouseDown(event: KonvaEventObject<any>): void {
        
    }

    override onMouseMove(event: KonvaEventObject<any>): void {

    }

    override onMouseUp(event: KonvaEventObject<any>): void {

    }
}