const reviews = [
  {
    title: "PERFECT QUALITY",
    text: "The jersey quality is amazing and feels exactly like original match wear. Totally worth it.",
    name: "Rahul Kumar",
  },
  {
    title: "BEST FIT EVER",
    text: "Fitting is just perfect and very comfortable for daily wear. Will definitely order again.",
    name: "Vishal Jain",
  },
  {
    title: "HIGHLY RECOMMENDED",
    text: "Great collection and fast delivery. The design and fabric both are top notch.",
    name: "Rajesh Kumar",
  },
];

export default function Reviews() {
  return (
    <section className="bg-black px-5 py-14 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-[1420px]">

        <h2 className="section-title mb-10 text-center">
          WHAT OUR CUSTOMERS SAY
        </h2>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {reviews.map((review) => (
            <article
              key={review.name}
              className="min-h-[200px] border border-[#777] px-7 py-6 text-center"
            >
              <div className="mb-5 text-xl tracking-[3px] text-[#f5d45c]">
                ★★★★★
              </div>

              <h3 className="font-serif text-[15px] font-bold text-[#f5d45c]">
                {review.title}
              </h3>

              <p className="mt-4 font-serif text-[14px] leading-6 text-[#f5d45c]">
                {review.text}
              </p>

              <p className="mt-6 font-serif text-[13px] font-bold text-white">
                {review.name}
              </p>
            </article>
          ))}

        </div>
      </div>
    </section>
  );
}