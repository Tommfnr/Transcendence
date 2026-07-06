import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderMarketing } from '../../components/header-marketing/header-marketing';
import { FooterMarketing } from '../../components/footer-marketing/footer-marketing';

@Component({
  selector: 'app-marketing-layout',
  imports: [RouterOutlet, HeaderMarketing, FooterMarketing],
  templateUrl: './marketing-layout.html',
  styleUrl: './marketing-layout.css',
})
export class MarketingLayout {}
