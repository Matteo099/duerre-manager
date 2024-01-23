import { IDieEditor } from "./idie-editor";
import { ToolHandler } from "./tool-handler";
import { fabric } from 'fabric';

export class DrawToolHandler extends ToolHandler {

    private isDrawing: boolean = false;
    private currentLine?: fabric.Line;
    private lines: fabric.Line[] = [];
    private isPolygonCreated: boolean = false;
    private measurementText?: fabric.Text;

    private vertexGizmos: { id: string, shape: fabric.Circle }[] = [];

    private unit: string = "mm";

    constructor(editor: IDieEditor) {
        super(editor);
    }

    override onMouseDown(event: fabric.IEvent<Event>): void {
        if (!this.isPolygonCreated) {
            // Start drawing when the user touches the canvas and no polygon is created
            this.isDrawing = true;

            const pointer = this.helper.snapToGrid(this.editor.fabricCanvas!.getPointer(event.e));
            this.createGizmosIfOverVertex(pointer, "down");

            // Create a new line and add it to the canvas
            this.currentLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                stroke: '#000',
                strokeWidth: 2,
                selectable: true,
                evented: false,
            });
            this.editor.fabricCanvas.add(this.currentLine);

            // Create a text element for displaying the measurement above the line
            this.measurementText = new fabric.Text('0', {
                left: pointer.x,
                top: pointer.y - 30, // Adjust the vertical position as needed
                fontSize: 24,
                selectable: false,
                evented: false,
            });
            this.editor.fabricCanvas.add(this.measurementText);
        }
    }

    override onMouseMove(event: fabric.IEvent<Event>): void {// Check if drawing mode is enabled
        if (this.isDrawing) {
            const pointer = this.helper.snapToGrid(this.editor.fabricCanvas!.getPointer(event.e));

            // Continue drawing the line
            this.currentLine?.set({ x2: pointer.x, y2: pointer.y });

            // check if hover another vertex add gizmos
            this.createGizmosIfOverVertex(pointer, "move");

            const coords = {
                x1: this.currentLine!.get('x1')!,
                y1: this.currentLine!.get('y1')!,
                x2: pointer.x,
                y2: pointer.y
            }
            // Calculate the length of the line
            const length = this.helper.calculateDistance(coords);
            const angle = this.helper.calculateAngle(coords);

            // Update the measurement text
            this.measurementText?.set({
                text: `${length.toFixed(2)} ${this.unit}`,
                left: pointer.x,
                top: pointer.y + (angle > 180 && angle < 270 ? 5 : -30)
            });

            this.editor.fabricCanvas.renderAll();
        }
    }

    override onMouseUp(event: fabric.IEvent<Event>): void {
        if (this.isDrawing && !this.isPolygonCreated) {
            // Stop drawing when the touch is released
            this.isDrawing = false;

            // Clean up the measurement text
            this.editor.fabricCanvas.remove(this.measurementText!);
            this.measurementText = undefined;

            // Save the drawn line to the array
            this.currentLine!.setCoords();

            this.gizmos.removeGizmos();

            // Do not save points (line with length = 0)
            if (this.helper.calculateLength(this.currentLine!) <= 0) {
                return;
            }

            this.lines.push(this.currentLine!);

            // Check if the drawn lines form a closed loop (polygon)
            if (this.helper.isClosedLoop(this.lines)) {
                // Create a polygon using the lines and add it to the canvas
                const pLines = this.lines.map(l => { return { x: l.x1!, y: l.y1! } });
                const polygon = new fabric.Polygon(pLines, {
                    fill: 'rgba(0, 0, 0, 0.2)',
                    stroke: '#000',
                    strokeWidth: 2,
                    selectable: true,
                    evented: false,
                });

                this.editor.fabricCanvas.add(polygon);

                // Clear the array for the next set of lines
                this.lines.forEach(l => this.editor.fabricCanvas.remove(l));
                this.lines = [];

                // Set the flag to indicate that a polygon is created
                this.isPolygonCreated = true;
            }
        }
    }

    private createGizmosIfOverVertex(pointer: fabric.Point, id: string) {
        const clickedPoint = this.lines
            .flatMap(line => [
                { x: line.x1!, y: line.y1! },
                { x: line.x2!, y: line.y2! },
            ])
            .find(vertex => this.helper.calculateDistance({ x1: vertex.x, y1: vertex.y, x2: pointer.x, y2: pointer.y }) <= 1);
        if(clickedPoint) this.gizmos.addVertexGizmos(clickedPoint, id);
    }
}