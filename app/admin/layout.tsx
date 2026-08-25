import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Jersey Spot",
  description: "Store management interface for Jersey Spot.",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {children}
    </div>
  );
}
