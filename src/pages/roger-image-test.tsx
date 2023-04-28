import { useState } from "react";
import AvatarSelector from "~/components/AvatarSelector";

const RogerImageTestPage = () => {
  const [heroName, setHeroName] = useState<string>("");

  return (
    <div className="m-5 flex flex-col">
      <h1 className="text-6xl">Image</h1>
      <div className="flex flex-col">
        <h2>Hero</h2>
        <input className="input input-bordered" value={heroName} onChange={(e) => setHeroName(e.target.value)} />
      </div>
      <AvatarSelector
        type="Hero"
        onSelect={console.log}
        name={heroName}
      />
      <AvatarSelector
        type="Villain"
        onSelect={console.log}
        name={heroName}
      />

    </div>
  );

}

export default RogerImageTestPage