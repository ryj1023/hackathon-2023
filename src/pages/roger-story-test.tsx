import { useState } from "react";
import { type OpenAIMessage, type StoryOutcome } from "~/server/api/schemas";

import { api } from "~/utils/api";


const OUTCOMES: [StoryOutcome, string][] = [
  ["success", "Success"],
  ["failure", "Failure"],
  ["complete", "Complete"],
  ["defeat", "Defeat"],
];

const RogerStoryTestPage = () => {
  const utils = api.useContext();
  const [heroName, setHeroName] = useState<string>("");
  const [villainName, setVillainName] = useState<string>("");
  const [scene, setScene] = useState<string>("");
  const [story, setStory] = useState<OpenAIMessage[]>([]);
  const [outcome, setOutcome] = useState<StoryOutcome | undefined>();

  const tokens = api.storyTeller.tokensUsed.useQuery();

  const next = api.storyTeller.next.useMutation();

  const createNewStory = api.storyTeller.new.useMutation();

  const handleStartNewStory = async () => {
    const story = await createNewStory.mutateAsync({ heroName, villainName, scene });
    setStory(story);
    await utils.storyTeller.tokensUsed.invalidate();
  };

  const handleNext = async () => {
    // nothing to do here...
    if (!outcome) return;

    const nextStory = await next.mutateAsync({
      storySoFar: story,
      outcome,
    });

    setStory(nextStory);
    await utils.storyTeller.tokensUsed.invalidate();
  }

  const displayText = story.filter(m => m.role === 'assistant').map(m => m.content);

  return (
    <div className="m-5 flex flex-col">
      <h1 className="text-6xl">Storyteller</h1>
      <div className="flex flex-col">
        <h2>Hero</h2>
        <input className="input input-bordered" value={heroName} onChange={(e) => setHeroName(e.target.value)} />
        <h2>Villan</h2>
        <input className="input input-bordered" value={villainName} onChange={(e) => setVillainName(e.target.value)} />
        <h2>Scene</h2>
        <input className="input input-bordered" value={scene} onChange={(e) => setScene(e.target.value)} />
        <button
          className="btn btn-primary"
          onClick={() => void handleStartNewStory()}
          disabled={createNewStory.isLoading}
        >
          {story.length === 0 ? 'Start New' : 'Restart'} Story
        </button>
      </div>
      <div>
        <ul>
          {displayText.map((text, i) => (
            <li key={i} className="mb-5">{text}</li>
          ))}
        </ul>
        <select
          className="select select-bordered"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value ? e.target.value as StoryOutcome : undefined)}
        >
          <option />
          {OUTCOMES.map(([outcome, label]) => (
            <option key={outcome} value={outcome}>{label}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => void handleNext()} disabled={!outcome}>
          Next
        </button>
      </div>
      <div>
        <h2>Tokens Used</h2>
        <h3>{tokens.data}</h3>
      </div>
    </div>
  )
}

export default RogerStoryTestPage