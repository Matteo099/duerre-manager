import { Routes } from '@angular/router';
import { DieDashboardComponent } from './die-dashboard/die-dashboard.component';
import { DieEditorComponent } from './die-editor/die-editor.component';
import { DieViewerComponent } from './die-viewer/die-viewer.component';
import { DieCreatorComponent } from './die-creator/die-creator.component';

export const routes: Routes = [
    { path: '',   redirectTo: '/dies', pathMatch: 'full' },
    { path: 'dies', component: DieDashboardComponent},
    { path: 'die/:id', component: DieViewerComponent},
    { path: 'die-editor', component: DieEditorComponent},
    { path: 'die-creator', component: DieCreatorComponent},
];
