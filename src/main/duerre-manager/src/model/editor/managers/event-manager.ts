import type Konva from "konva";
import { EManager } from "./emanager";
import { GenericManager } from "./generic-manager";
import type { EditorOrchestrator } from "../editor-orchestrator";
import { GridManager } from "./grid-manager";
import { ZoomManager } from "./zoom-manager";

export class EventManager extends GenericManager {

    constructor(editor: EditorOrchestrator) {
        super(editor, EManager.EVENT);
    }

    public setup(): void {
        this.editor.stage.on('wheel', (event) => this.handleWheel(event));
        this.editor.stage.on('dragend', (event) => this.handleDragend(event));
        this.editor.stage.on('mousedown touchstart', (event) => this.handleMouseDown(event));
        this.editor.stage.on('mouseup touchend', (event) => this.handleMouseUp(event));
        this.editor.stage.on('mousemove touchmove', (event) => this.handleMouseMove(event));
    }

    public destroy(): void {
        throw new Error("Method not implemented.");
    }

    private handleWheel(event: Konva.KonvaEventObject<WheelEvent>) {
        this.editor.getManager(ZoomManager)?.zoom({ event });
    }

    private handleDragend(event: Konva.KonvaEventObject<DragEvent>) {
        this.editor.getManager(GridManager)?.draw();
    }

    private handleMouseDown(event: Konva.KonvaEventObject<any>) {
        this.editor.getSelectedToolHandler()?.onMouseDown(event);
    }

    private handleMouseMove(event: Konva.KonvaEventObject<any>) {
        this.editor.getSelectedToolHandler()?.onMouseMove(event);
    }

    private handleMouseUp(event: Konva.KonvaEventObject<any>) {
        this.editor.getSelectedToolHandler()?.onMouseUp(event);
    }
}