import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ApiKeyInput, ApiKeyView, CreatedApiKey } from "../models/api-key.model";

@Injectable({ providedIn: 'root'})
export class ApiKeysService {
    private http = inject(HttpClient);

    findAll() {
        return this.http.get<ApiKeyView[]>('/api/auth/api-keys');
    }

    create(body: ApiKeyInput) {
        return this.http.post<CreatedApiKey>('/api/auth/api-keys', body);
    }

    revoke(keyId: number) {
        return this.http.delete<void>(`/api/auth/api-keys/${keyId}`);
    }
}
