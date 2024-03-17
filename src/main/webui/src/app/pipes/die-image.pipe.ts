import { Pipe, PipeTransform } from '@angular/core';
import { KonvaUtils } from '../die-creator/manager/konva-utils';
import { Die } from '../models/entities/die';
import { Observable, of } from 'rxjs';

@Pipe({
  name: 'dieImage',
  standalone: true
})
export class DieImagePipe implements PipeTransform {

  transform(die: Die, ...args: unknown[]): Observable<string> {
    return of(KonvaUtils.exportImage(die.dieData.state));
  }

}
