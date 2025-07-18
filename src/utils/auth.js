import Cookies from "js-cookie";

export function getToken() {
  return Cookies.get("token") || null;
}

export function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function isLoggedIn() {
  const token = getToken();
  return isTokenValid(token);
}

export function getUserRole() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.rol || null;
  } catch {
    return null;
  }
}
