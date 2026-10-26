import { Component, inject, signal} from '@angular/core';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { ButtonDirective } from '../../components/button/button.directive';
import { ApiKeysService } from '../../services/api-keys.service';
import { ErrorBannerComponent } from '../../components/error-banner/error-banner';

@Component({
    selector: 'app-help-support',
    imports: [ TitleBarComponent, ButtonDirective, ErrorBannerComponent],
    templateUrl: './helpSupport.html',
    styles: ``,
})

export class HelpSupport {
	private apiKey = inject (ApiKeysService);
	protected readonly newKey = signal<string | null>(null);
	protected readonly bannerErrors = signal<string[]>([]);

	protected generate(): void {
		this.bannerErrors.set([]);
		this.apiKey.create({ name: 'My Key' }).subscribe({
			next: (created) => this.newKey.set(created.key),
			error: () => this.bannerErrors.set(['Could not generate an API key, please try again']),
		});
		// this.http.post<{ key:string }>('/api/auth/api-keys', { name: 'My Key'}).subscribe((created) => this.newKey.set(created.key));
	}
}
