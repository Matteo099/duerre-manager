import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import Konva from 'konva';

enum Tool {
  ERASER, MOVE, EDIT, DRAW
}

@Component({
  selector: 'app-die-editor',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './die-editor.component.html',
  styleUrl: './die-editor.component.scss'
})
export class DieEditorComponent implements AfterViewInit {

  @ViewChild('stageContainer', { static: false }) stageContainer?: ElementRef;

  Tool = Tool;


  stage!: Konva.Stage;
  layer!: Konva.Layer;
  circles: Konva.Circle[] = [];
  polygon!: Konva.Line;
  GUIDELINE_OFFSET = 5;


  ngAfterViewInit() {
    this.initializeStage();
    this.addEventListeners();
  }

  initializeStage() {
    this.stage = new Konva.Stage({
      container: this.stageContainer!.nativeElement,
      width: this.stageContainer!.nativeElement.offsetWidth,
      height: this.stageContainer!.nativeElement.offsetHeight,
    });

    this.layer = new Konva.Layer();

    this.addCircles();
    this.addPolygon();

    this.stage.add(this.layer);
  }

  addCircles() {
    const circleData = [
      { x: 10, y: 10, radius: 5 },
      { x: 50, y: 50, radius: 3 },
      { x: 50, y: 100, radius: 3 },
      { x: 20, y: 40, radius: 3 },
    ];

    this.circles = circleData.map(data => new Konva.Circle({
      x: data.x,
      y: data.y,
      radius: data.radius,
      stroke: '#ff0000',
      strokeWidth: 1,
      draggable: true,
    }));

    this.circles.forEach(circle => this.layer.add(circle));
  }

  addPolygon() {
    const points = this.circles.map(circle => [circle.x(), circle.y()]).flat();

    this.polygon = new Konva.Line({
      points: points,
      fill: '#ff000088',
      stroke: '#ff0000',
      strokeWidth: 1,
      draggable: false,
      closed: true,
      dash: [],
    });

    this.layer.add(this.polygon);
  }

  addEventListeners() {
    this.circles.forEach(circle => this.addEventToCircle(circle));

    this.polygon.on('click', (e) => {
      this.handlePolygonClick();
    });

    this.layer.draw();
  }

  addEventToCircle(circle: Konva.Circle) {
    circle.on('dragmove', (e) => {
      console.log(e);
      this.handleCircleDragMove(circle);
    });

    circle.on('mouseover', (e) => {
      circle.radius(10);
      this.layer.draw();
    });

    circle.on('mouseout', (e) => {
      circle.radius(5);
      this.layer.draw();
    });
  }

  handleCircleDragMove(circle: Konva.Circle) {
    const coords = this.snapToGrid({x: circle.x(), y: circle.y()});
    circle.x(coords.x);
    circle.y(coords.y);
    this.polygon.points(this.circles.map(c => [c.x(), c.y()]).flat());
    this.layer.batchDraw();
  }

  handlePolygonClick() {
    const mousePos = this.snapToGrid(this.stage.getPointerPosition()!);
    const x = mousePos.x;
    const y = mousePos.y;
    const points = this.polygon.points();

    for (let i = 0; i < points.length / 2; i++) {
      const s_x = points[i * 2];
      const s_y = points[i * 2 + 1];
      const e_x = points[(i * 2 + 2) % points.length];
      const e_y = points[(i * 2 + 3) % points.length];

      if (((s_x <= x && x <= e_x) || (e_x <= x && x <= s_x)) &&
        ((s_y <= y && y <= e_y) || (e_y <= y && y <= s_y))) {
        const newPoint = new Konva.Circle({
          x: x,
          y: y,
          radius: 3,
          stroke: '#ff0000',
          strokeWidth: 1,
          draggable: true,
        });

        this.addEventToCircle(newPoint);
        this.circles.splice(i + 1, 0, newPoint);
        this.polygon.points(this.circles.map(c => [c.x(), c.y()]).flat());
        this.layer.add(newPoint);
        this.layer.draw();
        break;
      }
    }
  }

  public snapToGrid(pointer: Konva.Vector2d): Konva.Vector2d {
    const gridSizeDef = 10;
    const zoom = this.stage.scale()!;
    const gridSizeX = gridSizeDef * zoom.x;
    const gridSizeY = gridSizeDef * zoom.y;

    // Round the coordinates to the nearest grid point
    const x = Math.round(pointer.x / gridSizeX) * gridSizeY;
    const y = Math.round(pointer.y / gridSizeY) * gridSizeX;

    const point: Konva.Vector2d = { x, y };
    console.log(point, pointer);
    return point;
  }

  @HostListener("window:resize")
  updateCanvasSize() {
  }

  useSelectTool() {
  }
  useDrawTool() {
  }
  useEraserTool() {
  }
  useMoveTool() {
  }
  zoomIn() {
  }
  restoreZoom() { }
  zoomOut() {
  }

  undo() { }
  redo() { }
  clear() {
  }
  cancel() { }

  getColor(tool: Tool) {
    return "primary";
  }

  save() {
  }
}
