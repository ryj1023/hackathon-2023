import { useState } from "react";
import { type Language } from "~/server/api/schemas";

const RogerStoryTestPage = () => {
  const [language, setLanguage] = useState<Language>("TypeScript");
  const [heroName, setHeroName] = useState<string>("");
  const [villainName, setVillainName] = useState<string>("");
  const [scene, setScene] = useState<string>("");

  const LANGUAGES = [
    "TypeScript",
    "JavaScript",
    "Python",
    "C#",
    "Haskell",
  ] satisfies Language[];

  return (
    <div className="m-5 flex items-center justify-center p-5">
      <form action="/questions" method="post">
        <h1 className="text-6xl">Storyteller</h1>
        <div className="flex flex-col">
          <h2>Hero</h2>
          <input
            name="heroName"
            className="input-bordered input"
            value={heroName}
            onChange={(e) => setHeroName(e.target.value)}
          />
          <h2>Villan</h2>
          <input
            name="villainName"
            className="input-bordered input"
            value={villainName}
            onChange={(e) => setVillainName(e.target.value)}
          />
          <h2>Scene</h2>
          <input
            name="scene"
            className="input-bordered input"
            value={scene}
            onChange={(e) => setScene(e.target.value)}
          />
          <h2>Language</h2>
          <select
            name="language"
            className="select-bordered select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            {LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
          <button className="btn-primary btn">Start New Story</button>
        </div>
      </form>
    </div>
  );
};

export default RogerStoryTestPage;
