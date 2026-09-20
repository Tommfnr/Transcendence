import { Component } from '@angular/core';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { AvatarComponent } from '../../components/avatar/avatar';
import { TagComponent } from '../../components/tag/tag';
import { ButtonDirective } from '../../components/button/button.directive';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-iCanHelp',
  imports: [TitleBarComponent, AvatarComponent, TagComponent, ButtonDirective, RouterLink],
  host: { class: 'flex flex-col flex-1' },
  templateUrl: './iCanHelp.html',
})
export class ICanHelp {

}
