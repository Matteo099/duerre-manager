import { IDieEditor } from "./idie-editor";
import { ToolHandler } from "./tool-handler";
import { fabric } from 'fabric';

export class DrawToolHandler extends ToolHandler {

    private isDrawing: boolean = false;
    private currentLine?: fabric.Line;
    private lines: fabric.Line[] = [];
    private isPolygonCreated: boolean = false;
    private measurementText?: fabric.Text;

    private startVertexGizmos?: fabric.Circle;
    private endVertexGizmos?: fabric.Circle;

    private unit: string = "mm";

    constructor(editor: IDieEditor) {
        super(editor);
    }

    override onMouseDown(event: fabric.IEvent<Event>): void {
        if (!this.isPolygonCreated) {
            // Start drawing when the user touches the canvas and no polygon is created
            this.isDrawing = true;

            const pointer = this.helper.snapToGrid(this.editor.fabricCanvas!.getPointer(event.e));

            const vertexGizmos = [this.startVertexGizmos, this.endVertexGizmos];
            const clickedGizmo = vertexGizmos.filter(g => g).find(g => {
                const gizmo = g!;
                const gizmoCenter = {
                    x: gizmo.left! + gizmo.radius!,
                    y: gizmo.top! + gizmo.radius!,
                };

                // Calculate the distance between the gizmo center and the pointer
                const distance = this.helper.calculateDistance({ x1: gizmoCenter.x, y1: gizmoCenter.y, x2: pointer.x, y2: pointer.y });

                // Check if the pointer is within the gizmo radius
                return distance <= gizmo.radius!;
            });
            console.log(clickedGizmo);

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

            // // Check if a vertex gizmo was clicked
            // const clickedGizmo = this.editor.fabricCanvas!.getObjects().find(obj => obj instanceof fabric.Circle && obj !== this.startVertexGizmos && obj.containsPoint(pointer));
            // if (clickedGizmo) {
            //     // Create a new line starting from the clicked vertex
            //     const clickedIndex = this.vertexGizmos.indexOf(clickedGizmo);
            //     const clickedLine = this.lines[clickedIndex];

            //     const newLine = new fabric.Line([clickedLine.x2, clickedLine.y2, clickedLine.x2, clickedLine.y2], {
            //         stroke: '#000',
            //         strokeWidth: 2,
            //         selectable: true,
            //         evented: false,
            //     });

            //     this.editor.fabricCanvas!.add(newLine);

            //     // Update the currentLine and lines array
            //     this.currentLine = newLine;
            //     this.lines.push(newLine);
            //     this.isDrawing = true; // Enable drawing mode for the new line
            // }

            // Create a circle gizmo at the end point of the current line
            if (this.endVertexGizmos) {
                this.editor.fabricCanvas.remove(this.endVertexGizmos);
                this.endVertexGizmos = undefined;
            }
            if (this.startVertexGizmos) this.editor.fabricCanvas.remove(this.startVertexGizmos);

            this.startVertexGizmos = new fabric.Circle({
                left: pointer.x - 5, // Adjust the positioning as needed
                top: pointer.y - 5, // Adjust the positioning as needed
                radius: 5,
                fill: 'red', // Adjust the color as needed
                selectable: false,
                evented: false,
            });
            this.editor.fabricCanvas.add(this.startVertexGizmos);
        }
    }

    override onMouseMove(event: fabric.IEvent<Event>): void {// Check if drawing mode is enabled
        if (this.isDrawing) {
            const pointer = this.helper.snapToGrid(this.editor.fabricCanvas!.getPointer(event.e));

            // Continue drawing the line
            this.currentLine?.set({ x2: pointer.x, y2: pointer.y });

            const coords = {
                x1: this.currentLine!.get('x1')!,
                y1: this.currentLine!.get('y1')!,
                x2: pointer.x,
                y2: pointer.y
            }
            // Calculate the length of the line
            const length = this.helper.calculateDistance(coords);
            const angle = this.helper.calculateAngle(coords);
            console.log(angle);
            // Update the measurement text
            this.measurementText?.set({
                text: `${length.toFixed(2)} ${this.unit}`,
                left: pointer.x,
                top: pointer.y + (angle > 180 && angle < 270 ? 5 : -30)
            });

            // Update the position of the vertex gizmo
            if (!this.endVertexGizmos) {
                this.endVertexGizmos = new fabric.Circle({
                    left: pointer.x - 5, // Adjust the positioning as needed
                    top: pointer.y - 5, // Adjust the positioning as needed
                    radius: 5,
                    borderColor: 'red', // Adjust the color as needed
                    selectable: false,
                    evented: false,
                });
                this.editor.fabricCanvas.add(this.endVertexGizmos);
            }
            this.endVertexGizmos.set({ left: pointer.x - 5, top: pointer.y - 5 }); // Adjust the positioning as needed

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
                    selectable: false,
                    evented: false,
                });

                this.editor.fabricCanvas.add(polygon);

                // Clear the array for the next set of lines
                this.lines = [];

                // Set the flag to indicate that a polygon is created
                this.isPolygonCreated = true;
            }
        }
    }
}