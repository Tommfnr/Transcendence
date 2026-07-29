import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderApp } from '../../components/header-app/header-app';
import { FooterApp } from '../../components/footer-app/footer-app';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, HeaderApp, FooterApp],
  templateUrl: './app-layout.html',
})
export class AppLayout {}
