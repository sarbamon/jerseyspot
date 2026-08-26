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
  const data = await getProducts("", true);
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
      
      {/* SPONSORED BANNER */}
      <style dangerouslySetInnerHTML={{ __html: `
        .sponsored-section:has(ins[data-ad-status="unfilled"]) {
          display: none !important;
        }
      `}} />
      <div className="sponsored-section mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 mb-12">
        <h3 className="mb-4 text-center text-sm font-bold text-gray-500 uppercase tracking-widest">Sponsored</h3>
        <div className="w-full min-h-[250px] bg-black flex items-center justify-center overflow-hidden">
          {/* AdSense Ad Unit */}
          <ins className="adsbygoogle"
               style={{ display: 'block', minWidth: '300px', minHeight: '250px' }}
               data-ad-client="ca-pub-4279196903220340"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script dangerouslySetInnerHTML={{ __html: `(adsbygoogle = window.adsbygoogle || []).push({});` }} />
        </div>
      </div>
    </main>
  );
}