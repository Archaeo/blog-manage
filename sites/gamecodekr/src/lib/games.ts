import type { GameConfig } from "./types";

export const GAMES: GameConfig[] = [
  {
    slug: "blox-fruits",
    title: "블록스 프루츠",
    titleEn: "Blox Fruits",
    icon: "🍎",
    description: "열매 능력으로 싸우는 원피스 스타일 RPG",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "king-legacy",
    title: "킹 레거시",
    titleEn: "King Legacy",
    icon: "👑",
    description: "바다를 탐험하며 열매 능력을 모으는 RPG",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "fruit-battlegrounds",
    title: "프루츠 배틀그라운드",
    titleEn: "Fruit Battlegrounds",
    icon: "⚔️",
    description: "열매 능력으로 PvP 대전하는 격투 게임",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "anime-adventures",
    title: "애니메 어드벤처",
    titleEn: "Anime Adventures",
    icon: "⭐",
    description: "애니메 캐릭터를 배치하는 타워 디펜스",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "murder-mystery-2",
    title: "머더 미스터리 2",
    titleEn: "Murder Mystery 2",
    icon: "🔪",
    description: "범인을 찾아내는 추리 게임",
    hasCode: true,
    hasTier: false,
  },
  {
    slug: "pet-simulator-99",
    title: "펫 시뮬레이터 99",
    titleEn: "Pet Simulator 99",
    icon: "🐾",
    description: "귀여운 펫을 수집하고 키우는 시뮬레이터",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "shindo-life",
    title: "신도 라이프",
    titleEn: "Shindo Life",
    icon: "🍥",
    description: "나루토 스타일 닌자 RPG",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "tower-defense-simulator",
    title: "타워 디펜스 시뮬레이터",
    titleEn: "Tower Defense Simulator",
    icon: "🏰",
    description: "타워를 세워 적을 막는 전략 게임",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "all-star-tower-defense",
    title: "올스타 타워 디펜스",
    titleEn: "All Star Tower Defense",
    icon: "🌟",
    description: "애니메 캐릭터로 타워 디펜스",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "bee-swarm-simulator",
    title: "비 스웜 시뮬레이터",
    titleEn: "Bee Swarm Simulator",
    icon: "🐝",
    description: "벌떼를 모아 꿀을 수집하는 시뮬레이터",
    hasCode: true,
    hasTier: false,
  },
];

export function getGameBySlug(slug: string): GameConfig | undefined {
  return GAMES.find((g) => g.slug === slug);
}

export function getAllGameSlugs(): string[] {
  return GAMES.map((g) => g.slug);
}
