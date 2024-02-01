import { KonvaEventObject } from "konva/lib/Node";
import { IDieEditor } from "./idie-editor";
import { ToolHandler } from "./tool-handler";
import { ERASABLE } from "./constants";
import Konva from "konva";

export class EraserToolHandler extends ToolHandler {

    constructor(editor: IDieEditor) {
        super(editor);
    }

    override onToolSelected(): void {
        this.editor.layer.toggleHitCanvas();
    }

    override onToolDeselected(): void {
        this.editor.layer.toggleHitCanvas();
    }

    override onMouseDown(event: KonvaEventObject<any>): void {
        console.log(event.target, event);
        const erasableParents = event.target?.findAncestors((n: Konva.Node) => n.getAttr(ERASABLE));
        const lastParent = erasableParents && erasableParents.length > 0 ? erasableParents[erasableParents.length - 1] : event.target;
        this.editor.state.remove(lastParent);
    }

    override onMouseMove(event: KonvaEventObject<any>): void {

    }

    override onMouseUp(event: KonvaEventObject<any>): void {

    }
}