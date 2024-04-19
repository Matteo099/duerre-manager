import type { EditorOrchestrator } from "../editor-orchestrator";
import { GenericToolHandler } from "./generic-tool-handler";

export class MoveToolHandler extends GenericToolHandler {

    constructor(editor: EditorOrchestrator) {
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