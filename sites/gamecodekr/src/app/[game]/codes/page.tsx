import { getAllGameSlugs } from "@/lib/games";
import { ClientRedirect } from "@/components/ClientRedirect";

export function generateStaticParams() {
  return getAllGameSlugs().map((game) => ({ game }));
}

export default function CodesRedirect({ params }: { params: { game: string } }) {
  return <ClientRedirect game={params.game} type="codes" />;
}
