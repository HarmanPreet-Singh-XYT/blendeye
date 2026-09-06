import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const target = params?.redirect ? `/auth?mode=signin&redirect=${encodeURIComponent(params.redirect)}` : "/auth?mode=signin";
  redirect(target);
}
