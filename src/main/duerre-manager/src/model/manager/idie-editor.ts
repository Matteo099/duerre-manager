import Konva from 'konva';
import { DieState } from './die-state';
import { KonvaHelper } from './konva-helper';
import { Tool } from './tools/tool';
import { GuidelinesManager } from './managers/guidelines-manager';

export interface IDieEditor {
    get stage(): Konva.Stage;
    get layer(): Konva.Layer;
    get selectedTool(): Tool | undefined;
    get state(): DieState;
    get helper(): KonvaHelper;
    get guidelinesManager() : GuidelinesManager;


    //getSnappedToNearObject(points?: Konva.Vector2d[]): { v: Konva.Vector2d, obj: "grid" | "vertex" };

    getSnapToNearest(config?: SnapConfig): ExtVector2d;
}

export interface ExtVector2d extends Konva.Vector2d {
    source: 'grid' | 'vertex';
}
export const DefaultExtVector2d: ExtVector2d = { x: 0, y: 0, source: 'grid' };
export interface SnapConfig {
    useEndpoints: boolean;
    pointer?: Konva.Vector2d;
}