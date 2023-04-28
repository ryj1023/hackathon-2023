import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import getRawBody from "raw-body";
import { type OpenAIMessage, type StoryOutcome } from "~/server/api/schemas";
import Link from "next/link";
import { useRouter } from "next/router";

import { api } from "~/utils/api";

type Language = "TypeScript" | "JavaScript" | "Python" | "C#" | "Haskell";

type storyPromptData = {
  heroName: string;
  villainName: string;
  scene: string;
  heroImage: string;
  villainImage: string;
  language: Language;
};

const OUTCOMES: [StoryOutcome, string][] = [
  ["success", "Success"],
  ["failure", "Failure"],
  ["complete", "Complete"],
  ["defeat", "Defeat"],
];

const Questions = ({ promptData }) => {
  const [allAnswers, setAllAnswers] = useState<boolean[]>([]);
  const [story, setStory] = useState<OpenAIMessage[]>([]);
  const [question, setQuestion] = useState<QuestionReturn | undefined>();
  const [difficulty, setDifficulty] = useState<number>(1);
  const { heroName, villainName, scene, language, heroImage, villainImage } =
    promptData;
  const utils = api.useContext();
  const tokens = api.storyTeller.tokensUsed.useQuery();
  const next = api.storyTeller.next.useMutation();
  const createNewStory = api.storyTeller.new.useMutation();
  const nextQuestion = api.questioner.question.useMutation();

  const getStoryOutcome = (isCorrectAnswer: boolean) => {
    const wrongAnswerCount = allAnswers.filter((a) => !a);
    if (wrongAnswerCount.length === 2) return "defeat";
    if (allAnswers.length === 5) return "complete";
    if (isCorrectAnswer) {
      setAllAnswers((prevState) => [...prevState, true]);
      return "success";
    }
    if (!isCorrectAnswer) {
      setAllAnswers((prevState) => [...prevState, false]);
      return "failure";
    }
  };

  const handleNext = async (outcome) => {
    console.log("outcome", outcome);
    // nothing to do here...
    if (!outcome) return;
    const nextStory = await next.mutateAsync({
      storySoFar: story,
      outcome,
    });

    setStory(nextStory);
    setTimeout(() => void executeScroll(), 500);
    await utils.storyTeller.tokensUsed.invalidate();
  };

  const getInitialStoryData = async (): Promise<void> => {
    try {
      const story = await createNewStory.mutateAsync({
        heroName,
        villainName,
        scene,
      });
      setStory(story);

      await utils.storyTeller.tokensUsed.invalidate();
    } catch (err) {}
  };

  const getQuestionData = async (): Promise<void> => {
    try {
      const question = await nextQuestion.mutateAsync({
        language,
        difficulty,
      });
      setQuestion(question);
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    void getInitialStoryData();
    void getQuestionData(difficulty);
  }, []);

  const displayText = story
    .filter((m) => m.role === "assistant")
    .map((m) => m.content);

  const myRef = useRef(null);

  const executeScroll = () =>
    myRef.current.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="_flex m-5 items-center justify-center p-5">
      {/* <button onClick={executeScroll}> Click to scroll </button> */}
      <div className="align-center my-5 flex justify-center">
        <div>
          <Image src={heroImage} width={300} height={300} alt="avatar" />
        </div>
        <div>
          <Image src={"/images/VS.png"} width={300} height={300} alt="avatar" />
        </div>
        <div>
          <Image src={villainImage} width={300} height={300} alt="avatar" />
        </div>
      </div>
      <div style={{ maxHeight: "100px", overflow: "scroll" }}>
        <p>
          Electric Man had arrived in Egypt to stop Cool Story, Bro from
          stealing valuable artifacts from the ancient pyramids. As soon as Cool
          Story, Bro saw him, he scoffed and said, "What a joke. You think you
          can stop me, Electric Man? I've got powers you couldn't even imagine."
          Electric Man just cracked his knuckles and said, "I don't need to
          imagine, I've got plenty of power myself." And with that, the two
          began to battle fiercely in the desert sand.
        </p>
        <p>
          Electric Man had arrived in Egypt to stop Cool Story, Bro from
          stealing valuable artifacts from the ancient pyramids. As soon as Cool
          Story, Bro saw him, he scoffed and said, "What a joke. You think you
          can stop me, Electric Man? I've got powers you couldn't even imagine."
          Electric Man just cracked his knuckles and said, "I don't need to
          imagine, I've got plenty of power myself." And with that, the two
          began to battle fiercely in the desert sand.
        </p>
        <p>
          Electric Man had arrived in Egypt to stop Cool Story, Bro from
          stealing valuable artifacts from the ancient pyramids. As soon as Cool
          Story, Bro saw him, he scoffed and said, "What a joke. You think you
          can stop me, Electric Man? I've got powers you couldn't even imagine."
          Electric Man just cracked his knuckles and said, "I don't need to
          imagine, I've got plenty of power myself." And with that, the two
          began to battle fiercely in the desert sand.
        </p>
        <p>
          Electric Man had arrived in Egypt to stop Cool Story, Bro from
          stealing valuable artifacts from the ancient pyramids. As soon as Cool
          Story, Bro saw him, he scoffed and said, "What a joke. You think you
          can stop me, Electric Man? I've got powers you couldn't even imagine."
          Electric Man just cracked his knuckles and said, "I don't need to
          imagine, I've got plenty of power myself." And with that, the two
          began to battle fiercely in the desert sand.
        </p>
        {/* <div>{allAnswers.length}</div> */}
        {/* <ul>
          {displayText.map((text, i) => (
            <li key={i} className="mb-5">
              {text}
            </li>
          ))}
        </ul> */}
        <div style={{ float: "left", clear: "both" }} ref={myRef}></div>
      </div>
      <div>
        <div className="my-3 text-xl font-bold">{question?.question}</div>
        <ul>
          {question?.options?.map((option, i) => (
            <li key={i} className="mb-5">
              <pre>{option}</pre>
            </li>
          ))}
        </ul>
        <div>{question?.answer}</div>
        <button
          className="btn-primary btn"
          onClick={() =>
            void handleNext(
              getStoryOutcome(question?.answer === question?.answer)
            )
          }
        >
          Correct Answer
        </button>
        <button
          className="btn-primary btn"
          onClick={() =>
            void handleNext(
              getStoryOutcome(question?.answer !== question?.answer)
            )
          }
        >
          Incorrect Answer
        </button>
        <Link className="btn-primary btn" type="button" href="/create-story">
          Play again?
        </Link>
      </div>
    </div>
  );
};

export async function getServerSideProps({ req }) {
  const promptData: storyPromptData = {
    heroName: "Iron Man",
    villainName: "Thanos",
    scene: "Desert",
    heroImage: "/images/avatars/MODOK/img-J7lP2m93lbDITd1fiqKcJAgW.png",
    villainImage:
      "/images/avatars/Green Thumb/img-K1HK0jB5CDU95SeI8tCxOx1m.png",
    language: "TypeScript",
  };
  if (req.method == "POST") {
    const body = await getRawBody(req);
    const params = new URLSearchParams(body.toString("utf-8"));
    // Iterate over the key-value pairs and add them to the object
    for (const pair of params.entries()) {
      promptData[pair[0]] = decodeURIComponent(pair[1]).replace(/\+/g, " ");
    }
  }

  return {
    props: {
      promptData: promptData || {},
    }, // will be passed to the page component as props
  };
}

export default Questions;
