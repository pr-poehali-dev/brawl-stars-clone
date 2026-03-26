import { useState } from "react";
import MainMenu from "./MainMenu";
import CharacterSelect from "./CharacterSelect";
import BattleArena from "./BattleArena";
import BattleResults from "./BattleResults";
import PlayerProfile from "./PlayerProfile";
import Leaderboard from "./Leaderboard";
import Shop from "./Shop";
import { CHARACTERS } from "@/data/gameData";

type Screen = "menu" | "character-select" | "battle" | "results" | "profile" | "leaderboard" | "shop";

interface NavData {
  character?: typeof CHARACTERS[0];
  win?: boolean;
  turns?: number;
  time?: number;
}

const Index = () => {
  const [screen, setScreen] = useState<Screen>("menu");
  const [navData, setNavData] = useState<NavData>({});

  const navigate = (nextScreen: string, data?: unknown) => {
    setNavData((data as NavData) || {});
    setScreen(nextScreen as Screen);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  switch (screen) {
    case "menu":
      return <MainMenu onNavigate={navigate} />;

    case "character-select":
      return <CharacterSelect onNavigate={navigate} />;

    case "battle":
      return (
        <BattleArena
          onNavigate={navigate}
          character={navData.character}
        />
      );

    case "results":
      return (
        <BattleResults
          onNavigate={navigate}
          win={navData.win}
          character={navData.character}
          turns={navData.turns}
          time={navData.time}
        />
      );

    case "profile":
      return <PlayerProfile onNavigate={navigate} />;

    case "leaderboard":
      return <Leaderboard onNavigate={navigate} />;

    case "shop":
      return <Shop onNavigate={navigate} />;

    default:
      return <MainMenu onNavigate={navigate} />;
  }
};

export default Index;
