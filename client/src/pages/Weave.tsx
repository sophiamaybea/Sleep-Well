import { useParams } from "wouter";
import { PoemWeaveRoom } from "@/components/PoemWeaveRoom";

export default function WeavePage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div className="p-8">Weave not found</div>;
  return <PoemWeaveRoom weaveId={id} />;
}
