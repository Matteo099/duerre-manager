import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { fabric } from 'fabric';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ILineOptions, IObjectOptions } from 'fabric/fabric-impl';

@Component({
  selector: 'app-die-editor',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './die-editor.component.html',
  styleUrl: './die-editor.component.scss'
})
export class DieEditorComponent implements OnInit, AfterViewInit {

  @ViewChild('canvasParent', { static: true }) canvasParent?: ElementRef;
  @ViewChild('canvasElement', { static: true }) canvasElement?: ElementRef;

  private canvas?: fabric.Canvas;
  private isDrawing: boolean = false;
  private currentLine?: fabric.Line;
  private lines: fabric.Line[] = []; // Array to store drawn lines
  private gridSize: number = 10;
  private zoomStep: number = 0.1;
  private isPolygonCreated: boolean = false;
  private selectedTool?: Tool;

  Tool = Tool;

  ngOnInit(): void {
    this.useDrawTool();
  }

  ngAfterViewInit() {
    console.log(this.canvasElement);
    if (!this.canvasElement) return;

    // Initialize Fabric.js canvas
    this.canvas = new fabric.Canvas(this.canvasElement.nativeElement, {
      isDrawingMode: false, // Set to true if you want free drawing mode
      selection: false, // Disable object selection
    });

    // Add event listeners for touch interactions
    // http://fabricjs.com/events
    this.canvas.on('mouse:down', (event) => this.startDrawing(event));
    this.canvas.on('mouse:move', (event) => this.handleTouchDrag(event));
    this.canvas.on('mouse:up', (event) => this.handleTouchUp(event));

    this.updateCanvasSize();

    // Draw the initial grid
    this.drawGrid();
  }

  @HostListener("window:resize")
  private updateCanvasSize() {
    if (!this.canvasParent) return;

    // Set canvas size to match the outer div size
    const fullWidth = this.canvasParent.nativeElement.offsetWidth - 5;
    const fullHeight = this.canvasParent.nativeElement.offsetHeight - 5;

    this.canvas?.setDimensions({
      width: fullWidth,
      height: fullHeight
    });
  }

  handleTouchDrag(event: fabric.IEvent) {
    // Check if drawing mode is enabled
    if (this.isDrawing) {
      const pointer = this.snapToGrid(this.canvas!.getPointer(event.e));

      // Continue drawing the line
      this.currentLine?.set({ x2: pointer.x, y2: pointer.y });
      this.canvas!.renderAll();
    }
  }

  handleTouchUp(event: fabric.IEvent) {
    if (this.isDrawing && !this.isPolygonCreated) {
      // Stop drawing when the touch is released
      this.isDrawing = false;

      // Save the drawn line to the array
      this.currentLine!.setCoords();
      this.lines.push(this.currentLine!);

      // Check if the drawn lines form a closed loop (polygon)
      if (this.isClosedLoop()) {
        // Create a polygon using the lines and add it to the canvas
        const pLines = this.lines.map(l => { return { x: l.x1!, y: l.y1! } });
        const polygon = new fabric.Polygon(pLines, {
          fill: 'rgba(0, 0, 0, 0.2)',
          stroke: '#000',
          strokeWidth: 2,
          selectable: false,
          evented: false,
        });

        this.canvas!.add(polygon);

        // Clear the array for the next set of lines
        this.lines = [];

        // Set the flag to indicate that a polygon is created
        this.isPolygonCreated = true;
      }
    }

    this.handleObjectSelected(event);
  }

  handleObjectSelected(event: fabric.IEvent) {
    // Enable editing of the selected object (e.g., polygon vertices)
    const selectedObject = event.target;
    console.log(event, event.target);
    if (!selectedObject) return;
    console.log(selectedObject);
    selectedObject.set({

      //  editable: true 
    });
    this.canvas!.renderAll();
  }

  startDrawing(event: fabric.IEvent) {
    if (!this.isPolygonCreated) {
      // Start drawing when the user touches the canvas and no polygon is created
      this.isDrawing = true;

      const pointer = this.snapToGrid(this.canvas!.getPointer(event.e));

      // Create a new line and add it to the canvas
      this.currentLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: '#000',
        strokeWidth: 2,
        selectable: true,
        evented: false,
      });

      this.canvas!.add(this.currentLine);
    }
  }

  snapToGrid(pointer: { x: number, y: number }): fabric.Point {
    // Round the coordinates to the nearest grid point
    const x = Math.round(pointer.x / this.gridSize) * this.gridSize;
    const y = Math.round(pointer.y / this.gridSize) * this.gridSize;

    return new fabric.Point(x, y);
  }

  isClosedLoop(): boolean {
    // Check if the last drawn line connects to the first line
    if (this.lines.length >= 2) {
      const firstLine = this.lines[0];
      const lastLine = this.lines[this.lines.length - 1];

      // Tolerance value to account for small variations due to snapping
      const tolerance = 5;

      return (
        Math.abs(firstLine.x1! - lastLine.x2!) < tolerance &&
        Math.abs(firstLine.y1! - lastLine.y2!) < tolerance
      );
    }

    return false;
  }

  zoomIn() {
    // Zoom in by multiplying the current zoom level by (1 + zoomStep)
    const newZoom = this.canvas!.getZoom() * (1 + this.zoomStep);
    this.canvas!.setZoom(newZoom);

    // Redraw the grid with updated positions
    this.clearGrid();
    this.drawGrid();

    this.canvas!.renderAll();
  }

  zoomOut() {
    // Zoom out by dividing the current zoom level by (1 + zoomStep)
    const newZoom = this.canvas!.getZoom() / (1 + this.zoomStep);
    this.canvas!.setZoom(newZoom);

    // Redraw the grid with updated positions
    this.clearGrid();
    this.drawGrid();

    this.canvas!.renderAll();
  }

  useSelectTool() {
    if(!this.canvas) return;

    this.selectedTool = Tool.SELECT;
    this.canvas.selection = true;
  }
  useDrawTool() {
    if(!this.canvas) return;

    this.selectedTool = Tool.DRAW;
    this.canvas.selection = false;
  }
  useEraserTool() {
    if(!this.canvas) return;

    this.selectedTool = Tool.ERASER;
  }
  useMoveTool() {
    if(!this.canvas) return;

    this.selectedTool = Tool.MOVE;
  }
  restoreZoom() { }

  //#region GRID

  clearGrid() {
    // Remove all existing grid lines from the canvas
    this.canvas!.getObjects().forEach(obj => {
      if (obj.data?.group === 'gridLine') {
        this.canvas!.remove(obj);
      }
    });
  }

  drawGrid() {
    const width = this.canvas!.getWidth();
    const height = this.canvas!.getHeight();
    const zoom = this.canvas!.getZoom();

    // Calculate the effective grid size based on the current zoom level
    const effectiveGridSize = this.gridSize * zoom;
    const lineOptions: ILineOptions = {
      stroke: '#ddd',
      selectable: false,
      evented: false,
      data: {
        group: 'gridLine',
      }
    };
    // Draw horizontal grid lines
    for (let y = 0; y <= height; y += effectiveGridSize) {
      const line = new fabric.Line([0, y, width, y], lineOptions);
      this.canvas!.add(line);
    }

    // Draw vertical grid lines
    for (let x = 0; x <= width; x += effectiveGridSize) {
      const line = new fabric.Line([x, 0, x, height], lineOptions);
      this.canvas!.add(line);
    }
  }

  //#endregion

  undo() { }
  redo() { }
  save() { }
  cancel() { }

  getColor(tool: Tool) {
    if (this.selectedTool == tool)
      return "warn";
    return "primary";
  }
}
