"use server";

import { signIn as authSignIn, signOut as authSignOut } from "@/auth";

/**
 * Server action to sign in with GitHub.
 */
export async function loginAction() {
  await authSignIn("github");
}

/**
 * Server action to sign out.
 */
export async function logoutAction() {
  await authSignOut();
}
