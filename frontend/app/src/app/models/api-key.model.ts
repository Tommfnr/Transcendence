export interface ApiKeyView {
    id: number;
    name: string;
    prefix: string;
    createdAt: string;
    lastUsedAt: string | null;
}

export interface CreatedApiKey extends ApiKeyView {
    key: string;
}

export type ApiKeyInput = Pick<ApiKeyView, 'name'>;
