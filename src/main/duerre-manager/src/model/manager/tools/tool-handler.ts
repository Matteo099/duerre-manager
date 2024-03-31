import Konva from "konva";
import { Subscription } from "rxjs";
import { UnscaleManager } from "../managers/unscale-manager";
import type { ExtVector2d, IDieEditor } from "../idie-editor";

export type LayerFn = (layer?: Konva.Layer) => boolean | void;

export abstract class ToolHandler {

    public readonly editor: IDieEditor;
    protected readonly layers: Konva.Layer[] = [];
    protected subscriptions: Subscription[] = [];
    protected enableGuidelines: boolean;

    constructor(editor: IDieEditor, enableGuidelines: boolean) {
        this.editor = editor;
        this.enableGuidelines = enableGuidelines;
        this.createLayers();
        this.layers.forEach(l => this.editor.stage.add(l));
    }

    protected createLayers(): void {
    }

    protected getLayer(selector: number | LayerFn): Konva.Layer | undefined {
        return this.layers.find(l => l._id == selector || (selector instanceof Function ? selector(l) : false));
    }

    protected getSnappingPoint(): ExtVector2d {
        return this.editor.getSnapToNearest({ useEndpoints: true });
    }

    onToolSelected(): void {
        this.layers.forEach(l => l.visible(true));
    }

    onToolDeselected(): void {
        this.layers.forEach(l => l.visible(false));
    }

    destroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.layers.forEach(l => l.destroy());
    }

    clear() {
        this.layers.forEach(l => {
            UnscaleManager.getInstance()?.unregisterLayer(l);
            l.removeChildren()
        });
    }


    public onMouseDown(event: Konva.KonvaEventObject<any>): void {
        if (this.enableGuidelines) this.editor.guidelinesManager.activate();
    }
    public onMouseMove(event: Konva.KonvaEventObject<any>): void {
        if (this.enableGuidelines) this.editor.guidelinesManager.update();
    }
    public onMouseUp(event: Konva.KonvaEventObject<any>): void {
        if (this.enableGuidelines) this.editor.guidelinesManager.deactivate();
    }
} 