import { Line, LineConfig } from "konva/lib/shapes/Line";
import { IDieEditor } from "./idie-editor";
import Konva from 'konva';

export class KonvaHelper {

    private editor: IDieEditor;

    constructor(editor: IDieEditor) {
        this.editor = editor;
    }

    public snapToGrid(pointer: Konva.Vector2d): Konva.Vector2d {
        const stepSize = 40;

        // Calculate the offset based on the grid step size
        const gridOffset = {
            x: Math.round(pointer.x / stepSize) * stepSize,
            y: Math.round(pointer.y / stepSize) * stepSize,
        };

        return {
            x: gridOffset.x,
            y: gridOffset.y,
        };
    }


    public unScale(val: number) {
        return (val / this.editor.stage.scaleX());
    }

    // public isClosedLoop(lines: fabric.Line[]): boolean {
    //     // Check if the last drawn line connects to the first line
    //     if (lines.length >= 2) {
    //         const firstLine = lines[0];
    //         const lastLine = lines[lines.length - 1];

    //         // Tolerance value to account for small variations due to snapping
    //         const tolerance = 5;

    //         return (
    //             Math.abs(firstLine.x1! - lastLine.x2!) < tolerance &&
    //             Math.abs(firstLine.y1! - lastLine.y2!) < tolerance
    //         );
    //     }

    //     return false;
    // }

    public lineToCoords(line: Konva.Line): { x1: number, y1: number, x2: number, y2: number } {
        const coords = line.points();
        return { x1: coords[0], y1: coords[1], x2: coords[2], y2: coords[3] };
    }

    public calculateDistance(coords: { x1: number, y1: number, x2: number, y2: number }): number {
        return Math.sqrt(Math.pow(coords.x2 - coords.x1, 2) + Math.pow(coords.y2 - coords.y1, 2));
    }

    public calculateAngle(coords: { x1: number, y1: number, x2: number, y2: number } | number[], degree: boolean = true): number {
        let points: { x1: number, y1: number, x2: number, y2: number };
        if (!('x1' in coords)) {
            points = { x1: coords[0], y1: coords[1], x2: coords[2], y2: coords[3] };
        } else {
            points = coords;
        }

        const angleRad = Math.atan2(points.y2 - points.y1, points.x2 - points.x1);
        if (degree) {
            let angleDeg = (angleRad * 180) / Math.PI;

            // Ensure the angle is positive
            if (angleDeg < 0) {
                angleDeg += 360;
            }

            return 360 - angleDeg;
        }
        return angleRad;
    }

    public calculateLength(line: Konva.Line): number {
        const points = line.points();
        return this.calculateDistance({
            x1: points[0],
            y1: points[1],
            x2: points[points.length - 2],
            y2: points[points.length - 1]
        });
    }

    public calculateMiddlePoint(line: Konva.Line): Konva.Vector2d {
        const points = line.points();
        return {
            x: points[0] - (points[0] - points[points.length - 2]) / 2,
            y: points[1] - (points[1] - points[points.length - 1]) / 2
        };
    }

    public findPoint(line: Konva.Line, distance: number): { x: number, y: number } {
        const points = this.lineToCoords(line);
        
        // Calculate the direction vector of the line
        const dx = points.x2 - points.x1;
        const dy = points.y2 - points.y1;

        // Calculate the length of the line segment
        const length = Math.sqrt(dx * dx + dy * dy);

        // Normalize the direction vector
        const normalizedDx = dx / length;
        const normalizedDy = dy / length;

        // Calculate the coordinates of the third point
        const x3 = points.x1 + normalizedDx * distance;
        const y3 = points.y1 + normalizedDy * distance;

        return { x: x3, y: y3 };
    }

    public createHorizontalInfo(line: Konva.Line) {
        const offset = 20;
        const arrowOffset = offset / 2;
        const arrowSize = 5;
        const points = line.points();
        const width = Math.abs(points[0] - points[2]);
        const height = line.position().y;

        const group = new Konva.Group();
        const lines = new Konva.Shape({
            sceneFunc: function (ctx) {
                ctx.fillStyle = 'grey';
                ctx.lineWidth = 0.5;

                // ctx.moveTo(0, 0);
                // ctx.lineTo(-offset, 0);

                // ctx.moveTo(0, frameHeight);
                // ctx.lineTo(-offset, frameHeight);

                ctx.moveTo(0, height);
                ctx.lineTo(0, height + offset);

                ctx.moveTo(width, height);
                ctx.lineTo(width, height + offset);

                ctx.stroke();
            },
        });

        var bottomArrow = new Konva.Shape({
            sceneFunc: function (ctx) {
                // top pointer
                ctx.translate(0, height + arrowOffset);
                ctx.moveTo(arrowSize, -arrowSize);
                ctx.lineTo(0, 0);
                ctx.lineTo(arrowSize, arrowSize);

                // line
                ctx.moveTo(0, 0);
                ctx.lineTo(width, 0);

                // bottom pointer
                ctx.moveTo(width - arrowSize, -arrowSize);
                ctx.lineTo(width, 0);
                ctx.lineTo(width - arrowSize, arrowSize);

                ctx.strokeShape(bottomArrow);
            },
            stroke: 'grey',
            strokeWidth: 0.5,
        });

        // bottom text
        var bottomLabel = new Konva.Label();

        bottomLabel.add(
            new Konva.Tag({
                fill: 'white',
                stroke: 'grey',
            })
        );
        var bottomText = new Konva.Text({
            text: width + ' mm',
            padding: 2,
            fill: 'black',
        });

        bottomLabel.add(bottomText);
        bottomLabel.position({
            x: width / 2 - bottomText.width() / 2,
            y: height + arrowOffset,
        });

        // bottomLabel.on('click tap', function () {
        //   createInput('width', this.getAbsolutePosition(), bottomText.size());
        // });

        group.add(lines, bottomArrow, bottomLabel);

        return group;
    }

}