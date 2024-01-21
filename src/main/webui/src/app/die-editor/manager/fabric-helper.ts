import { fabric } from 'fabric';
import { IDieEditor } from "./idie-editor";

export class FabricHelper {

    private editor: IDieEditor;

    constructor(editor: IDieEditor) {
        this.editor = editor;
    }

    public snapToGrid(pointer: { x: number, y: number }): fabric.Point {
        const zoom = this.editor.fabricCanvas.getZoom();
        const gridSize = this.editor.gridSize * zoom;
        console.log( gridSize, zoom);

        // Round the coordinates to the nearest grid point
        const x = Math.round(pointer.x / gridSize) * gridSize;
        const y = Math.round(pointer.y / gridSize) * gridSize;

        return new fabric.Point(x, y);
    }

    public isClosedLoop(lines: fabric.Line[]): boolean {
        // Check if the last drawn line connects to the first line
        if (lines.length >= 2) {
            const firstLine = lines[0];
            const lastLine = lines[lines.length - 1];

            // Tolerance value to account for small variations due to snapping
            const tolerance = 5;

            return (
                Math.abs(firstLine.x1! - lastLine.x2!) < tolerance &&
                Math.abs(firstLine.y1! - lastLine.y2!) < tolerance
            );
        }

        return false;
    }

    public calculateDistance(coords: {x1: number, y1: number, x2: number, y2: number}): number {
        return Math.sqrt(Math.pow(coords.x2 - coords.x1, 2) + Math.pow(coords.y2 - coords.y1, 2));
    }

    public calculateAngle(coords: {x1: number, y1: number, x2: number, y2: number}): number {
        const angleRad = Math.atan2(coords.y2 - coords.y1, coords.x2 - coords.x1);
        let angleDeg = (angleRad * 180) / Math.PI;
    
        // Ensure the angle is positive
        if (angleDeg < 0) {
            angleDeg += 360;
        }
    
        return 360 - angleDeg;
    }
}