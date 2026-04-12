import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen studio-paper text-foreground flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-xl">
          <h1 className="font-serif text-3xl md:text-4xl mb-4">We’re making some changes</h1>
          <p className="text-muted-foreground text-base md:text-lg">The site is temporarily disabled.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}