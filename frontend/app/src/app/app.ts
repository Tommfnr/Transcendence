import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderMarketing } from './components/header-marketing/header-marketing';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderMarketing, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
