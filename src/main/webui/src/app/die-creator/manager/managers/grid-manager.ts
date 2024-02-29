import Konva from "konva";
import { IDieEditor } from "../idie-editor";
import { GRID_ELEMENT, GRID_LINE, UPDATE_UNSCALE } from "../constants";
import { UnscaleFunction, UnscaleManager } from "./unscale-manager";
import { ZoomManager } from "./zoom-manager";

export class GridManager {

    public static readonly STEP_SIZE = 10;

    // public static readonly SCALES = [
    //     { scale: 5, step: 10, strokeWidth: 1 },
    //     { scale: 4, step: 10, strokeWidth: 5 },
    //     { scale: 3, step: 20, strokeWidth: 5 },
    //     { scale: 2.5, step: 20, strokeWidth: 5 },
    //     { scale: 2, step: 30, strokeWidth: 5 },
    //     { scale: 1.5, step: 30, strokeWidth: 5 },
    //     { scale: 1, step: 40, strokeWidth: 5 },
    //     { scale: 0.9, step: 50, strokeWidth: 5 },
    //     { scale: 0.8, step: 50, strokeWidth: 5 },
    //     { scale: 0.7, step: 60, strokeWidth: 5 },
    //     { scale: 0.6, step: 60, strokeWidth: 5 },
    //     { scale: 0.5, step: 70, strokeWidth: 5 },
    //     { scale: 0.4, step: 80, strokeWidth: 5 },
    //     { scale: 0.3, step: 100, strokeWidth: 10 }
    // ];
    private readonly editor: IDieEditor;
    private readonly layer: Konva.Layer;

    constructor(editor: IDieEditor) {
        this.editor = editor;
        this.layer = new Konva.Layer({ x: 0, y: 0, draggable: false });
        this.editor.stage.add(this.layer);
    }

    public destroy() {
        this.layer.destroy();
    }

    public snapToGrid(pointer: Konva.Vector2d): Konva.Vector2d {


        const scale = this.editor.stage.scale()?.x || 1;
        const stepSize = ZoomManager.SCALES.find(o => o.scale == scale)?.step || 10;

        // Calculate the offset based on the grid step size
        const gridOffset = {
            x: Math.round(pointer.x / stepSize) * stepSize,
            y: Math.round(pointer.y / stepSize) * stepSize,
        };

        return {
            x: gridOffset.x,
            y: gridOffset.y,
        };
    }

    public draw() {
        this.layer.clear();
        this.layer.destroyChildren();
        this.layer.clipWidth(); // clear any clipping
        UnscaleManager.instance?.unregisterObjectsIf(o => o.getAttr(GRID_ELEMENT));

        //debugger;

        const stage = this.editor.stage;
        const helper = this.editor.helper;
        const width = stage.width();
        const height = stage.height();

        const scale = stage.scale()?.x || 1;
        const scaleObj = ZoomManager.SCALES.find(o => o.scale == scale);
        const stepSize = scaleObj?.step ?? 100;
        const lineMode = scaleObj?.lineMode ?? 1;

        // stageRect represet the RECT of the stage (the initial view). It is constant (0, 0, width, height)
        const stageRect = {
            x1: 0,
            y1: 0,
            x2: stage.width(),
            y2: stage.height(),
            offset: {
                x: helper.unScale(stage.position().x),
                y: helper.unScale(stage.position().y),
            }
        };
        // make a rect to describe the viewport (the current view)
        const viewRect = {
            x1: -stageRect.offset.x,
            y1: -stageRect.offset.y,
            x2: helper.unScale(width) - stageRect.offset.x,
            y2: helper.unScale(height) - stageRect.offset.y
        };
        const gridOffset = {
            x: Math.ceil(helper.unScale(stage.position().x) / stepSize) * stepSize,
            y: Math.ceil(helper.unScale(stage.position().y) / stepSize) * stepSize,
        };
        const gridRect = {
            x1: -gridOffset.x,
            y1: -gridOffset.y,
            x2: helper.unScale(width) - gridOffset.x + stepSize,
            y2: helper.unScale(height) - gridOffset.y + stepSize
        };
        const gridFullRect = {
            x1: Math.min(stageRect.x1, gridRect.x1),
            y1: Math.min(stageRect.y1, gridRect.y1),
            x2: Math.max(stageRect.x2, gridRect.x2),
            y2: Math.max(stageRect.y2, gridRect.y2)
        };

        // set clip function to stop leaking lines into non-viewable space.
        this.layer.clip({
            x: viewRect.x1,
            y: viewRect.y1,
            width: viewRect.x2 - viewRect.x1,
            height: viewRect.y2 - viewRect.y1
        });

        const
            // find the x & y size of the grid
            xSize = (gridFullRect.x2 - gridFullRect.x1),
            ySize = (gridFullRect.y2 - gridFullRect.y1),

            // compute the number of steps required on each axis.
            xSteps = Math.round(xSize / stepSize),
            ySteps = Math.round(ySize / stepSize);

        let j = 0;
        // draw vertical lines
        for (let i = 0; i <= xSteps; i++) {
            const line = new Konva.Line({
                x: gridFullRect.x1 + i * stepSize,
                y: gridFullRect.y1,
                points: [0, 0, 0, ySize],
                stroke: 'rgba(0, 0, 0, 0.2)',
                strokeWidth: (++j) % lineMode == 0 ? 2 : 0.5,
            });
            line.setAttr(GRID_LINE, true);
            line.setAttr(GRID_ELEMENT, true);
            UnscaleManager.instance?.registerShape(line);
            this.layer.add(line);
        }
        j = 0;
        //draw Horizontal lines
        for (let i = 0; i <= ySteps; i++) {
            const line = new Konva.Line({
                x: gridFullRect.x1,
                y: gridFullRect.y1 + i * stepSize,
                points: [0, 0, xSize, 0],
                stroke: 'rgba(0, 0, 0, 0.2)',
                strokeWidth: (++j) % lineMode == 0 ? 2 : 0.5,
            });
            line.setAttr(GRID_LINE, true);
            line.setAttr(GRID_ELEMENT, true);
            UnscaleManager.instance?.registerShape(line);
            this.layer.add(line);
        }

        console.log(viewRect);

        // Draw a border around the viewport
        const rect = new Konva.Rect({
            x: viewRect.x1 + 2,
            y: viewRect.y1 + 2,
            width: viewRect.x2 - viewRect.x1 - 4,
            height: viewRect.y2 - viewRect.y1 - 4,
            strokeWidth: 4,
            stroke: 'blue'
        });
        rect.setAttr(GRID_ELEMENT, true);
        rect.setAttr(UPDATE_UNSCALE, (scale: number) => {
            const sw = rect.strokeWidth();
            rect.x(viewRect.x1 + sw / 2);
            rect.y(viewRect.y1 + sw / 2);
            rect.width(viewRect.x2 - viewRect.x1 - sw);
            rect.height(viewRect.y2 - viewRect.y1 - sw);
        });
        UnscaleManager.instance?.registerShape(rect);
        this.layer.add(rect);

        // this.layer.add(
        //     new Konva.Rect({
        //         x: stageRect.x1 + 2,
        //         y: stageRect.y1 + 2,
        //         width: stageRect.x2 - stageRect.x1 - 4,
        //         height: stageRect.y2 - stageRect.y1 - 4,
        //         strokeWidth: 4,
        //         stroke: 'green'
        //     }))

        // this.layer.add(
        //     new Konva.Rect({
        //         x: gridRect.x1 + 2,
        //         y: gridRect.y1 + 2,
        //         width: gridRect.x2 - gridRect.x1 - 4,
        //         height: gridRect.y2 - gridRect.y1 - 4,
        //         strokeWidth: 4,
        //         stroke: 'blue'
        //     }))

        // this.layer.add(
        //     new Konva.Rect({
        //         x: gridFullRect.x1 + 2,
        //         y: gridFullRect.y1 + 2,
        //         width: gridFullRect.x2 - gridFullRect.x1 - 4,
        //         height: gridFullRect.y2 - gridFullRect.y1 - 4,
        //         strokeWidth: 4,
        //         stroke: 'purple'
        //     }))

        this.layer.batchDraw();
    }
}