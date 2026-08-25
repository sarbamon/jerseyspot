
import {
  Sparkles,
  Shirt,
  BadgeCheck,
  Trophy,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "PREMIUM QUALITY FABRIC",
  },
  {
    icon: Shirt,
    title: "AUTHENTIC DESIGNS",
  },
  {
    icon: BadgeCheck,
    title: "PERFECT FIT GUARANTEE",
  },
  {
    icon: Trophy,
    title: "TRUSTED BY FANS",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-black px-5 py-16 lg:px-10">
      <div className="mx-auto max-w-[1420px]">

        <h2 className="section-title mb-10 text-center">
          WHY CHOOSE US
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title }) => (
            <div
              key={title}
              className="flex min-h-[160px] flex-col items-center justify-center border border-[#d8b92e] px-5 text-center"
            >
              <Icon
                size={48}
                strokeWidth={1.5}
                className="mb-7 text-[#f5d45c]"
              />

              <h3 className="font-serif text-[15px] text-[#f5d45c]">
                {title}
              </h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}