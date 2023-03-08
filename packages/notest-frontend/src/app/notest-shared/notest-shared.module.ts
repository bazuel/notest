import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoComponent } from './components/logo/logo.component';
import { ScreenshotComponent } from './components/screenshot/screenshot.component';
import { SharedModule } from '../shared/shared.module';
import { VideoComponent } from './components/video/video.component';

@NgModule({
  declarations: [LogoComponent, ScreenshotComponent, VideoComponent],
  exports: [LogoComponent, ScreenshotComponent, VideoComponent],
  imports: [CommonModule, SharedModule]
})
export class NotestSharedModule {}
