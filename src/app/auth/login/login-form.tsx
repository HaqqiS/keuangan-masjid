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
import { toast } from "sonner";

export default function LoginForm() {
  // HOOK FORMS
  const loginForm = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  //HANDLERS
  const handleSubmit = async (data: LoginFormSchema) => {
    console.log("LOGIN DATA: ", data);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
    });

    if (result?.ok) {
      toast("Login successful.");
    } else if (result?.error) {
      toast("Login failed.");
    }
  };

  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   const formData = new FormData(event.currentTarget);
  //   const email = formData.get("email");
  //   const password = formData.get("password");

  //   console.log("LOGIN DATA: ", { email, password });
  //   await signIn("credentials", {
  //     email,
  //     password,
  //     redirectTo: "/",
  //   });
  // };

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
            {/* <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Ahmad@mail.com"
            required
          /> */}
          </div>
          <div className="grid gap-3">
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required /> */}
          </div>
          <div className="flex flex-col gap-3">
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
