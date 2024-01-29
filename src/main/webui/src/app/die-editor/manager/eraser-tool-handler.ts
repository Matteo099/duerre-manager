import { KonvaEventObject } from "konva/lib/Node";
import { IDieEditor } from "./idie-editor";
import { ToolHandler } from "./tool-handler";
import { ERASABLE } from "./constants";

export class EraserToolHandler extends ToolHandler {

    constructor(editor: IDieEditor) {
        super(editor);
    }

    override onToolSelected(): void {
        this.editor.layer.toggleHitCanvas();
    }

    override onToolDeselected(): void {
        this.editor.layer.toggleHitCanvas();
    }

    override onMouseDown(event: KonvaEventObject<any>): void {
        console.log(event.target, event);
        if (event.target?.getAttr(ERASABLE)) event.target?.destroy();
        //this.editor.layer.batchDraw();
    }

    override onMouseMove(event: KonvaEventObject<any>): void {

    }

    override onMouseUp(event: KonvaEventObject<any>): void {

    }
}