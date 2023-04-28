import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import myImage from "../../public/images/hero-background.png";
import getRawBody from "raw-body";
import { type OpenAIMessage, type StoryOutcome } from "~/server/api/schemas";
import Link from "next/link";

import { api } from "~/utils/api";

type Language = "TypeScript" | "JavaScript" | "Python" | "C#" | "Haskell";

console.log("myImage", myImage.src);

type storyPromptData = {
  heroName: string;
  villainName: string;
  scene: string;
  heroImage: string;
  villainImage: string;
  sceneryImage: string;
  language: Language;
};

const OUTCOMES: [StoryOutcome, string][] = [
  ["success", "Success"],
  ["failure", "Failure"],
  ["complete", "Complete"],
  ["defeat", "Defeat"],
];

const answerMap = [
  { value: "A" },
  { value: "B" },
  { value: "C" },
  { value: "D" },
];

const Questions = ({ promptData }) => {
  const [allAnswers, setAllAnswers] = useState<boolean[]>([]);
  const [story, setStory] = useState<OpenAIMessage[]>([]);
  const [question, setQuestion] = useState<QuestionReturn | undefined>();
  const [answer, setAnswer] = useState<string>();

  const [difficulty, setDifficulty] = useState<number>(1);
  const {
    heroName,
    villainName,
    scene,
    language,
    heroImage,
    villainImage,
    sceneryImage,
  } = promptData;
  const utils = api.useContext();
  const tokens = api.storyTeller.tokensUsed.useQuery();
  const next = api.storyTeller.next.useMutation();
  const createNewStory = api.storyTeller.new.useMutation();
  const nextQuestion = api.questioner.question.useMutation();

  const newStoryLoading = createNewStory.isLoading;
  const nextStoryIsLoading = next.isLoading;
  const nextQuestionIsLoading = nextQuestion.isLoading;

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

  useEffect(() => {
    document.body.style.background = `url(${sceneryImage}) no-repeat`;
    document.body.style.height = "100vh";
    document.body.style.backgroundSize = "cover";
  }, [sceneryImage]);

  const displayText = story
    .filter((m) => m.role === "assistant")
    .map((m) => m.content);

  const myRef = useRef(null);

  const executeScroll = () =>
    myRef.current.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      <div className="_flex ml-5 mr-5 items-center justify-center p-5">
        <div className="align-center mb-2 flex justify-center">
          {/* <Image
            src="/images/hero-background.png"
            layout="fill"
            objectFit="cover"
            quality={100}
          /> */}
          <div>
            <h1 className="font-bold">{heroName}</h1>
            <Image src={heroImage} width={300} height={300} alt="avatar" />
          </div>
          <div>
            <Image
              src={"/images/VS.png"}
              width={300}
              height={300}
              alt="avatar"
            />
          </div>
          <div>
            <h1 className="font-bold">{villainName}</h1>
            <Image src={villainImage} width={300} height={300} alt="avatar" />
          </div>
        </div>
        <div>
          {newStoryLoading ? (
            <div className="flex justify-center">
              <div className="mt-1">
                <progress className="progress w-56 "></progress>
              </div>
            </div>
          ) : (
            <>
              <div
                className="p-2"
                style={{
                  height: "200px",
                  overflow: "scroll",
                  background: "black",
                  color: "white",
                  borderRadius: 8,
                }}
              >
                <div>{allAnswers.length}</div>
                <ul>
                  {displayText.map((text, i) => (
                    <li key={i} className="mb-5">
                      {text}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <progress className="progress progress-info flex w-56 justify-center"></progress>
                </div>
                <div style={{ float: "left", clear: "both" }} ref={myRef}></div>
              </div>
              <div className="w-50 bg-white">
                <div className="my-3 text-xl font-bold">
                  {question?.question}
                </div>
                <ul>
                  {question?.options?.map((option, i) => (
                    <li key={i} className="mb-5">
                      <label className="label cursor-pointer justify-start">
                        <input
                          type="radio"
                          name="radio-2"
                          className="radio-primary radio"
                          onClick={() => setAnswer(answerMap[i]?.value)}
                        />
                        <span className="label-text">{option}</span>
                      </label>
                    </li>
                  ))}
                </ul>

                <button
                  className="btn-primary btn"
                  onClick={() =>
                    void handleNext(
                      getStoryOutcome(answer === question?.answer)
                    )
                  }
                >
                  Submit
                </button>

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
                <Link className="btn-primary btn" type="button" href="/">
                  Play again?
                </Link>
              </div>
            </>
          )}{" "}
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps({ req }) {
  const promptData: storyPromptData = {
    heroName: "Iron Man",
    villainName: "Thanos",
    scene: "Desert",
    villainImage: "/images/avatars/MODOK/img-J7lP2m93lbDITd1fiqKcJAgW.png",
    heroImage: "/images/avatars/Green Thumb/img-K1HK0jB5CDU95SeI8tCxOx1m.png",
    sceneryImage: "/images/scenery/img-F0cofIBKZeu2yYbdAdzovnsA.png",
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
