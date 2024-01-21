class DrawToolHandler extends ToolHandler {

    private isDrawing: boolean = false;
    private currentLine?: fabric.Line;
    private lines: fabric.Line[] = []; 
    private isPolygonCreated: boolean = false;

    constructor(editor: IDieEditor) {
        super(editor);
    }

    override onMouseDown(event: fabric.IEvent<Event>): void {
        if (!this.isPolygonCreated) {
            // Start drawing when the user touches the canvas and no polygon is created
            this.isDrawing = true;

            const pointer = this.helper.snapToGrid(this.editor.fabricCanvas!.getPointer(event.e));

            // Create a new line and add it to the canvas
            this.currentLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                stroke: '#000',
                strokeWidth: 2,
                selectable: true,
                evented: false,
            });

            this.editor.fabricCanvas!.add(this.currentLine);
        }
    }

    override onMouseMove(event: fabric.IEvent<Event>): void {// Check if drawing mode is enabled
        if (this.isDrawing) {
            const pointer = this.helper.snapToGrid(this.editor.fabricCanvas!.getPointer(event.e));

            // Continue drawing the line
            this.currentLine?.set({ x2: pointer.x, y2: pointer.y });
            this.editor.fabricCanvas!.renderAll();
        }
    }

    override onMouseUp(event: fabric.IEvent<Event>): void {
        if (this.isDrawing && !this.isPolygonCreated) {
            // Stop drawing when the touch is released
            this.isDrawing = false;

            // Save the drawn line to the array
            this.currentLine!.setCoords();
            this.lines.push(this.currentLine!);

            // Check if the drawn lines form a closed loop (polygon)
            if (this.helper.isClosedLoop(this.lines)) {
                // Create a polygon using the lines and add it to the canvas
                const pLines = this.lines.map(l => { return { x: l.x1!, y: l.y1! } });
                const polygon = new fabric.Polygon(pLines, {
                    fill: 'rgba(0, 0, 0, 0.2)',
                    stroke: '#000',
                    strokeWidth: 2,
                    selectable: false,
                    evented: false,
                });

                this.editor.fabricCanvas!.add(polygon);

                // Clear the array for the next set of lines
                this.lines = [];

                // Set the flag to indicate that a polygon is created
                this.isPolygonCreated = true;
            }
        }
    }
}