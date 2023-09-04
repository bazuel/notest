import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SessionDebuggerComponent } from './components/session-debugger/session-debugger.component';
import { SharedModule } from '../shared/shared.module';
import { SessionService } from './services/session.service';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { PlayerComponent } from './components/session-player/player.component';
import { SessionComparatorComponent } from './components/session-comparator/session-comparator.component';
import { IsLogged } from '../shared/services/is-logged.guard';
import { SessionDashboardComponent } from './components/session-dashboard/session-dashboard.component';
import { NotestSharedModule } from '../notest-shared/notest-shared.module';
import { SessionPreviewComponent } from './components/session-preview/session-preview.component';
import { CameraComponent } from './components/camera/camera.component';
import { CatchToken } from '../shared/services/catch-token';
import { FormsModule } from '@angular/forms';
import { DevtoolNetworkComponent } from './components/session-debugger/devtool-network/devtool-network.component';
import { DevtoolStorageComponent } from './components/session-debugger/devtool-storage/devtool-storage.component';
import { DevtoolHeaderComponent } from './components/session-debugger/devtool-header/devtool-header.component';
import { SessionDevtoolComponent } from './components/session-debugger/session-devtool/session-devtool.component';
import { ResizableDirective } from './directives/resizable.directive';

const routes: Routes = [
  { path: 'session-camera', component: CameraComponent },
  { path: 'session-debugger', component: SessionDebuggerComponent, canActivate: [IsLogged] },
  { path: 'session-comparator', component: SessionComparatorComponent, canActivate: [IsLogged] },
  { path: 'session-dashboard', component: SessionDashboardComponent, canActivate: [IsLogged] },
  { path: 'session-preview', component: SessionPreviewComponent, canActivate: [CatchToken] }
];

@NgModule({
  declarations: [
    SessionDebuggerComponent,
    EventListComponent,
    EventDetailsComponent,
    PlayerComponent,
    SessionComparatorComponent,
    SessionDashboardComponent,
    SessionPreviewComponent,
    CameraComponent,
    DevtoolNetworkComponent,
    DevtoolStorageComponent,
    DevtoolHeaderComponent,
    SessionDevtoolComponent,
    ResizableDirective
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    NotestSharedModule,
    FormsModule
  ],
  exports: [SessionPreviewComponent],
  providers: [SessionService]
})
export class SessionModule {}
