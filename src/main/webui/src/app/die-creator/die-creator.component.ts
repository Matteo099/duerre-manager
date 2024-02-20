import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DieDataDao } from '../models/dao/die-data-dao';
import { DieEditorManager } from './manager/die-editor-manager';
import { Tool } from './manager/tools/tool';


export function validDieValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const dieData: DieDataDao = control.value;
    return dieData?.valid ? null : { validDie: { value: dieData?.valid || false } };
  };
}

@Component({
  selector: 'app-die-creator',
  standalone: true,
  imports: [MatButtonModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,],
  templateUrl: './die-creator.component.html',
  styleUrl: './die-creator.component.scss'
})
export class DieCreatorComponent implements AfterViewInit, OnDestroy {


  @ViewChild('stageContainer', { static: false }) stageContainer?: ElementRef;

  editor?: DieEditorManager;
  Tool = Tool;

  constructor(
    public dialogRef: MatDialogRef<DieCreatorComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: DieDataDao,
  ) { }

  ngAfterViewInit() {
    this.editor = new DieEditorManager(this.stageContainer!);
    if (this.data) this.editor.setData(this.data);
    setTimeout(() => this.editor!.useTool(Tool.DRAW_LINE), 100);
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  @HostListener("window:resize")
  updateCanvasSize() {
    if (this.stageContainer) this.editor?.resize(this.stageContainer);
  }

  useEditTool() {
    this.editor?.useTool(Tool.EDIT);
  }
  useDrawTool(drawingTool: Tool) {
    this.editor?.useTool(drawingTool);
  }
  useEraserTool() {
    this.editor?.useTool(Tool.ERASER);
  }
  useMoveTool() {
    this.editor?.useTool(Tool.MOVE);
  }
  zoomIn() {
    this.editor?.zoomIn();
  }
  restoreZoom() { }
  zoomOut() {
    this.editor?.zoomOut();
  }

  undo() { }
  redo() { }
  clear() {
    this.editor?.clear();
  }
  cancel() {
    this.dialogRef.close(this.data);
  }

  getColor(tool: Tool) {
    if (this.editor?.selectedTool == tool)
      return "warn";
    return "primary";
  }

  save() {
    const dieDataDao = this.editor?.getData();
    console.log(this.editor?.exportImage());
    this.dialogRef.close(dieDataDao);
  }
}
