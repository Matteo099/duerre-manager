import { ElementRef } from "@angular/core";
import { DrawToolHandler } from "./draw-tool-handler";
import { EraserToolHandler } from "./eraser-tool-handler";
import { IDieEditor } from "./idie-editor";
import { MoveToolHandler } from "./move-tool-handler";
import { EditToolHandler } from "./edit-tool-handler";
import { Tool } from "./tool";
import { ToolHandler } from "./tool-handler";
import { fabric } from 'fabric';

export class DieEditorManager implements IDieEditor {

    private canvas: fabric.Canvas;
    private _selectedTool?: Tool;

    private selectHandler: EditToolHandler;
    private drawHandler: DrawToolHandler;
    private eraserHandler: EraserToolHandler;
    private moveHandler: MoveToolHandler;

    private tools: ToolHandler[] = [];

    get fabricCanvas(): fabric.Canvas { return this.canvas; }
    get gridSize(): number { return 10; }
    get zoomStep(): number { return 1; }
    get selectedTool(): Tool | undefined { return this._selectedTool; }

    constructor(canvasElement: ElementRef) {
        this.canvas = this.createCanvas(canvasElement);
        this.selectHandler = new EditToolHandler(this);
        this.drawHandler = new DrawToolHandler(this);
        this.eraserHandler = new EraserToolHandler(this);
        this.moveHandler = new MoveToolHandler(this);
        this.tools = [this.selectHandler, this.drawHandler, this.eraserHandler, this.moveHandler];
        this.setupListeners();
        this.drawGrid();
    }

    private createCanvas(canvasElement: ElementRef): fabric.Canvas {
        return new fabric.Canvas(canvasElement.nativeElement, {
            isDrawingMode: false, // Set to true if you want free drawing mode
            selection: false, // Disable object selection
            hoverCursor: 'pointer'
        });
    }

    private setupListeners() {
        this.canvas.on('mouse:down', (event) => this.handleMouseDown(event));
        this.canvas.on('mouse:move', (event) => this.handleMouseMove(event));
        this.canvas.on('mouse:up', (event) => this.handleMouseUp(event));
        this.canvas.on('object:moving', (event) => this.handleObjectMove(event));
    }

    private handleMouseDown(event: fabric.IEvent) {
        this.getToolHandler()?.onMouseDown(event);
    }

    private handleMouseMove(event: fabric.IEvent) {
        this.getToolHandler()?.onMouseMove(event);
    }

    private handleMouseUp(event: fabric.IEvent) {
        this.getToolHandler()?.onMouseUp(event);
    }

    private handleObjectMove(event: fabric.IEvent) {
        this.getToolHandler()?.onObjectMove(event);
    }

    private getToolHandler(): ToolHandler | undefined {
        switch (this._selectedTool) {
            case Tool.EDIT:
                return this.selectHandler;
            case Tool.DRAW:
                return this.drawHandler;
            case Tool.ERASER:
                return this.eraserHandler;
            case Tool.MOVE:
                return this.moveHandler;
            default:
                return undefined;
        }
    }

    private clearGrid() {
        // Remove all existing grid lines from the canvas
        this.canvas.getObjects().forEach(obj => {
            if (obj.data?.group === 'gridLine') {
                this.canvas.remove(obj);
            }
        });
    }

    private drawGrid() {
        this.clearGrid();
        const width = this.canvas.getWidth();
        const height = this.canvas.getHeight();
        const zoom = this.canvas.getZoom();


        // Calculate the effective grid size based on the current zoom level
        const effectiveGridSize = this.gridSize * zoom;
        console.log(width, height, zoom, effectiveGridSize);
        const lineOptions: fabric.ILineOptions = {
            stroke: '#ddd',
            strokeWidth: 1,
            selectable: false,
            evented: false,
            data: {
                group: 'gridLine',
            }
        };
        // Draw horizontal grid lines
        for (let y = 0; y <= height / zoom; y += effectiveGridSize) {
            const line = new fabric.Line([0, y, width / zoom, y], lineOptions);
            this.canvas.add(line);
            this.canvas.sendToBack(line);
        }

        // Draw vertical grid lines
        for (let x = 0; x <= width / zoom; x += effectiveGridSize) {
            const line = new fabric.Line([x, 0, x, height / zoom], lineOptions);
            this.canvas.add(line);
            this.canvas.sendToBack(line);
        }
    }

    public useTool(tool: Tool) {
        this.getToolHandler()?.onToolDeselected();
        this._selectedTool = tool;
        this.getToolHandler()?.onToolSelected();
    }

    public resize(canvasParent: ElementRef) {
        // Set canvas size to match the outer div size
        const fullWidth = canvasParent.nativeElement.offsetWidth - 5;
        const fullHeight = canvasParent.nativeElement.offsetHeight - 5;

        this.canvas.setDimensions({
            width: fullWidth,
            height: fullHeight
        });

        this.drawGrid();
    }

    public zoomIn() {
        // Zoom in by multiplying the current zoom level by (1 + zoomStep)
        const newZoom = this.canvas!.getZoom() * (1 + this.zoomStep);
        this.canvas!.setZoom(newZoom);

        // Redraw the grid with updated positions
        this.clearGrid();
        this.drawGrid();

        this.canvas!.renderAll();
    }

    public zoomOut() {
        // Zoom out by dividing the current zoom level by (1 + zoomStep)
        const newZoom = this.canvas!.getZoom() / (1 + this.zoomStep);
        this.canvas!.setZoom(newZoom);

        // Redraw the grid with updated positions
        this.clearGrid();
        this.drawGrid();

        this.canvas!.renderAll();
    }

    public resetZoom() {
        this.canvas.setZoom(1);
        // Redraw the grid with updated positions
        this.clearGrid();
        this.drawGrid();

        this.canvas!.renderAll();
    }

    public clear() {
        this.canvas.clear();
        this.tools.forEach(t => {
            t.reset();
        });
        this.resetZoom();
    }

    public getResult(): {
        jsonData: {
            version: string;
            objects: fabric.Object[];
        }, dataURL: string
    } {
        // Filter out objects based on the data.group property
        const objectsToSave = this.canvas.getObjects().filter(obj => !obj.data || obj.data.group === 'save');

        // Create a new canvas to clone and save only the required objects
        const saveCanvas = new fabric.Canvas(null, {
            width: this.fabricCanvas.getWidth(),
            height: this.fabricCanvas.getHeight(),
        });
        saveCanvas.setZoom(this.fabricCanvas.getZoom());

        // Clone and add the filtered objects to the new canvas
        objectsToSave.forEach(obj => {
            const clonedObj = fabric.util.object.clone(obj);
            saveCanvas.add(clonedObj);
        });

        const jsonData = saveCanvas.toJSON();
        const dataURL = saveCanvas.toDataURL({ format: 'png', multiplier: 2 });

        return { jsonData, dataURL };
    }

    public getCroppedResult(): {
        jsonData: {
            version: string;
            objects: fabric.Object[];
        };
        dataURL: string;
    } {
        // Filter out objects based on the data.group property
        const objectsToSave = this.canvas.getObjects().filter(obj => !obj.data || obj.data.group === 'save');

        // Get the bounding box of the non-empty objects
        const boundingBox = this.getBoundingBox(objectsToSave);

        // Set the desired size for the resulting image (in mm)
        const targetWidth = 300;
        const targetHeight = 300;

        // Calculate the offset to adjust object positions based on the bounding box
        const offsetX = Math.abs(boundingBox.left!);
        const offsetY = Math.abs(boundingBox.top!);

        // Create a new canvas with the target size
        const croppedCanvas = new fabric.Canvas(null, {
            width: targetWidth,
            height: targetHeight,
            backgroundColor: "black"
        });

        // Clone and add the filtered objects to the new canvas
        objectsToSave.forEach(obj => {
            const clonedObj: fabric.Object = fabric.util.object.clone(obj);

            clonedObj.set({
                left: clonedObj.left! - offsetX,
                top: clonedObj.top! - offsetY,
                fill: "white"
            });
            clonedObj.setCoords();
            // Adjust object positions based on the offset
            // clonedObj.left! -= offsetX;
            // clonedObj.top! -= offsetY;
            // clonedObj.calcCoords();

            // if ('points' in clonedObj)
            //     (clonedObj as any).points.forEach((point: fabric.Point) => {
            //         point.x -= offsetX;
            //         point.y -= offsetY;
            //     });
            // clonedObj.fill = "white";

            croppedCanvas.add(clonedObj);
        });
        croppedCanvas.renderAll();

        const jsonData = croppedCanvas.toJSON();
        const dataURL = croppedCanvas.toDataURL({ format: 'png', multiplier: 2 });

        return { jsonData, dataURL };
    }

    private getBoundingBox(objects: fabric.Object[]): fabric.Rect {
        // Calculate the bounding box of the non-empty objects
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        objects.forEach(obj => {
            const objectBoundingBox = obj.getBoundingRect();
            minX = Math.min(minX, objectBoundingBox.left);
            minY = Math.min(minY, objectBoundingBox.top);
            maxX = Math.max(maxX, objectBoundingBox.left + objectBoundingBox.width);
            maxY = Math.max(maxY, objectBoundingBox.top + objectBoundingBox.height);
        });

        return new fabric.Rect({ left: minX, top: minY, width: maxX - minX, height: maxY - minY });
    }
}