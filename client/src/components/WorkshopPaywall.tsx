interface Props {
  inline?: boolean;
}

export default function WorkshopPaywall({ inline = false }: Props) {
  if (inline) {
    return (
      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground mb-2">
          Upgrade to write in every exercise and save your work to the Garden.
        </p>
        <a
          href="/cultivator"
          className="inline-block px-4 py-1.5 text-xs border border-gold text-gold rounded hover:bg-gold hover:text-background transition"
        >
          Become a Cultivator
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gold/30 bg-gold/5 p-5 mt-2">
      <p className="font-serif text-base mb-1">This exercise is for Cultivator members</p>
      <p className="text-sm text-muted-foreground mb-4">
        Cultivators get access to every workshop exercise, can save their responses directly to
        the Garden, and attend unlimited sessions each month.
      </p>
      <a
        href="/cultivator"
        className="inline-block px-5 py-2 bg-gold/90 text-background text-sm rounded hover:bg-gold transition"
      >
        Upgrade — Cultivator plan
      </a>
      <p className="text-xs text-muted-foreground mt-3">
        Already subscribed?{" "}
        <a href="/edit-profile" className="underline">
          Check your account
        </a>
        .
      </p>
    </div>
  );
}
