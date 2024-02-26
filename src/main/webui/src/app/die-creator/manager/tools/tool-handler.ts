import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Subscription } from "rxjs";
import { ExtVector2d } from "../die-editor-manager";
import { IDieEditor } from "../idie-editor";
import { UnscaleManager } from "../managers/unscale-manager";

export type LayerFn = (layer?: Konva.Layer) => boolean | void;

export abstract class ToolHandler {

    public readonly editor: IDieEditor;
    protected readonly layers: Konva.Layer[] = [];
    protected subscriptions: Subscription[] = [];

    constructor(editor: IDieEditor) {
        this.editor = editor;
        this.createLayers();
        this.layers.forEach(l => this.editor.stage.add(l));
    }

    protected createLayers(): void { }

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
            UnscaleManager.instance?.unregisterLayer(l);
            l.removeChildren()
        });
    }


    abstract onMouseDown(event: KonvaEventObject<any>): void;
    abstract onMouseMove(event: KonvaEventObject<any>): void;
    abstract onMouseUp(event: KonvaEventObject<any>): void;
} 