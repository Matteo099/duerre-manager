import type { EditorOrchestrator } from "../editor-orchestrator";
import { EManager } from "./emanager";
import { GenericManager } from "./generic-manager";

export interface Action {
    execute(): void;
    undo(): void;
}

export class UndoRedoManager extends GenericManager {
    private actions: Action[] = [];
    private currentIndex: number = -1;

    constructor(editor: EditorOrchestrator) {
        super(editor, EManager.UNDOREDO);
    }

    public setup(): void {
    }
    
    public clear(): void {
    }

    public destroy(): void {
    }

    addAction(action: Action) {
        // Clear actions after current index when adding a new action
        this.actions.splice(this.currentIndex + 1);
        this.actions.push(action);
        this.currentIndex++;
    }

    undo() {
        if (this.currentIndex >= 0) {
            this.actions[this.currentIndex].undo();
            this.currentIndex--;
        }
    }

    redo() {
        if (this.currentIndex < this.actions.length - 1) {
            this.currentIndex++;
            this.actions[this.currentIndex].execute();
        }
    }
}