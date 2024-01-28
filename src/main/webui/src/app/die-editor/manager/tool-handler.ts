import { KonvaEventObject } from "konva/lib/Node";
import { KonvaHelper } from "./konva-helper";
import { IDieEditor } from "./idie-editor";

export abstract class ToolHandler {

    protected editor: IDieEditor;
    protected helper: KonvaHelper;

    constructor(editor: IDieEditor) {
        this.editor = editor;
        this.helper = new KonvaHelper(editor);
    }

    onToolSelected(): void { }
    onToolDeselected(): void { }

    abstract onMouseDown(event: KonvaEventObject<any>): void;
    abstract onMouseMove(event: KonvaEventObject<any>): void;
    abstract onMouseUp(event: KonvaEventObject<any>): void;
} 