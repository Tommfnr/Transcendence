import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { AvatarComponent } from '../../components/avatar/avatar';
import { TextFieldComponent } from '../../components/text-field/text-field';

@Component({
  selector: 'app-offerHelp',
  imports: [RouterLink, TitleBarComponent, AvatarComponent, TextFieldComponent],
  templateUrl: './offerHelp.html',
})
export class OfferHelp {}
