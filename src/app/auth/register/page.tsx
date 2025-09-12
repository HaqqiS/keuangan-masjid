// "use client";
import AuthLayout from "@/app/_components/layouts/auth-layout";
import RegisterForm from "./register-form";

export default function LoginPage() {
  return (
    <>
      <AuthLayout
        title="Register"
        description="Enter your details to continue."
      >
        <RegisterForm />
      </AuthLayout>
    </>
  );
}
