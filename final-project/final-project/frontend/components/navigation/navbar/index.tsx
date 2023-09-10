"use client";

import { ConnectKitButton } from "connectkit";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-6 px-10">
      <p className="text-lg tracking-wider">
        <span className="text-blue">ether</span>
        <span className="text-slate">board</span>
      </p>
      <ConnectKitButton />
    </nav>
  );
}
