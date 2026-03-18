"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">
          Logged in as {session.user.name}
        </span>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded font-bold hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="bg-gray-900 text-white px-4 py-2 rounded font-bold hover:bg-gray-800 transition"
    >
      Sign in with GitHub
    </button>
  );
}
