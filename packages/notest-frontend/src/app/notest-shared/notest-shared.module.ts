import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoComponent } from './components/logo/logo.component';
import { ScreenshotComponent } from './components/screenshot/screenshot.component';
import { SharedModule } from '../shared/shared.module';
import { VideoComponent } from './components/video/video.component';
import { SessionPreviewPlaceholderComponent } from './components/placeholders/session-preview/session-preview-placeholder.component';
import { ScreenshotListPlaceholderComponent } from './components/placeholders/session-preview/screenshot-list-placeholder.component';
import { AssertionSummaryItemComponent } from './components/assertion-summary-item/assertion-summary-item.component';
import { AssertionPreviewComponent } from './components/assertion-preview/assertion-preview.component';

@NgModule({
  declarations: [
    LogoComponent,
    ScreenshotComponent,
    VideoComponent,
    SessionPreviewPlaceholderComponent,
    ScreenshotListPlaceholderComponent,
    AssertionSummaryItemComponent,
    AssertionPreviewComponent
  ],
  exports: [
    LogoComponent,
    ScreenshotComponent,
    VideoComponent,
    SessionPreviewPlaceholderComponent,
    ScreenshotListPlaceholderComponent,
    AssertionSummaryItemComponent,
    AssertionPreviewComponent
  ],
  imports: [CommonModule, SharedModule]
})
export class NotestSharedModule {}
