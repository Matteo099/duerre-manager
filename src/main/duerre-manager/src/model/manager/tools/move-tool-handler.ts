import type { IDieEditor } from "../idie-editor";
import { ToolHandler } from "./tool-handler";

export class MoveToolHandler extends ToolHandler {

    constructor(editor: IDieEditor) {
        super(editor, false);
    }

    override onToolSelected(): boolean {
        if(!super.onToolSelected()) return false;
        
        this.editor.stage.draggable(true);
        return true;
    }

    override onToolDeselected(): void {
        this.editor.stage.draggable(false);
    }
}