import { cookies } from "next/headers";
import {
  AUTH_USER_COOKIE,
  decodeUserCookie,
  getUserDisplayName,
} from "@/services/authService";

export async function getServerUser() {
  const jar = await cookies();
  const raw = jar.get(AUTH_USER_COOKIE)?.value;
  return decodeUserCookie(raw);
}

export async function getServerDisplayName() {
  const user = await getServerUser();
  return getUserDisplayName(user);
}

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
