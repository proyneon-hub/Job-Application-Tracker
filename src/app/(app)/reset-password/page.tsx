import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Choose a new password" };

// Reached from the reset email link: /auth/confirm logs the user in first, so this
// page lives with the other logged-in pages.
export default function ResetPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-sm py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Choose a new password</h1>
          </CardTitle>
          <CardDescription>You&apos;ll stay logged in after saving it.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
