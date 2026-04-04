/**
 * API utility with automatic token refresh
 */

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/**
 * Refresh the access token using the refresh token cookie
 */
async function refreshAccessToken(): Promise<string> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include", // Include cookies
  });

  if (!response.ok) {
    // Refresh token is invalid or expired, redirect to login
    localStorage.removeItem("shikshanetra_token");
    localStorage.removeItem("shikshanetra_user");
    localStorage.removeItem("shikshanetra_logged_in");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  const data = await response.json();
  const newToken = data.accessToken;

  // Update stored token
  localStorage.setItem("shikshanetra_token", newToken);

  return newToken;
}

/**
 * Get current access token, refreshing if necessary
 */
async function getValidToken(): Promise<string | null> {
  let token = localStorage.getItem("shikshanetra_token");

  if (!token) {
    return null;
  }

  // Try to use current token first
  return token;
}

/**
 * Fetch with automatic token refresh on 401 errors
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getValidToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  // Add authorization header
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  // Make the request
  let response = await fetch(url, requestOptions);

  // If unauthorized and not already refreshing, try to refresh token
  if (response.status === 401 && !isRefreshing) {
    // Prevent multiple simultaneous refresh attempts
    if (!refreshPromise) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken();
    }

    try {
      const newToken = await refreshPromise;
      
      // Retry the original request with new token
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  }

  return response;
}

/**
 * Wrapper for GET requests with auth
 */
export async function getWithAuth(url: string): Promise<Response> {
  return fetchWithAuth(url, { method: "GET" });
}

/**
 * Wrapper for POST requests with auth
 */
export async function postWithAuth(
  url: string,
  body?: any,
  contentType: string = "application/json"
): Promise<Response> {
  const options: RequestInit = {
    method: "POST",
  };

  if (body) {
    if (contentType === "application/json") {
      options.body = JSON.stringify(body);
      options.headers = { "Content-Type": "application/json" };
    } else if (body instanceof FormData) {
      options.body = body;
      // Don't set Content-Type for FormData, browser will set it with boundary
    }
  }

  return fetchWithAuth(url, options);
}
