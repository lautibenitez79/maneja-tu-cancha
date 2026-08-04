import type { ReactNode } from "react";
import { AuthProvider } from "../contexts/AuthContext";

interface Props {
  children: ReactNode;
}

export default function AppProvider({
  children,
}: Props) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}