import { KonvaEventObject } from "konva/lib/Node";
import { IDieEditor } from "../idie-editor";
import { ToolHandler } from "./tool-handler";
import { ERASABLE } from "../constants";
import Konva from "konva";

const FADE_DURATION = 0.5; // in seconds
const FRAME_RATE = 60; // Frames per second

export class EraserToolHandler extends ToolHandler {

    private readonly trail: Konva.Shape;
    private readonly shapesToDelete: (Konva.Shape | Konva.Stage | Konva.Node)[] = [];
    private pos: Konva.Vector2d = { x: 50, y: 50 };

    constructor(editor: IDieEditor) {
        super(editor);

        this.trail = new Konva.Shape({
            stroke: 'black',
            strokeWidth: 5,
            globalCompositeOperation: 'source-over',
            // round cap for smoother lines
            lineCap: 'round',
            lineJoin: 'round',
            sceneFunc: (ctx, shape) => {
                console.log("sceneFunc")
                ctx.beginPath();
                ctx.moveTo(this.pos.x, this.pos.y);
                ctx.arc(this.pos.x, this.pos.y, 3, 0, Math.PI * 2, true);
                ctx.fillStrokeShape(shape);
            }
        });
    }

    override onToolSelected(): void {
        super.onToolSelected();
        //this.editor.layer.toggleHitCanvas();
    }

    override onToolDeselected(): void {
        super.onToolDeselected();
        //this.editor.layer.toggleHitCanvas();
    }

    override onMouseDown(event: KonvaEventObject<any>): void {
        this.editor.layer.add(this.trail);
        this.addToDeletedShapes(this.getEraseableNode(event));
    }

    override onMouseMove(event: KonvaEventObject<any>): void {
        const pos = this.editor.stage.getRelativePointerPosition();
        console.log(pos);
        if (!pos) return;

        this.pos = pos;
        this.addToDeletedShapes(this.getEraseableNode(event));
    }

    override onMouseUp(event: KonvaEventObject<any>): void {
        this.shapesToDelete.forEach(s => {
            this.editor.state.remove(s);
        });
    }

    private getEraseableNode(event: KonvaEventObject<any>): Konva.Shape | Konva.Stage | Konva.Node | undefined {
        const erasableParents = event.target?.findAncestors((n: Konva.Node) => n.getAttr(ERASABLE));
        return erasableParents && erasableParents.length > 0 ? erasableParents[erasableParents.length - 1] : event.target;
    }

    private addToDeletedShapes(node?: Konva.Shape | Konva.Stage | Konva.Node) {
        let s = true;
        if (!node || s) return;

        this.shapesToDelete.push(node);
        this.makeGray(node);
    }

    private makeGray(node: Konva.Shape | Konva.Stage | Konva.Node) {

    }
}