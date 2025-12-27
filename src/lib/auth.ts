import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    import.meta.env.JWT_SECRET || 'development-secret-change-in-production'
);

const ADMIN_EMAILS = (import.meta.env.ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase());

export interface UserPayload {
    email: string;
    name: string;
    picture?: string;
}

export function isEmailAllowed(email: string): boolean {
    return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function createToken(payload: UserPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as UserPayload;
    } catch {
        return null;
    }
}

export function getGoogleAuthUrl(): string {
    const clientId = import.meta.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${import.meta.env.SITE_URL}/api/auth/callback`;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function getGoogleTokens(code: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: import.meta.env.GOOGLE_CLIENT_ID,
            client_secret: import.meta.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${import.meta.env.SITE_URL}/api/auth/callback`,
            grant_type: 'authorization_code',
        }),
    });

    return response.json();
}

export async function getGoogleUserInfo(accessToken: string): Promise<UserPayload> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();
    return {
        email: data.email,
        name: data.name,
        picture: data.picture,
    };
}
