"use client";

import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
      }}
    >
      <Suspense fallback={<p>Loading...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
