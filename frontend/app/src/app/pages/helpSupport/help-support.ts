import { Component, inject, signal} from '@angular/core';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { ButtonDirective } from '../../components/button/button.directive';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-help-support',
    imports: [ TitleBarComponent, ButtonDirective],
    templateUrl: './helpSupport.html',
    styles: ``,
})

export class HelpSupport {
	private http = inject(HttpClient);
	protected readonly newKey = signal<string | null>(null);

	protected generate(): void {
		this.http.post<{ key:string }>('/api/auth/api-keys', { name: 'My Key'}).subscribe((created) => this.newKey.set(created.key));
	}
}
