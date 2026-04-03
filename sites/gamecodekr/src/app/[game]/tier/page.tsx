import { GAMES } from "@/lib/games";
import { ClientRedirect } from "@/components/ClientRedirect";

export function generateStaticParams() {
  return GAMES
    .filter((g) => g.hasTier)
    .map((g) => ({ game: g.slug }));
}

export default function TierRedirect({ params }: { params: { game: string } }) {
  return <ClientRedirect game={params.game} type="tier" />;
}
