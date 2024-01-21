import { ElementRef } from "@angular/core";
import fabric from "fabric/fabric-impl";

class DieEditorManager implements IDieEditor {

    private canvas: fabric.Canvas;
    private selectedTool?: Tool;

    private selectHandler: SelectToolHandler;
    private drawHandler: DrawToolHandler;
    private eraserHandler: EraserToolHandler;
    private moveHandler: MoveToolHandler;

    get fabricCanvas(): fabric.Canvas { return this.canvas; }
    get gridSize(): number { return 10; }

    constructor(canvasElement: ElementRef) {
        this.canvas = this.createCanvas(canvasElement);
        this.selectHandler = new SelectToolHandler(this);
        this.drawHandler = new DrawToolHandler(this);
        this.eraserHandler = new EraserToolHandler(this);
        this.moveHandler = new MoveToolHandler(this);
        this.setupListeners();
    }

    private createCanvas(canvasElement: ElementRef): fabric.Canvas {
        return new fabric.Canvas(canvasElement.nativeElement, {
            isDrawingMode: false, // Set to true if you want free drawing mode
            selection: false, // Disable object selection
        });
    }

    private setupListeners() {
        this.canvas.on('mouse:down', (event) => this.handleMouseDown(event));
        this.canvas.on('mouse:move', (event) => this.handleMouseMove(event));
        this.canvas.on('mouse:up', (event) => this.handleMouseUp(event));
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

    private getToolHandler(): ToolHandler | undefined {
        switch (this.selectedTool) {
            case Tool.SELECT:
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

    public useTool(tool: Tool) {
        this.selectedTool = tool;
    }

    public resize(canvasParent: ElementRef) {
        // Set canvas size to match the outer div size
        const fullWidth = canvasParent.nativeElement.offsetWidth - 5;
        const fullHeight = canvasParent.nativeElement.offsetHeight - 5;

        this.canvas.setDimensions({
            width: fullWidth,
            height: fullHeight
        });
    }
}