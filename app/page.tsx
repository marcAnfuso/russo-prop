import type { Metadata } from "next";
import { Suspense } from "react";
import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import NewListings from "@/components/NewListings";
import FeaturedDevelopments from "@/components/FeaturedDevelopments";
import StatsSection from "@/components/StatsSection";
import HistoriasMudanza from "@/components/HistoriasMudanza";
import FeaturedOpportunities from "@/components/FeaturedOpportunities";
import { getHomeFeatured, getHomeNewListings } from "@/lib/homepage-lists";
import { fetchOpportunityProperties } from "@/lib/opportunities";

export const metadata: Metadata = {
  title: "Compra, alquilá y tasá en zona oeste",
  description:
    "Más de 700 propiedades en San Justo, Ramos Mejía, Haedo, Morón y toda zona oeste. Russo Propiedades: 30 años haciendo las cosas distinto.",
  alternates: { canonical: "https://russo-prop.vercel.app" },
};

async function FeaturedPropertiesLoader() {
  const featured = await getHomeFeatured(4);
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

async function NewListingsLoader() {
  const latest = await getHomeNewListings(6);
  return <NewListings properties={latest} />;
}

function NewListingsSkeleton() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-14 space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded-full mx-auto animate-pulse" />
          <div className="h-8 w-64 bg-gray-200 rounded-full mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

async function FeaturedOpportunitiesLoader() {
  const properties = await fetchOpportunityProperties();
  return <FeaturedOpportunities properties={properties} />;
}

function FeaturedOpportunitiesSkeleton() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12 space-y-3">
          <div className="h-4 w-40 bg-gray-200 rounded-full mx-auto animate-pulse" />
          <div className="h-8 w-72 bg-gray-200 rounded-full mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-gray-200 animate-pulse" />
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
      <StatsSection />
      <Suspense fallback={<FeaturedPropertiesSkeleton />}>
        <FeaturedPropertiesLoader />
      </Suspense>
      <Suspense fallback={<NewListingsSkeleton />}>
        <NewListingsLoader />
      </Suspense>
      <Suspense fallback={<FeaturedOpportunitiesSkeleton />}>
        <FeaturedOpportunitiesLoader />
      </Suspense>
      <FeaturedDevelopments />
      <HistoriasMudanza />
    </>
  );
}
