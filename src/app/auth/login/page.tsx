"use client";
import AuthLayout from "@/app/_components/layouts/auth-layout";
import LoginForm from "@/app/auth/login/login-form";

export default function LoginPage() {
  return (
    <>
      <AuthLayout
        title="Login"
        description="Enter your email and password to continue."
      >
        <LoginForm />
      </AuthLayout>
    </>
  );
}
