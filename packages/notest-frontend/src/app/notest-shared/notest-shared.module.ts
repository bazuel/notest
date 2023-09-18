import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { LogoComponent } from './components/logo/logo.component';
import { ScreenshotComponent } from './components/screenshot/screenshot.component';
import { SharedModule } from '../shared/shared.module';
import { VideoComponent } from './components/video/video.component';
import { SessionPreviewPlaceholderComponent } from './components/placeholders/session-preview/session-preview-placeholder.component';
import { ScreenshotListPlaceholderComponent } from './components/placeholders/session-preview/screenshot-list-placeholder.component';
import { AssertionSummaryItemComponent } from './components/assertion-summary-item/assertion-summary-item.component';
import { AssertionPreviewComponent } from './components/assertion-preview/assertion-preview.component';
import { SessionListWrappedComponent } from './components/session-list-wrapped/session-list-wrapped.component';
import { UrlComponent } from './components/url/url.component';
import { EventTimeComponent } from './components/event-time/event-time.component';

@NgModule({
  declarations: [
    LogoComponent,
    ScreenshotComponent,
    VideoComponent,
    SessionPreviewPlaceholderComponent,
    ScreenshotListPlaceholderComponent,
    AssertionSummaryItemComponent,
    AssertionPreviewComponent,
    SessionListWrappedComponent,
    UrlComponent,
    EventTimeComponent
  ],
  exports: [
    LogoComponent,
    ScreenshotComponent,
    VideoComponent,
    SessionPreviewPlaceholderComponent,
    ScreenshotListPlaceholderComponent,
    AssertionSummaryItemComponent,
    AssertionPreviewComponent,
    SessionListWrappedComponent,
    UrlComponent,
    EventTimeComponent
  ],
  imports: [CommonModule, SharedModule, NgOptimizedImage]
})
export class NotestSharedModule {}
