import { KonvaEventObject } from "konva/lib/Node";
import { IDieEditor } from "../idie-editor";
import { ToolHandler } from "./tool-handler";

export class EditToolHandler extends ToolHandler {

    constructor(editor: IDieEditor) {
        super(editor);
    }

    override onMouseDown(event: KonvaEventObject<any>): void {

    }

    override onMouseMove(event: KonvaEventObject<any>): void {

    }

    override onMouseUp(event: KonvaEventObject<any>): void {

    }
}