import { FabricHelper } from "./fabric-helper";
import { IDieEditor } from "./idie-editor";

export abstract class ToolHandler {

    protected editor: IDieEditor;
    protected helper: FabricHelper;

    constructor(editor: IDieEditor) {
        this.editor = editor;
        this.helper = new FabricHelper(editor);
    }

    onToolSelected(): void { }
    onToolDeselected(): void { }

    abstract onMouseDown(event: fabric.IEvent): void;
    abstract onMouseMove(event: fabric.IEvent): void;
    abstract onMouseUp(event: fabric.IEvent): void;
} 