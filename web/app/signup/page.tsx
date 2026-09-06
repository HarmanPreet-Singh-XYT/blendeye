import { redirect } from "next/navigation";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const target = params?.redirect ? `/auth?mode=signup&redirect=${encodeURIComponent(params.redirect)}` : "/auth?mode=signup";
  redirect(target);
}
