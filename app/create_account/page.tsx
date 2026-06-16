"use client";

import { useState } from "react";
import { auth } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateAccountPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function register() {
    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      setMessage("Account created successfully. Redirecting...");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: any) {
      setMessage(error.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Create Account
        </h1>

        <p className="text-gray-600 mb-6">
          Create your WattSave AI account to start building your property energy
          profile.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          type="password"
          placeholder="Password minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button
          onClick={register}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        {message && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm">
            {message}
          </div>
        )}

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}