import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import PromoSection from "@/components/PromoSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import CustomJerseyBanner from "@/components/CustomJerseyBanner";
import WhyChooseUs from "@/components/WhyChooseUs";
import Reviews from "@/components/Reviews";
import { getProducts, getSiteConfig } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getProducts();
  const products = data.products;

  let siteConfig = {
    heroImage: "/images/hero.webp",
    heroTitle: "JERSEY SPOT",
    heroSubtitle: "PREMIUM JERSEYS FOR EVERY FAN"
  };
  try {
    const configData = await getSiteConfig(true);
    if (configData.config) {
      siteConfig = configData.config;
    }
  } catch (error) {
    console.error("Failed to fetch site config", error);
  }

  return (
    <main className="min-h-screen bg-black">
      <Hero 
        image={siteConfig.heroImage} 
        title={siteConfig.heroTitle} 
        subtitle={siteConfig.heroSubtitle} 
      />
      <CategorySection />
      <PromoSection />
      <FeaturedProducts />
      <CustomJerseyBanner />
      <WhyChooseUs />
      <Reviews />
    </main>
  );
}