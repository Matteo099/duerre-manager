import Konva from "konva";
import type { IFrame } from "konva/lib/types";
import type { EditorOrchestrator } from "../editor-orchestrator";
import { GenericToolHandler } from "./generic-tool-handler";
import { ERASABLE } from "../core/constants";

const FADE_DURATION = 0.5; // in seconds
const FRAME_RATE = 60; // Frames per second

export class EraserToolHandler extends GenericToolHandler {

    private readonly shapesToDelete: (Konva.Shape | Konva.Stage | Konva.Node)[] = [];
    private trail!: Konva.Line;
    private anim!: Konva.Animation;
    private mouseDown = false;

    constructor(editor: EditorOrchestrator) {
        super(editor, false);
    }

    override setup(): void {
        super.setup();

        const objs = this.createObjects();
        this.trail = objs.trail;
        this.anim = objs.anim;
    }

    private createObjects(): { trail: Konva.Line, anim: Konva.Animation } {
        const trail = new Konva.Line({
            stroke: 'rgba(0.15,0.15,0.15,0.2)',
            strokeWidth: 5,
            globalCompositeOperation: 'source-over',
            lineCap: 'round',
            lineJoin: 'round',
            points: [],
        });
        this.unscaleManager?.registerShape(trail);
        this.editor.layer.add(trail);

        let acc = 0;
        const anim = new Konva.Animation((frame?: IFrame) => {
            if (!frame) return;

            acc += frame.timeDiff;
            if (acc > 15) {
                const points = this.trail.points();
                const size = points.length > 8 ? Math.round(points.length / 4) : 2;
                points.splice(0, size % 2 == 0 ? size : size + 1);
                this.trail.points(points);
                acc = 0;
            }
        }, this.editor.layer);

        return { trail, anim };
    }

    override onToolSelected() {
        super.onToolSelected()
        this.trail.moveToTop();
        this.anim.start();
    }

    override onToolDeselected(): void {
        super.onToolDeselected();
        this.anim.stop();
        //this.editor.layer.toggleHitCanvas();
    }

    override clear(): void {
        super.clear();

        this.anim.stop();
        this.shapesToDelete.splice(0, this.shapesToDelete.length);
        this.trail.points([]);
    }

    override onMouseDown(event: Konva.KonvaEventObject<any>): void {
        const pos = this.editor.stage.getRelativePointerPosition();
        if (!pos) return;

        this.mouseDown = true;
        this.trail.points([pos.x, pos.y, pos.x, pos.y]);

        this.addToDeletedShapes(this.getEraseableNode(event));
    }

    override onMouseMove(event: Konva.KonvaEventObject<any>): void {
        if (!this.mouseDown) return;

        // prevent scrolling on touch devices
        event.evt.preventDefault();
        const pos = this.editor.stage.getRelativePointerPosition();
        if (!pos) return;

        const newPoints = this.trail.points().concat([pos.x, pos.y]);
        this.trail.points(newPoints);
        const eraseableNode = this.getEraseableNode(event)
        this.addToDeletedShapes(eraseableNode);
        if (eraseableNode) {
            const connectedCutLine = this.stateManager?.findCutsConnectedTo(eraseableNode)
            connectedCutLine?.forEach(n => this.addToDeletedShapes(n));
        }
    }

    override onMouseUp(event: Konva.KonvaEventObject<any>): void {
        this.mouseDown = false;

        this.shapesToDelete.forEach(s => {
            this.stateManager?.remove(s);
            this.unscaleManager?.unregisterObject(s as any);
        });
    }

    private getEraseableNode(event: Konva.KonvaEventObject<any>): Konva.Shape | Konva.Stage | Konva.Node | undefined {
        const erasableParents = event.target?.findAncestors((n: Konva.Node) => n.getAttr(ERASABLE));
        return erasableParents && erasableParents.length > 0 ? erasableParents[erasableParents.length - 1] : (event.target.getAttr(ERASABLE) ? event.target : undefined);
    }

    private addToDeletedShapes(node?: Konva.Shape | Konva.Stage | Konva.Node) {
        if (!node || this.shapesToDelete.includes(node)) return;

        this.shapesToDelete.push(node);
        this.makeGray(node);
    }

    private makeGray(node: Konva.Shape | Konva.Stage | Konva.Node | Konva.Group) {
        node.cache();
        node.filters([Konva.Filters.Grayscale]);
    }
}