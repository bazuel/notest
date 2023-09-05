import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CodemirrorEditorComponent } from './components/codemirror-editor/codemirror-editor.component';
import { FormsModule } from '@angular/forms';
import { PlayPauseAnimationComponent } from './player/play-pause-animation/play-pause-animation.component';
import { NotestPlayerComponent } from './player/player/notest-player.component';
import { IconComponent } from './components/icon/icon.component';
import { NotestCameraComponent } from './player/player/notest-camera.component';
import {
  NotificationComponent,
  NotificationService
} from './components/notification/notification.component';
import { CapsLockDirective } from './directives/caps-lock.directive';
import { PopupComponent } from './components/popup/popup.component';
import { IsLogged } from './services/is-logged.guard';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { CatchToken } from './services/catch-token';
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ComponentInjectorDirective } from './directives/component-injector.directive';
import { HighlightPipe } from './pipes/highlight.pipe';
import { BadgeComponent } from './components/badge/badge.component';
import { SwitchComponent } from './components/switch/switch.component';
import { ProfileImageComponent } from './components/profile-image/profile-image.component';
import { CronComponent } from './components/cron/cron.component';
import { AsyncAutocompleteComponent } from './components/async-autocomplete/async-autocomplete.component';
import {
  DiffMsFromNowPipe,
  FormatDatePipe,
  FormatTimePipe,
  FromNowPipe,
  MinusOneMonthDatePipe,
  PlusOneMonthDatePipe
} from './pipes/time.pipe';
import { JsonViewerComponent } from './components/json-viewer/json-viewer.component';
import { LoadingComponent } from './components/loading/loading.component';
import { JsonViewerService } from './components/json-viewer/json-viewer.service';
import { IconButtonComponent } from './components/icon-button/icon-button.component';
import { SvgIconComponent } from './components/svg-icon/svg-icon.component';
import { JsonTemplateComponent } from './components/json-template/json-template.component';
import { CopyDirective } from './directives/copy.directive';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';

@NgModule({
  declarations: [
    CodemirrorEditorComponent,
    IconComponent,
    PlayPauseAnimationComponent,
    NotestPlayerComponent,
    NotestCameraComponent,
    NotificationComponent,
    CapsLockDirective,
    PopupComponent,
    SafeUrlPipe,
    ClickOutsideDirective,
    AutocompleteComponent,
    AsyncAutocompleteComponent,
    ComponentInjectorDirective,
    HighlightPipe,
    FormatDatePipe,
    FormatTimePipe,
    DiffMsFromNowPipe,
    MinusOneMonthDatePipe,
    PlusOneMonthDatePipe,
    BadgeComponent,
    SwitchComponent,
    FromNowPipe,
    ProfileImageComponent,
    CronComponent,
    JsonViewerComponent,
    LoadingComponent,
    IconButtonComponent,
    SvgIconComponent,
    JsonTemplateComponent,
    CopyDirective,
    CodeEditorComponent
  ],
  imports: [CommonModule, HttpClientModule, FormsModule],
  exports: [
    CodemirrorEditorComponent,
    IconComponent,
    PlayPauseAnimationComponent,
    NotestPlayerComponent,
    CapsLockDirective,
    PopupComponent,
    NotificationComponent,
    SafeUrlPipe,
    FormatDatePipe,
    FormatTimePipe,
    FromNowPipe,
    DiffMsFromNowPipe,
    MinusOneMonthDatePipe,
    PlusOneMonthDatePipe,
    AutocompleteComponent,
    AsyncAutocompleteComponent,
    ClickOutsideDirective,
    BadgeComponent,
    SwitchComponent,
    ProfileImageComponent,
    CronComponent,
    JsonViewerComponent,
    LoadingComponent,
    IconButtonComponent,
    SvgIconComponent,
    JsonTemplateComponent,
    CopyDirective,
    CodeEditorComponent
  ],
  providers: [
    { provide: NotificationService, useValue: new NotificationService() },
    IsLogged,
    CatchToken,
    JsonViewerService
  ]
})
export class SharedModule {}
