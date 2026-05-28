import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeaturedProducts />
    </main>
  );
}