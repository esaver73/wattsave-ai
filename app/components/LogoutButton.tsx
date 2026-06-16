"use client";

import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut(auth);

      router.push("/login");

      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <button
      onClick={logout}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}