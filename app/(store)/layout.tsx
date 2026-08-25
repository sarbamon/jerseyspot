import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { StoreProvider } from "@/components/StoreProvider";
import LoginModal from "@/components/LoginModal";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <StoreProvider>
        <Header />
        <div className="flex-1">{children}</div>
        <LoginModal />
        <Footer />
      </StoreProvider>
    </div>
  );
}
