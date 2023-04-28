import { useState } from "react";
import { type Language } from "~/server/api/schemas";
import AvatarSelector from "~/components/AvatarSelector";
// import BackgroundImage from "~/images/image-background.png";
import Image from "next/image";

const RogerStoryTestPage = () => {
  const [language, setLanguage] = useState<Language>("TypeScript");
  const [heroName, setHeroName] = useState<string>("");
  const [heroImage, setHeroImage] = useState<string>(
    "/images/avatars/Green Thumb/img-K1HK0jB5CDU95SeI8tCxOx1m.png"
  );
  const [villainName, setVillainName] = useState<string>("");
  const [villainImage, setVillainImage] = useState<string>(
    "/images/avatars/MODOK/img-J7lP2m93lbDITd1fiqKcJAgW.png"
  );
  const [scene, setScene] = useState<string>("");

  console.log("heroImage", heroImage);
  console.log("villainImage", villainImage);

  const LANGUAGES = [
    "TypeScript",
    "JavaScript",
    "Python",
    "C#",
    "Haskell",
  ] satisfies Language[];

  return (
    <div
      className="h-100 flex items-center justify-center"
      style={{
        height: "100vh",
      }}
    >
      <Image
        src="/images/hero-background.png"
        layout="fill"
        objectFit="cover"
        quality={100}
      />
      <div className="card m-5 flex items-center justify-center bg-white p-5">
        <form action="/questions" method="post">
          <h1 className="mb-2 text-3xl">Create your story</h1>
          <div className="flex flex-col">
            <div className="flex">
              <div className="flex flex-col">
                <h2>Hero</h2>
                <input
                  name="heroName"
                  className="input-bordered input mb-2 mr-2 w-64"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                />
                <div className="mr-2">
                  <input
                    name="heroImage"
                    style={{ display: "none" }}
                    value={heroImage}
                    onChange={() => {}}
                  />
                  <AvatarSelector
                    type="Hero"
                    onSelect={setHeroImage}
                    name={heroName}
                  />
                </div>
              </div>
              <div>
                <h2 className="ml-2">Villain</h2>
                <input
                  name="villainName"
                  className="input-bordered input mb-2 ml-2 w-64"
                  value={villainName}
                  onChange={(e) => setVillainName(e.target.value)}
                />
                <input
                  style={{ display: "none" }}
                  name="villainImage"
                  className="d-none"
                  value={villainImage}
                  onChange={() => {}}
                />
                <div className="ml-2">
                  <AvatarSelector
                    type="Villain"
                    onSelect={setVillainImage}
                    name={villainName}
                  />
                </div>
              </div>
            </div>
            <div className="flex">
              <div className="mr-2">
                <h2>Scene</h2>
                <input
                  name="scene"
                  className="input-bordered input w-64"
                  value={scene}
                  onChange={(e) => setScene(e.target.value)}
                />
              </div>
              <div className="mb-5 ml-2">
                <h2>Language</h2>
                <select
                  name="language"
                  className="select-bordered select  w-64"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                >
                  {LANGUAGES.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn-primary btn">Start New Story</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RogerStoryTestPage;
