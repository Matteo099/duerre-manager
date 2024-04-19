import Konva from "konva";
import type { Ref } from "vue";
import type { DieState } from "../manager/die-state";
import { EManager } from "./managers/emanager";
import { EventManager } from "./managers/event-manager";
import type { GenericManager } from "./managers/generic-manager";
import { GridManager } from "./managers/grid-manager";
import type { GenericToolHandler } from "./tools/generic-tool-handler";
import { UndoRedoManager } from "./managers/undo-redo-manager";
import { UnscaleManager } from "./managers/unscale-manager";
import { ZoomManager } from "./managers/zoom-manager";
import { GuidelinesManager } from "./managers/guidelines-manager";
import { LiteEvent } from "./core/event/lite-event";
import type { ILiteEvent } from "./core/event/ilite-event";
import { Tool } from "./tools/tool";
import { EditToolHandler } from "./tools/edit-tool-handler";
import { DrawToolHandler } from "./tools/draw-tool-handler";
import { EraserToolHandler } from "./tools/eraser-tool-handler";
import { MoveToolHandler } from "./tools/move-tool-handler";
import { CutToolHandler } from "./tools/cut-tool-handler";
import { StateManager } from "./managers/state-manager";

export class EditorOrchestrator {

    private _stage!: Konva.Stage;
    private _layer!: Konva.Layer;
    private _selectedTool?: Tool;
    private readonly onBeforeSwitchTool = new LiteEvent<void>();
    private readonly onAfterSwitchTool = new LiteEvent<void>();

    private tools: Map<Tool, GenericToolHandler> = new Map();
    private managers: GenericManager[] = [];

    public get BeforeSwitchTool(): ILiteEvent<void> {
        return this.onBeforeSwitchTool.expose();
    }
    public get AfterSwitchTool(): ILiteEvent<void> {
        return this.onAfterSwitchTool.expose();
    }
    public get stage(): Konva.Stage { return this._stage; }
    public get layer(): Konva.Layer { return this._layer; }
    public get selectedTool(): Tool | undefined { return this._selectedTool; }

    constructor(stageContainer: Ref<HTMLDivElement>) {
        this.createCanvas(stageContainer);
        this.createTools();
        this.createManagers();

        this.setup();

        // this.resetZoom();
    }

    private createCanvas(stageContainer: Ref<HTMLDivElement>) {
        this._stage = new Konva.Stage({
            container: stageContainer.value,
            width: stageContainer.value.offsetWidth,
            height: stageContainer.value.offsetHeight,
            draggable: false
        });

        this._layer = new Konva.Layer();
        this.stage.add(this.layer);
    }

    private createTools() {
        this.tools.set(Tool.EDIT, new EditToolHandler(this))
        this.tools.set(Tool.DRAW_CURVE | Tool.DRAW_LINE, new DrawToolHandler(this))
        this.tools.set(Tool.ERASER, new EraserToolHandler(this))
        this.tools.set(Tool.MOVE, new MoveToolHandler(this))
        this.tools.set(Tool.CUT, new CutToolHandler(this))
    }

    private createManagers() {
        this.managers.push(new GuidelinesManager(this))
        this.managers.push(new ZoomManager(this))
        this.managers.push(new UnscaleManager(this))
        this.managers.push(new UndoRedoManager(this))
        this.managers.push(new GridManager(this))
        this.managers.push(new EventManager(this))
        this.managers.push(new StateManager(this))
    }

    private setup() {
        this.managers.forEach(m => m.setup());
        this.tools.forEach((v, _) => v.setup());
    }

    public useTool(tool?: Tool): { value: boolean, message?: string } {
        const canUse = this.canUseTool(tool);
        if (!canUse.value) return canUse;

        this.onBeforeSwitchTool.next();

        this.getSelectedToolHandler()?.onToolDeselected();
        this._selectedTool = tool;

        const usingTool = this.getSelectedToolHandler()?.onToolSelected();
        this.onAfterSwitchTool.next();
        // if the tool cannot be selected deselect the tool
        if (usingTool == true) {
            return { value: true };
        } else {
            this.useTool();
            return { value: false };
        }
    }

    public canUseTool(tool?: Tool): { value: boolean, message?: string } {
        if (tool == undefined) return { value: false };

        return this.getToolHandler(tool)?.selectionConditionsSatisfied() ?? { value: false };
    }

    public getSelectedToolHandler(): GenericToolHandler | undefined {
        return this.getToolHandler(this._selectedTool);
    }

    public getToolHandler(tool?: Tool): GenericToolHandler | undefined {
        return tool ? this.tools.get(tool) : undefined;
    }

    public getManager<M extends GenericManager>(emanager: EManager | (new (e: any) => M)): M | undefined {
        for (const manager of this.managers) {
            if (manager.emanager === emanager || manager.constructor === emanager) {
                return manager as M;
            }
        }
        return undefined;
    }
}