// Next.js 16 "proxy" (eski adıyla middleware) convention'ı + NextAuth v4.
// Kimliği doğrulanmamış kullanıcıları authOptions'taki pages.signIn ("/login")
// sayfasına yönlendirerek dashboard route'larını edge'de korur.
import middleware from "next-auth/middleware";

export default middleware;
export const proxy = middleware;

export const config = {
  matcher: ["/dashboard/:path*"],
};
