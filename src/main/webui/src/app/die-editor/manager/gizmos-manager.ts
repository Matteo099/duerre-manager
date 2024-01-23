import { IDieEditor } from "./idie-editor";
import { fabric } from 'fabric';

export interface Gizmos {
    id: string;
    object: fabric.Object;
}

export class GizmosManager {

    private readonly editor: IDieEditor;
    private readonly gizmos: Gizmos[] = [];

    private static lastId: number = 0;

    constructor(editor: IDieEditor) {
        this.editor = editor;
    }

    public addVertexGizmos(pointer: fabric.Point | { x: number, y: number }, id?: string): Gizmos {
        this.removeGizmos(id);

        const fabricObject = new fabric.Circle({
            left: pointer.x - 5, // Adjust the positioning as needed
            top: pointer.y - 5, // Adjust the positioning as needed
            radius: 5,
            fill: 'rgba(0,0,0,0)',
            stroke: 'green',
            strokeWidth: 2,
            selectable: false,
            evented: false,
        });
        this.editor.fabricCanvas.add(fabricObject);
        const gizmo: Gizmos = { id: id || (++GizmosManager.lastId).toString(), object: fabricObject };
        this.gizmos.push(gizmo);
        return gizmo;
    }

    public removeGizmos(id?: string) {
        let toRemove = this.gizmos;
        if (id) toRemove = this.gizmos.filter(g => g.id == id);
        toRemove.forEach(g => this.editor.fabricCanvas.remove(g.object));
    }
}