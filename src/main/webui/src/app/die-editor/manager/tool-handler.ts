abstract class ToolHandler {

    protected editor: IDieEditor;
    protected helper: FabricHelper;

    constructor(editor: IDieEditor) {
        this.editor = editor;
        this.helper = new FabricHelper(editor);
    }


    abstract onMouseDown(event: fabric.IEvent): void;
    abstract onMouseMove(event: fabric.IEvent): void;
    abstract onMouseUp(event: fabric.IEvent): void;
} 