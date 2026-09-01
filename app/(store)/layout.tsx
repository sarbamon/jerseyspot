import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { StoreProvider } from "@/components/StoreProvider";
import LoginModal from "@/components/LoginModal";
import { getSiteConfig } from "@/lib/api";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: { name: string; href: string }[] = [];
  try {
    const configData = await getSiteConfig(true);
    if (configData.config && configData.config.categories) {
      categories = configData.config.categories;
    }
  } catch (err) {
    console.error("Failed to load layout categories:", err);
  }

  // Fallback to defaults if no categories are configured
  if (categories.length === 0) {
    categories = [
      { name: "Player Version", href: "/shop?category=player-version" },
      { name: "Fan Version", href: "/shop?category=fan-version" },
      { name: "Sets", href: "/shop?category=sets" },
      { name: "Retro", href: "/shop?category=retro" },
      { name: "Recommended", href: "/shop?category=recommended" },
    ];
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <StoreProvider>
        <Header categories={categories} />
        <div className="flex-1">{children}</div>
        <LoginModal />
        <Footer categories={categories} />
      </StoreProvider>
    </div>
  );
}
