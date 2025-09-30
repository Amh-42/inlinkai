import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { authLogger, extractRequestMeta } from "@/lib/auth-logger";
import { NextRequest, NextResponse } from "next/server";

// Wrap the handlers with comprehensive logging
const originalHandlers = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const meta = extractRequestMeta(request);
  const pathname = new URL(request.url).pathname;
  
  authLogger.info('AUTH', `GET request started`, {
    pathname,
    searchParams: Object.fromEntries(new URL(request.url).searchParams.entries())
  }, meta);

  try {
    const response = await originalHandlers.GET(request);
    const duration = Date.now() - startTime;
    
    authLogger.info('AUTH', `GET request completed`, {
      pathname,
      status: response.status,
      duration: `${duration}ms`
    }, meta);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    authLogger.error('AUTH', `GET request failed`, error, {
      pathname,
      duration: `${duration}ms`
    }, meta);
    
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Authentication request failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const meta = extractRequestMeta(request);
  const pathname = new URL(request.url).pathname;
  
  // Log social sign-in attempts specifically
  if (pathname.includes('/sign-in/social')) {
    const searchParams = new URL(request.url).searchParams;
    const provider = searchParams.get('provider') || 'unknown';
    authLogger.socialSignInAttempt(provider, pathname, meta.userAgent, meta.ip);
  }
  
  authLogger.info('AUTH', `POST request started`, {
    pathname,
    contentType: request.headers.get('content-type'),
    hasBody: request.body !== null
  }, meta);

  try {
    const response = await originalHandlers.POST(request);
    const duration = Date.now() - startTime;
    
    // Log successful social sign-in
    if (pathname.includes('/sign-in/social') && response.status === 200) {
      const searchParams = new URL(request.url).searchParams;
      const provider = searchParams.get('provider') || 'unknown';
      authLogger.info('SOCIAL', `Social sign-in request successful`, {
        provider,
        status: response.status
      }, meta);
    }
    
    authLogger.info('AUTH', `POST request completed`, {
      pathname,
      status: response.status,
      duration: `${duration}ms`,
      hasSetCookie: response.headers.has('set-cookie')
    }, meta);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log failed social sign-in specifically
    if (pathname.includes('/sign-in/social')) {
      const searchParams = new URL(request.url).searchParams;
      const provider = searchParams.get('provider') || 'unknown';
      authLogger.socialSignInError(provider, error, pathname, meta.userAgent, meta.ip);
    }
    
    authLogger.error('AUTH', `POST request failed`, error, {
      pathname,
      duration: `${duration}ms`,
      errorMessage: error?.message,
      errorStack: error?.stack
    }, meta);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Authentication request failed',
        timestamp: new Date().toISOString(),
        path: pathname
      },
      { status: 500 }
    );
  }
}
