import { IDieEditor } from "./idie-editor";
import { ToolHandler } from "./tool-handler";

export class SelectToolHandler extends ToolHandler {

    constructor(editor: IDieEditor) {
        super(editor);
    }

    override onToolSelected(): void {
        this.editor.fabricCanvas.selection = true;    
    }

    override onToolDeselected(): void {
        this.editor.fabricCanvas.selection = false;         
    }

    override onMouseDown(event: fabric.IEvent<Event>): void {
        // Enable editing of the selected object (e.g., polygon vertices)
        const selectedObject = event.target;
        console.log(event, event.target);
        if (!selectedObject) return;
        console.log(selectedObject);
        selectedObject.set({

            //  editable: true 
        });
        this.editor.fabricCanvas.renderAll();
    }
    override onMouseMove(event: fabric.IEvent<Event>): void {
    }
    override onMouseUp(event: fabric.IEvent<Event>): void {
    }
}