import type { EditorOrchestrator } from "../editor-orchestrator";
import { GenericToolHandler } from "./generic-tool-handler";

export class MoveToolHandler extends GenericToolHandler {

    constructor(editor: EditorOrchestrator) {
        super(editor, false);
    }

    override onToolSelected() {
        super.onToolSelected();
        this.editor.stage.draggable(true);
    }

    override onToolDeselected(): void {
        this.editor.stage.draggable(false);
    }
}