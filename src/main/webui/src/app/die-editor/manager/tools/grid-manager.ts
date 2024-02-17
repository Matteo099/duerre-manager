import Konva from "konva";
import { IDieEditor } from "../idie-editor";

export class GridManager {

    public static readonly STEP_SIZE = 10;

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

    public draw() {
        this.layer.clear();
        this.layer.destroyChildren();
        this.layer.clipWidth(); // clear any clipping

        const stage = this.editor.stage;
        const helper = this.editor.helper;
        const width = stage.width();
        const height = stage.height();
        const stepSize = GridManager.STEP_SIZE;

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
        // make a rect to describe the viewport
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

        // draw vertical lines
        for (let i = 0; i <= xSteps; i++) {
            this.layer.add(
                new Konva.Line({
                    x: gridFullRect.x1 + i * stepSize,
                    y: gridFullRect.y1,
                    points: [0, 0, 0, ySize],
                    stroke: 'rgba(0, 0, 0, 0.2)',
                    strokeWidth: 1,
                })
            );
        }
        //draw Horizontal lines
        for (let i = 0; i <= ySteps; i++) {
            this.layer.add(
                new Konva.Line({
                    x: gridFullRect.x1,
                    y: gridFullRect.y1 + i * stepSize,
                    points: [0, 0, xSize, 0],
                    stroke: 'rgba(0, 0, 0, 0.2)',
                    strokeWidth: 1,
                })
            );
        }

        // Draw a border around the viewport
        this.layer.add(
            new Konva.Rect({
                x: viewRect.x1 + 2,
                y: viewRect.y1 + 2,
                width: viewRect.x2 - viewRect.x1 - 4,
                height: viewRect.y2 - viewRect.y1 - 4,
                strokeWidth: 4,
                stroke: 'red'
            }))

        this.layer.batchDraw();
    }
}