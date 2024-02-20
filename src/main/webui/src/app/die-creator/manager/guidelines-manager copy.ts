import Konva from "konva";
import { IDieEditor } from "./idie-editor";
import { KonvaEventObject } from "konva/lib/Node";

export interface LineGuideStop {
    vertical: number[];
    horizontal: number[];
}

export interface ItemBound {
    vertical: {
        guide: number,
        offset: number,
        snap: 'start' | 'center' | 'end',
    }[];
    horizontal: {
        guide: number,
        offset: number,
        snap: 'start' | 'center' | 'end',
    }[]
}

export interface Guide {
    lineGuide: number,
    offset: number,
    orientation: 'V' | 'H',
    snap: 'start' | 'center' | 'end',
}

export class GuidelinesManager {

    public static readonly GUIDELINE_OFFSET = 5;

    private readonly layer = new Konva.Layer();
    private readonly editor: IDieEditor;

    constructor(editor: IDieEditor) {
        this.editor = editor;
        this.layer.on('dragmove', (event) => this.onDragMove(event));
        this.layer.on('dragend', (event) => this.onDragEnd(event));
    }

    // This method should be replaced by the vertex available from this.editor.state.getVertices()
    public getLineGuideStopsGeneric(skipShape: Konva.Node): LineGuideStop {
        const stage = this.editor.stage;

        // we can snap to stage borders and the center of the stage
        const vertical: number[][] = [[0, stage.width() / 2, stage.width()]];
        const horizontal: number[][] = [[0, stage.height() / 2, stage.height()]];

        // and we snap over edges and center of each object on the canvas
        stage.find('.object').forEach((guideItem) => {
            if (guideItem === skipShape) {
                return;
            }
            const box = guideItem.getClientRect();
            // and we can snap to all edges of shapes
            vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
            horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
        });
        return {
            vertical: vertical.flat(),
            horizontal: horizontal.flat(),
        };
    }


    // This method should be replaced by the current position of the pointer
    public getObjectSnappingEdgesGeneric(node: Konva.Node): ItemBound {
        const box = node.getClientRect();
        const absPos = node.absolutePosition();

        return {
            vertical: [
                {
                    guide: Math.round(box.x),
                    offset: Math.round(absPos.x - box.x),
                    snap: 'start',
                },
                {
                    guide: Math.round(box.x + box.width / 2),
                    offset: Math.round(absPos.x - box.x - box.width / 2),
                    snap: 'center',
                },
                {
                    guide: Math.round(box.x + box.width),
                    offset: Math.round(absPos.x - box.x - box.width),
                    snap: 'end',
                },
            ],
            horizontal: [
                {
                    guide: Math.round(box.y),
                    offset: Math.round(absPos.y - box.y),
                    snap: 'start',
                },
                {
                    guide: Math.round(box.y + box.height / 2),
                    offset: Math.round(absPos.y - box.y - box.height / 2),
                    snap: 'center',
                },
                {
                    guide: Math.round(box.y + box.height),
                    offset: Math.round(absPos.y - box.y - box.height),
                    snap: 'end',
                },
            ],
        };
    }

    public getGuidesGeneric(lineGuideStops: LineGuideStop, itemBounds: ItemBound): Guide[] {
        const resultV: (Partial<Guide> & { diff: number })[] = [];
        const resultH: (Partial<Guide> & { diff: number })[] = [];

        lineGuideStops.vertical.forEach((lineGuide) => {
            itemBounds.vertical.forEach((itemBound) => {
                const diff = Math.abs(lineGuide - itemBound.guide);
                // if the distance between guild line and object snap point is close we can consider this for snapping
                if (diff < GuidelinesManager.GUIDELINE_OFFSET) {
                    resultV.push({
                        lineGuide: lineGuide,
                        diff: diff,
                        snap: itemBound.snap,
                        offset: itemBound.offset,
                    });
                }
            });
        });

        lineGuideStops.horizontal.forEach((lineGuide) => {
            itemBounds.horizontal.forEach((itemBound) => {
                const diff = Math.abs(lineGuide - itemBound.guide);
                if (diff < GuidelinesManager.GUIDELINE_OFFSET) {
                    resultH.push({
                        lineGuide: lineGuide,
                        diff: diff,
                        snap: itemBound.snap,
                        offset: itemBound.offset,
                    });
                }
            });
        });

        const guides: Guide[] = [];

        // find closest snap
        const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
        const minH = resultH.sort((a, b) => a.diff - b.diff)[0];
        if (minV) {
            guides.push({
                lineGuide: minV.lineGuide!,
                offset: minV.offset!,
                orientation: 'V',
                snap: minV.snap!,
            });
        }
        if (minH) {
            guides.push({
                lineGuide: minH.lineGuide!,
                offset: minH.offset!,
                orientation: 'H',
                snap: minH.snap!,
            });
        }
        return guides;
    }

    public drawGuides(guides: Guide[]) {
        guides.forEach((lg) => {
            if (lg.orientation === 'H') {
                var line = new Konva.Line({
                    points: [-6000, 0, 6000, 0],
                    stroke: 'rgb(0, 161, 255)',
                    strokeWidth: 1,
                    name: 'guid-line',
                    dash: [4, 6],
                });
                this.layer.add(line);
                line.absolutePosition({
                    x: 0,
                    y: lg.lineGuide,
                });
            } else if (lg.orientation === 'V') {
                var line = new Konva.Line({
                    points: [0, -6000, 0, 6000],
                    stroke: 'rgb(0, 161, 255)',
                    strokeWidth: 1,
                    name: 'guid-line',
                    dash: [4, 6],
                });
                this.layer.add(line);
                line.absolutePosition({
                    x: lg.lineGuide,
                    y: 0,
                });
            }
        });
    }

    private onDragMove(event: KonvaEventObject<any>) {
        // clear all previous lines on the screen        
        this.deleteGuides();

        // find possible snapping lines
        const lineGuideStops = this.getLineGuideStopsGeneric(event.target);
        // find snapping points of current object
        const itemBounds = this.getObjectSnappingEdgesGeneric(event.target);

        // now find where can we snap current object
        const guides = this.getGuidesGeneric(lineGuideStops, itemBounds);

        // do nothing of no snapping
        if (!guides.length) {
            return;
        }

        this.drawGuides(guides);

        const absPos = event.target.absolutePosition();
        // now force object position
        guides.forEach((lg) => {
            switch (lg.snap) {
                case 'start': {
                    switch (lg.orientation) {
                        case 'V': {
                            absPos.x = lg.lineGuide + lg.offset;
                            break;
                        }
                        case 'H': {
                            absPos.y = lg.lineGuide + lg.offset;
                            break;
                        }
                    }
                    break;
                }
                case 'center': {
                    switch (lg.orientation) {
                        case 'V': {
                            absPos.x = lg.lineGuide + lg.offset;
                            break;
                        }
                        case 'H': {
                            absPos.y = lg.lineGuide + lg.offset;
                            break;
                        }
                    }
                    break;
                }
                case 'end': {
                    switch (lg.orientation) {
                        case 'V': {
                            absPos.x = lg.lineGuide + lg.offset;
                            break;
                        }
                        case 'H': {
                            absPos.y = lg.lineGuide + lg.offset;
                            break;
                        }
                    }
                    break;
                }
            }
        });
        event.target.absolutePosition(absPos);
    }

    private onDragEnd(event: KonvaEventObject<any>) {
        // clear all previous lines on the screen
        this.deleteGuides();
    }

    private deleteGuides() {
        this.layer.find('.guid-line').forEach((l) => l.destroy());
    }
}