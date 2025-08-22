"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { loginFormSchema, type LoginFormSchema } from "@/types/user.types";
import { useForm } from "react-hook-form";
// import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import InputPassword from "@/app/_components/shared/input-password";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  // HOOK FORMS
  const loginForm = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { setError } = loginForm;

  //HANDLERS
  const handleSubmit = async (data: LoginFormSchema) => {
    console.log("LOGIN DATA: ", data);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("root", {
        type: "manual",
        message: "Email atau password yang Anda masukkan salah.",
      });
    } else if (result?.ok) {
      toast.success("Login berhasil!");

      router.push(callbackUrl ?? "/");
    }
  };

  return (
    // <form onSubmit={handleSubmit}>
    <Form {...loginForm}>
      <form onSubmit={loginForm.handleSubmit(handleSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-3">
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ahmad@mail.com"
                      {...field}
                      autoFocus
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-3">
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    {/* <Input type="password" {...field} required /> */}
                    <InputPassword {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required /> */}
          </div>
          <div className="flex flex-col gap-3">
            <FormField
              control={loginForm.control}
              name="root"
              render={({ fieldState }) => (
                <FormMessage>{fieldState.error?.message}</FormMessage>
              )}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </div>
        {/* <div className="mt-4 text-center text-sm">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="underline underline-offset-4">
            Login
          </Link>
        </div> */}
      </form>
    </Form>
  );
}
