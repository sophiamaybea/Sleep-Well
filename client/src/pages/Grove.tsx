import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Grove() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/garden");
  }, [setLocation]);
  return null;
}
