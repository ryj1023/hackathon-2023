import Image from "next/image";
import { useState } from "react";
import { api } from "~/utils/api";

const RogerImageTestPage = () => {
  const utils = api.useContext();
  const newHeroImage = api.images.newHero.useMutation();
  const newVillainImage = api.images.newVillain.useMutation();

  const existing = api.images.list.useQuery();

  const [heroName, setHeroName] = useState<string>("");
  const [color, setColor] = useState<string>("White");

  const handleGenerateHero = async () => {
    await newHeroImage.mutateAsync({
      name: heroName,
      samples: 2,
      backgroundColor: color,
    });
    await utils.images.list.invalidate();
  };

  const handleGenerateVillain = async () => {
    await newVillainImage.mutateAsync({
      name: heroName,
      samples: 2,
      backgroundColor: color,
    });
    await utils.images.list.invalidate();
  };

  return (
    <div className="m-5 flex flex-col">
      <h1 className="text-6xl">Image</h1>
      <div className="flex flex-col">
        <h2>Hero</h2>
        <input className="input input-bordered" value={heroName} onChange={(e) => setHeroName(e.target.value)} />
        <h2>Color</h2>
        <select
          className="select select-bordered mb-2"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        >
          <option>White</option>
          <option>Red</option>
          <option>Blue</option>
          <option>Green</option>
          <option>Yellow</option>
          <option>Purple</option>
          <option>Orange</option>
        </select>
        <div className="flex gap-3">
          <button
            className={`btn btn-primary${newHeroImage.isLoading ? " loading" : ""}`}
            onClick={() => void handleGenerateHero()}
            disabled={newHeroImage.isLoading}
          >
            Generate Hero
          </button>
          <button
            className={`btn btn-secondary${newHeroImage.isLoading ? " loading" : ""}`}
            onClick={() => void handleGenerateVillain()}
            disabled={newHeroImage.isLoading}
          >
            Generate Villian
          </button>
        </div>
      </div>

      <hr className="my-5" />

      <h1 className="text-6xl">Existing</h1>
      <div className="flex flex-col">
        {existing.isLoading && <p>Loading...</p>}
        {existing.data?.map(({ name, images }, i) => (
          <div key={name}>
            <h3 className="text-3xl">{name}</h3>
            <div className="flex flex-row flex-wrap">
              {images.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  className="w-64 h-64 m-5 rounded-lg"
                  alt={name}
                  width={256}
                  height={256}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

}

export default RogerImageTestPage