import { Routes } from '@angular/router';
import { DieDashboardComponent } from './components/die-dashboard/die-dashboard.component';
import { DieEditorComponent } from './components/die-editor/die-editor.component';
import { DieViewerComponent } from './components/die-viewer/die-viewer.component';
import { DieCreatorComponent } from './die-creator/die-creator.component';
import { DieSimilarSearchComponent } from './components/die-similar-search/die-similar-search.component';

export const routes: Routes = [
    { path: '',   redirectTo: '/dies', pathMatch: 'full' },
    { path: 'dies', component: DieDashboardComponent},
    { path: 'die/:id', component: DieViewerComponent},
    { path: 'die-editor', component: DieEditorComponent},
    { path: 'die-creator', component: DieCreatorComponent},
    { path: 'die-similar-search', component: DieSimilarSearchComponent},
];
