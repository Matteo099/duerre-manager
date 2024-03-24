import type { IDieEditor } from "../idie-editor";
import { ToolHandler } from "./tool-handler";

export class MoveToolHandler extends ToolHandler {

    constructor(editor: IDieEditor) {
        super(editor, false);
    }

    override onToolSelected(): void {
        this.editor.stage.draggable(true);
    }

    override onToolDeselected(): void {
        this.editor.stage.draggable(false);
    }
}