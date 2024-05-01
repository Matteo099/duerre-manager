import Konva from "konva";
import { EditorOrchestrator } from "../editor-orchestrator";
import { UnscaleManager } from "../managers/unscale-manager";
import { UPDATE } from "./constants";
import { BezierLine } from "./shape/bezier-line";
import { Line } from "./shape/line";
import { ExtendedShape } from "./shape/wrappers/extended-shape";
import type { IDieShapeImport } from "./shape/model/idie-shape-import";
import { CutLine } from "./shape/cut-line";
import type { IDieShapeExport } from "./shape/model/idie-shape-export";
import { StateManager } from "../managers/state-manager";

export interface ExportImageOpts {
    width: number,
    height: number,
    border: number
}

export class CoreUtils {
    public static validate(die: IDieShapeImport): IDieShapeExport {
        const container = document.createElement("div")
        container.style.display = "none";
        const editor = new EditorOrchestrator(container, false);
        const valid = editor.getManager(StateManager)?.load(die) ?? false;
        editor.destroy();
        container.remove();
        return { ...die, valid };
    }

    public static exportImage(die: IDieShapeImport, opts?: Partial<ExportImageOpts>): string {
        const container = document.createElement("div"),
            width = opts?.width ?? 300,
            height = opts?.height ?? 300,
            border = opts?.border ?? 10;

        container.style.display = "none";
        const crpStage = new Konva.Stage({
            container,
            width,
            height
        });
        const crpLayer = new Konva.Layer();
        crpStage.add(crpLayer);

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        const unscaleManager = EditorOrchestrator.instance?.getManager(UnscaleManager);

        const lastUpdate = unscaleManager?.getFlag(UPDATE);
        unscaleManager?.setFlag(UPDATE, false);

        const shapes: ExtendedShape<any>[] = [];
        die.lines.forEach(s => {
            const extShape = s.type == 'line' ? new Line({ initialPosition: { x: 0, y: 0 } }) : s.type == 'cut' ? new CutLine({ initialPosition: { x: 0, y: 0 }, color: 'purple' }) : new BezierLine({ initialPosition: { x: 0, y: 0 } })
            extShape.setPoints(s.points);
            shapes.push(extShape);
            const shape: Konva.Shape = extShape.shape;
            crpLayer.add(shape);

            const rect = extShape.calculateClientRect();
            //console.log(rect);
            minX = Math.min(minX, rect.x);
            minY = Math.min(minY, rect.y);
            maxX = Math.max(maxX, rect.x + rect.width);
            maxY = Math.max(maxY, rect.y + rect.height);
        });


        // Shift all shapes to the top-left side and scale to fit the canvas
        const scaleX = (width - border) / (maxX - minX);
        const scaleY = (height - border) / (maxY - minY);
        const scaleFactor = Math.min(scaleX, scaleY);
        const tempMinX = minX;
        const tempMinY = minY;
        minX = Infinity;
        minY = Infinity;
        maxX = -Infinity;
        maxY = -Infinity;
        shapes.forEach(s => {
            //console.log(s.getPoints());
            let i = 0;
            const points = s.getPoints().map(e => {
                if (i++ % 2 == 0) return (e - tempMinX) * scaleFactor;
                return (e - tempMinY) * scaleFactor;
            });
            s.setPoints(points);
            //console.log(points);

            const rect = s.calculateClientRect();
            minX = Math.min(minX, rect.x);
            minY = Math.min(minY, rect.y);
            maxX = Math.max(maxX, rect.x + rect.width);
            maxY = Math.max(maxY, rect.y + rect.height);
        });

        // Center in the canvas
        const translateX = (width - (maxX - minX)) / 2;
        const translateY = (height - (maxY - minY)) / 2;
        crpLayer.children.forEach(shape => {
            shape.x(shape.x() + translateX);
            shape.y(shape.y() + translateY);
        });

        unscaleManager?.setFlag(UPDATE, lastUpdate || false);

        const dataURL = crpStage.toDataURL();
        container.remove();
        return dataURL;
    }
}