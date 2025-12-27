/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly GOOGLE_CLIENT_ID: string;
    readonly GOOGLE_CLIENT_SECRET: string;
    readonly SPREADSHEET_ID: string;
    readonly ADMIN_EMAILS: string;
    readonly JWT_SECRET: string;
    readonly SITE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare namespace App {
    interface Locals {
        user?: {
            email: string;
            name: string;
            picture?: string;
            accessToken?: string;
            refreshToken?: string;
        };
    }
}
