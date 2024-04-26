import Konva from "konva";
import { vec2DEquals, type Vec2D } from "../core/math/vec2d";
import type { EditorOrchestrator } from "../editor-orchestrator";
import { EManager } from "./emanager";
import { GenericManager } from "./generic-manager";
import { SnapManager } from "./snap-manager";
import { StateManager } from "./state-manager";
import { UnscaleFunction, UnscaleManager } from "./unscale-manager";

export interface Guide {
    lineGuide: number,
    orientation: 'V' | 'H',
}

export class GuidelinesManager extends GenericManager {

    private layer!: Konva.Layer;
    private lastPointerPosition?: Vec2D;
    private active = false;

    private snapManager!: SnapManager;
    private unscaleManager!: UnscaleManager;
    private stateManager!: StateManager;


    constructor(editor: EditorOrchestrator) {
        super(editor, EManager.GUIDELINE);
    }

    public setup(): void {
        this.layer = new Konva.Layer();
        this.editor.stage.add(this.layer);
        this.snapManager = this.editor.getManager(SnapManager)!;
        this.unscaleManager = this.editor.getManager(UnscaleManager)!;
        this.stateManager = this.editor.getManager(StateManager)!;
    }

    public clear(): void {
    }

    public destroy(): void {
    }

    public activate() {
        this.active = true;
        this.deleteGuides();
    }

    public update(optPointer?: Konva.Vector2d): void {
        if (!this.active) return;

        const pointer = this.snapManager.getSnapToNearest({ useEndpoints: true, pointer: optPointer }); //this.editor.stage.getRelativePointerPosition();
        if (!pointer || vec2DEquals(this.lastPointerPosition, pointer)) return;

        // clear all previous lines on the screen        
        this.deleteGuides();
        this.lastPointerPosition = pointer;

        // find possible snapping vertices - guidelines
        const guides = this.getGuideLines(pointer);
        // draw guidelines
        this.drawGuides(pointer, guides);
    }

    public deactivate() {
        this.active = false;
        this.deleteGuides();
    }

    private getGuideLines(pointer: Konva.Vector2d): Guide[] {
        const vertices = this.stateManager.getVertices();
        const guides: Guide[] = [];

        vertices.forEach(v => {
            if (!vec2DEquals(v, pointer)) {
                if (v.x == pointer.x && !guides.find(g => g.orientation == 'V'))
                    guides.push({ lineGuide: v.x, orientation: 'V' });
                if (v.y == pointer.y && !guides.find(g => g.orientation == 'H'))
                    guides.push({ lineGuide: v.y, orientation: 'H' });
            }
        });

        return guides;
    }

    private drawGuides(pointer: Konva.Vector2d, guides: Guide[]) {
        guides.forEach((lg) => {
            if (lg.orientation === 'H') {
                const line = new Konva.Line({
                    points: [-6000, 0, 6000, 0],
                    stroke: 'rgb(0, 161, 255)',
                    strokeWidth: 2,
                    name: 'guid-line',
                    dash: [10, 15],
                });
                line.absolutePosition({
                    x: pointer.x,
                    y: lg.lineGuide,
                });
                this.unscaleManager?.registerShape(line, UnscaleFunction.unscaleDash);
                this.layer.add(line);
            } else if (lg.orientation === 'V') {
                const line = new Konva.Line({
                    points: [0, -6000, 0, 6000],
                    stroke: 'rgb(0, 161, 255)',
                    strokeWidth: 2,
                    name: 'guid-line',
                    dash: [10, 15],
                });
                line.absolutePosition({
                    x: lg.lineGuide,
                    y: pointer.y,
                });
                this.unscaleManager?.registerShape(line, UnscaleFunction.unscaleDash);
                this.layer.add(line);
            }
        });
    }

    private deleteGuides() {
        this.unscaleManager?.unregisterLayer(this.layer);
        this.layer.destroyChildren();
    }
}