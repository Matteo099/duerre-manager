import Konva from "konva";
import { IDieEditor } from "../idie-editor";
import { KonvaEventObject } from "konva/lib/Node";

export interface LineGuideStop {
    vertical: number[];
    horizontal: number[];
}

export interface Guide {
    lineGuide: number,
    orientation: 'V' | 'H',
}

export class GuidelinesManager {

    public static readonly GUIDELINE_OFFSET = 5;

    private readonly layer: Konva.Layer;
    private readonly editor: IDieEditor;

    constructor(editor: IDieEditor) {
        this.editor = editor;
        this.layer = this.editor.layer;
    }

    // This method should be replaced by the vertex available from this.editor.state.getVertices()
    public getLineGuideStops(skipPoint: Konva.Vector2d): LineGuideStop {
        const stage = this.editor.stage;
        const vertices = this.editor.state.getVertices();

        // we can snap to stage borders and the center of the stage
        const vertical: number[][] = [[0, stage.width() / 2, stage.width()]];
        const horizontal: number[][] = [[0, stage.height() / 2, stage.height()]];

        // and we snap over edges and center of each object on the canvas
        vertices.forEach((guideItem) => {
            if (guideItem === skipPoint) {
                return;
            }

            // and we can snap to all edges of shapes
            vertical.push([guideItem.x]);
            horizontal.push([guideItem.y]);
        });
        return {
            vertical: vertical.flat(),
            horizontal: horizontal.flat(),
        };
    }

    public getGuides(lineGuideStops: LineGuideStop, pointer: Konva.Vector2d): Guide[] {
        const resultV: { lineGuide: number, diff: number }[] = [];
        const resultH: { lineGuide: number, diff: number }[] = [];

        lineGuideStops.vertical.forEach((lineGuide) => {
            const diff = Math.abs(lineGuide - pointer.y);
            // if the distance between guild line and object snap point is close we can consider this for snapping
            if (diff < GuidelinesManager.GUIDELINE_OFFSET) {
                resultV.push({
                    lineGuide: lineGuide,
                    diff: diff
                });
            }
        });

        lineGuideStops.horizontal.forEach((lineGuide) => {
            const diff = Math.abs(lineGuide - pointer.x);
            if (diff < GuidelinesManager.GUIDELINE_OFFSET) {
                resultH.push({
                    lineGuide: lineGuide,
                    diff: diff,
                });
            }
        });

        const guides: Guide[] = [];

        // find closest snap
        const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
        const minH = resultH.sort((a, b) => a.diff - b.diff)[0];
        if (minV) {
            guides.push({
                lineGuide: minV.lineGuide!,
                orientation: 'V',
            });
        }
        if (minH) {
            guides.push({
                lineGuide: minH.lineGuide!,
                orientation: 'H',
            });
        }
        return guides;
    }

    public drawGuides(guides: Guide[]) {
        guides.forEach((lg) => {
            if (lg.orientation === 'H') {
                var line = new Konva.Line({
                    points: [-6000, 0, 6000, 0],
                    stroke: 'rgb(0, 161, 255)',
                    strokeWidth: 1,
                    name: 'guid-line',
                    dash: [4, 6],
                });
                this.layer.add(line);
                line.absolutePosition({
                    x: 0,
                    y: lg.lineGuide,
                });
            } else if (lg.orientation === 'V') {
                var line = new Konva.Line({
                    points: [0, -6000, 0, 6000],
                    stroke: 'rgb(0, 161, 255)',
                    strokeWidth: 1,
                    name: 'guid-line',
                    dash: [4, 6],
                });
                this.layer.add(line);
                line.absolutePosition({
                    x: lg.lineGuide,
                    y: 0,
                });
            }
        });
    }

    public onMouseMove(event: KonvaEventObject<any>) {
        // clear all previous lines on the screen        
        this.deleteGuides();

        const pointer = this.editor.stage.getRelativePointerPosition();
        if (!pointer) return;

        // find possible snapping lines
        const lineGuideStops = this.getLineGuideStops(pointer);
        // now find where can we snap current object
        const guides = this.getGuides(lineGuideStops, pointer);
    }

    public onDragMove(event: KonvaEventObject<any>) {
        // clear all previous lines on the screen        
        this.deleteGuides();

        console.log(event);

        const pointer = this.editor.getSnappedToNearObject().v;

        // find possible snapping lines
        const lineGuideStops = this.getLineGuideStops(pointer);
        // now find where can we snap current object
        const guides = this.getGuides(lineGuideStops, pointer);

        // do nothing of no snapping
        if (!guides.length) {
            return;
        }

        this.drawGuides(guides);

        const absPos = event.target.absolutePosition();
        // now force object position
        guides.forEach((lg) => {

            switch (lg.orientation) {
                case 'V': {
                    absPos.x = lg.lineGuide;
                    break;
                }
                case 'H': {
                    absPos.y = lg.lineGuide;
                    break;
                }
            }
        });
        event.target.absolutePosition(absPos);
    }

    public onDragEnd(event: KonvaEventObject<any>) {
        // clear all previous lines on the screen
        this.deleteGuides();
    }

    private deleteGuides() {
        this.layer.find('.guid-line').forEach((l) => l.destroy());
    }
}