import type { NextRequest } from 'next/server';
import { getToken, type JWT } from 'next-auth/jwt';

// Duplicated from @aotf/lib to avoid circular dependency
function getAuthCookieNames(additional: string[] = []): string[] {
	const unique = new Set<string>();
	const candidates = [
		...additional,
		process.env.NEXTAUTH_SESSION_COOKIE_NAME?.trim(),
		process.env.NEXTAUTH_COOKIE_NAME?.trim(),
		process.env.AUTH_COOKIE_NAME?.trim(),
		'__Secure-auth-token',
		'__Secure-next-auth.session-token',
		'next-auth.session-token',
		'auth-token',
	];

	for (const candidate of candidates) {
		if (candidate && !unique.has(candidate)) {
			unique.add(candidate);
		}
	}

	return Array.from(unique);
}

type GetNextAuthTokenParams = {
	request: NextRequest;
	secret: string;
	cookieNames?: string[];
};

function buildCookieCandidateList(additional: string[] = []): string[] {
	return getAuthCookieNames(additional);
}

export async function getNextAuthToken({
	request,
	secret,
	cookieNames = []
}: GetNextAuthTokenParams): Promise<JWT | null> {
	const candidates = buildCookieCandidateList(cookieNames);

	for (const name of candidates) {
		try {
			const token = await getToken({ req: request, secret, cookieName: name });
			if (token) {
				return token;
			}
		} catch (error) {
			// Ignore errors from malformed/legacy cookies and continue to next candidate
			console.warn(`Failed to parse token from cookie "${name}":`, error instanceof Error ? error.message : error);
			continue;
		}
	}

	// Try default token extraction as final fallback
	try {
		return await getToken({ req: request, secret });
	} catch (error) {
		console.warn('Failed to parse default token:', error instanceof Error ? error.message : error);
		return null;
	}
}
