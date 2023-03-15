import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpService } from './services/http.service';
import { TokenService } from './services/token.service';
import { UrlParamsService } from './services/url-params.service';
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
import {CatchToken} from "./services/catch-token";
import {AutocompleteComponent} from "./components/autocomplete/autocomplete.component";
import {ClickOutsideDirective} from "./directives/click-outside.directive";
import {ComponentInjectorDirective} from "./directives/component-injector.directive";
import {HighlightPipe} from "./pipes/highlight.pipe";
import {BadgeComponent} from "./components/badge/badge.component";
import {SwitchComponent} from "./components/switch/switch.component";

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
    ComponentInjectorDirective,
    HighlightPipe,
    BadgeComponent,
    SwitchComponent
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
    AutocompleteComponent,
    ClickOutsideDirective,
    BadgeComponent,
    SwitchComponent
  ],
  providers: [
    HttpService,
    TokenService,
    UrlParamsService,
    { provide: NotificationService, useValue: new NotificationService() },
    IsLogged,
    CatchToken
  ]
})
export class SharedModule {}
