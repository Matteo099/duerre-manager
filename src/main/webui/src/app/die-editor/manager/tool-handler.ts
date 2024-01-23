import { FabricHelper } from "./fabric-helper";
import { GizmosManager } from "./gizmos-manager";
import { IDieEditor } from "./idie-editor";

export abstract class ToolHandler {

    protected editor: IDieEditor;
    protected helper: FabricHelper;
    protected gizmos: GizmosManager;

    constructor(editor: IDieEditor) {
        this.editor = editor;
        this.helper = new FabricHelper(editor);
        this.gizmos = new GizmosManager(editor);
    }

    onToolSelected(): void { }
    onToolDeselected(): void { }

    abstract onMouseDown(event: fabric.IEvent): void;
    abstract onMouseMove(event: fabric.IEvent): void;
    abstract onMouseUp(event: fabric.IEvent): void;
    onObjectMove(event: fabric.IEvent): void {}
} 