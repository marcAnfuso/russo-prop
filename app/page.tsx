import { Suspense } from "react";
import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import FeaturedDevelopments from "@/components/FeaturedDevelopments";
import WhyRusso from "@/components/WhyRusso";
import GoogleReviews from "@/components/GoogleReviews";
import { fetchFeaturedProperties } from "@/lib/xintel";

async function FeaturedPropertiesLoader() {
  const featured = await fetchFeaturedProperties();
  return <FeaturedProperties properties={featured} />;
}

function FeaturedPropertiesSkeleton() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-14 space-y-3">
          <div className="h-4 w-40 bg-gray-100 rounded-full mx-auto animate-pulse" />
          <div className="h-8 w-72 bg-gray-100 rounded-full mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<FeaturedPropertiesSkeleton />}>
        <FeaturedPropertiesLoader />
      </Suspense>
      <FeaturedDevelopments />
      <WhyRusso />
      <GoogleReviews />
    </>
  );
}
