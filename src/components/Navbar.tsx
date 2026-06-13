import { auth } from "@/auth";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  // Check the current user session securely on the server
  const session = await auth();

  return <NavbarClient session={session} />;
}
