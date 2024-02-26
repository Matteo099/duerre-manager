import Konva from "konva";
import { ExtVector2d } from "../die-editor-manager";
import { IDieEditor } from "../idie-editor";
import { KonvaUtils } from "../konva-utils";
import { UnscaleFunction, UnscaleManager } from "./unscale-manager";

export interface Guide {
    lineGuide: number,
    orientation: 'V' | 'H',
}

export class GuidelinesManager {

    private readonly layer: Konva.Layer;
    private readonly editor: IDieEditor;
    private lastPointerPosition?: ExtVector2d;

    private active = false;

    constructor(editor: IDieEditor) {
        this.editor = editor;
        this.layer = new Konva.Layer();
        this.editor.stage.add(this.layer);
    }

    public activate() {
        this.active = true;
        this.deleteGuides();
    }

    public update(optPointer?: Konva.Vector2d): void {
        if (!this.active) return;

        const pointer = this.editor.getSnapToNearest({ useEndpoints: true, pointer: optPointer }); //this.editor.stage.getRelativePointerPosition();
        if (!pointer || KonvaUtils.v2Equals(this.lastPointerPosition, pointer)) return;

        // clear all previous lines on the screen        
        this.deleteGuides();
        this.lastPointerPosition = pointer;

        // find possible snapping vertices - guidelines
        const guides = this.getGuideLines(pointer);
        // draw guidelines
        this.drawGuides(pointer, guides);
        console.log("drawGuides", pointer, guides);
    }
    
    public deactivate() {
        this.active = false;
        this.deleteGuides();
    }

    private getGuideLines(pointer: Konva.Vector2d): Guide[] {
        const vertices = this.editor.state.getVertices();
        const guides: Guide[] = [];

        vertices.forEach(v => {
            if (!KonvaUtils.v2Equals(v, pointer)) {
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
                UnscaleManager.instance?.registerShape(line, UnscaleFunction.unscaleDash);
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
                UnscaleManager.instance?.registerShape(line, UnscaleFunction.unscaleDash);
                this.layer.add(line);
            }
        });
    }

    private deleteGuides() {
        UnscaleManager.instance?.unregisterLayer(this.layer);
        this.layer.destroyChildren();
    }
}