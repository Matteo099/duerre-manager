import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { IDieEditor } from "../idie-editor";

export class ZoomManager {
    public static readonly SCALES = [
        { scale: 10, step: 10, lineMode: 1  },    // 0.1 mm

        { scale: 8, step: 10, lineMode: 2 },    // 0.1 mm
        { scale: 6, step: 10, lineMode: 2 },    // 0.1 mm
        { scale: 4, step: 10, lineMode: 4 },    // 0.1 mm
        { scale: 3, step: 50, lineMode: 2 },    // 0.1 mm
        { scale: 2, step: 50, lineMode: 2 },    // 0.1 mm
        
        { scale: 1, step: 100, lineMode: 1 },    //   1 mm

        { scale: 0.8, step: 100, lineMode: 2 },    //   1 mm
        { scale: 0.6, step: 100, lineMode: 2 },    //   1 mm
        { scale: 0.4, step: 100, lineMode: 4 },    //   1 mm
        { scale: 0.2, step: 500, lineMode: 2 },    //   1 mm

        { scale: 0.1, step: 1000, lineMode: 1 }  //  10 mm
    ];

    private editor: IDieEditor;
    private currentScaleIndex = 5;

    public get currentScale() : number {
        return ZoomManager.SCALES[this.currentScaleIndex].scale;
    }
    

    constructor(editor: IDieEditor) {
        this.editor = editor;
    }

    public zoom(opts: { direction?: number, event?: KonvaEventObject<any> }) {
        // stop default scrolling
        opts.event?.evt.preventDefault();
        const stage = this.editor.stage;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition() || { x: 0, y: 0 };

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = opts.direction === undefined ? (opts.event?.evt.deltaY > 0 ? 1 : -1) : opts.direction;

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (opts.event?.evt.ctrlKey) {
            direction = -direction;
        }

        if (direction > 0) {
            this.currentScaleIndex = this.currentScaleIndex > 0 ? this.currentScaleIndex - 1 : this.currentScaleIndex;
        }
        else {
            this.currentScaleIndex = this.currentScaleIndex < ZoomManager.SCALES.length - 1 ? this.currentScaleIndex + 1 : this.currentScaleIndex;
        }

        const newScale = ZoomManager.SCALES[this.currentScaleIndex].scale;

        stage.scale({ x: newScale, y: newScale });

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        stage.position(newPos);
        stage.draw();
    }
}