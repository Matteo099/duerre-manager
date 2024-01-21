class FabricHelper {

    private editor: IDieEditor;

    constructor(editor: IDieEditor) {
        this.editor = editor;
    }

    public snapToGrid(pointer: { x: number, y: number }): fabric.Point {
        // Round the coordinates to the nearest grid point
        const x = Math.round(pointer.x / this.editor.gridSize) * this.editor.gridSize;
        const y = Math.round(pointer.y / this.editor.gridSize) * this.editor.gridSize;

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
}