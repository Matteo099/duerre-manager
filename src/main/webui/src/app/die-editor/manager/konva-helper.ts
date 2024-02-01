import { Line, LineConfig } from "konva/lib/shapes/Line";
import { IDieEditor } from "./idie-editor";
import Konva from 'konva';

export class KonvaHelper {

    private editor: IDieEditor;

    constructor(editor: IDieEditor) {
        this.editor = editor;
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