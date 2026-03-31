import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TakeoverScreen {
  id: string;
  title: string;
  content: string;
  ctaText: string;
  ctaUrl: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  isActive: boolean;
  displayDuration: number;
  priority: number;
}

export default function PageGallery() {
  const [screens, setScreens] = useState<TakeoverScreen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScreens();
  }, []);

  const fetchScreens = async () => {
    try {
      const response = await fetch("/api/takeover-screens");
      if (!response.ok) {
        throw new Error("Failed to fetch takeover screens");
      }
      const data = await response.json();
      setScreens(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Takeover Screen Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screens.map((screen) => (
          <Card
            key={screen.id}
            className="p-6"
            style={{
              backgroundColor: screen.bgColor,
              color: screen.textColor,
            }}
          >
            <h2 className="text-xl font-semibold mb-3">{screen.title}</h2>
            <p className="mb-4 text-sm">{screen.content}</p>
            <div className="flex items-center justify-between">
              <Button
                style={{ backgroundColor: screen.accentColor }}
                className="text-white"
                onClick={() => window.open(screen.ctaUrl, "_blank")}
              >
                {screen.ctaText}
              </Button>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  screen.isActive ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                {screen.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-3 text-xs opacity-70">
              Priority: {screen.priority} | Duration: {screen.displayDuration}s
            </div>
          </Card>
        ))}
      </div>
      {screens.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No takeover screens available yet.
        </p>
      )}
    </div>
  );
}
