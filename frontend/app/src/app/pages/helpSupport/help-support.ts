import { Component, inject, signal} from '@angular/core';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { ButtonDirective } from '../../components/button/button.directive';
import { ApiKeysService } from '../../services/api-keys.service';

@Component({
    selector: 'app-help-support',
    imports: [ TitleBarComponent, ButtonDirective],
    templateUrl: './helpSupport.html',
    styles: ``,
})

export class HelpSupport {
	private apiKey = inject (ApiKeysService);
	protected readonly newKey = signal<string | null>(null);

	protected generate(): void {
		this.apiKey.create({ name: 'My Key' }).subscribe((created) => this.newKey.set(created.key));
		// this.http.post<{ key:string }>('/api/auth/api-keys', { name: 'My Key'}).subscribe((created) => this.newKey.set(created.key));
	}
}
