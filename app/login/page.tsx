import type { Metadata } from "next";
import LoginView from "./LoginView";

export const metadata: Metadata = {
  title: "Login — Fortune Tower",
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginView />;
}
