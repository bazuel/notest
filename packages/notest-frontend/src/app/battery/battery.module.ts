import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatteryTestComponent } from './components/battery-test/battery-test.component';
import { RouterModule, Routes } from '@angular/router';
import { IsLogged } from '../shared/services/is-logged.guard';
import { BatteryTestDashboardComponent } from './components/battery-test-dashboard/battery-test-dashboard.component';
import { NotestSharedModule } from '../notest-shared/notest-shared.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { BatteryAutocompleteItemComponent } from './components/battery-autocomplete-item/battery-autocomplete-item.component';
import { BatteryTestSettingsPanelComponent } from './components/battery-test-settings-panel/battery-test-settings-panel.component';

const routes: Routes = [
  { path: 'battery-test', component: BatteryTestComponent, canActivate: [IsLogged] },
  {
    path: 'battery-test-dashboard',
    component: BatteryTestDashboardComponent,
    canActivate: [IsLogged]
  }
];
@NgModule({
  declarations: [
    BatteryTestComponent,
    BatteryTestDashboardComponent,
    BatteryAutocompleteItemComponent,
    BatteryTestSettingsPanelComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NotestSharedModule,
    FormsModule,
    SharedModule
  ]
})
export class BatteryModule {}
