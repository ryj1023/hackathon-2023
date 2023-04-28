import clsx from "clsx";
import { useState } from "react";
import QuestionDisplay from "~/components/QuestionDisplay";
import { type QuestionReturn } from "~/server/api/routers/questioner";
import { type Language } from "~/server/api/schemas";

import { api } from "~/utils/api";

const LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "C#",
  "Haskell",
] satisfies Language[];

const RogerStoryTestPage = () => {
  const [language, setLanguage] = useState<Language>("TypeScript");
  const [difficulty, setDifficulty] = useState<number>(1);
  const [question, setQuestion] = useState<QuestionReturn | undefined>();

  const nextQuestion = api.questioner.question.useMutation();

  const handleNextQuestion = async () => {
    const question = await nextQuestion.mutateAsync({
      language,
      difficulty,
     });

    setQuestion(question);
  };

  const handleCorrect = (correctAnswser: string) => {
    console.log('CORRECT!', correctAnswser)
  };
  const handleIncorrect = (correctAnswer: string) => {
    console.log('WRONG!', correctAnswer)
  };

  const handleFinshedAnimation = () => {
    console.log('FINISHED ANIMATION!')
  };

  return (
    <div className="m-5 flex flex-col">
      <h1 className="text-6xl">Questioner</h1>
      <div className="flex flex-col">
        <select
          className="select select-bordered"
          value={language}
          onChange={e => setLanguage(e.target.value as Language)}
        >
          {LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
        <select
          className="select select-bordered"
          value={difficulty}
          onChange={e => setDifficulty(parseInt(e.target.value))}
        >
          {Array(10).fill(0).map((_, i) => (i + 1)).map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>

        <button
          className={clsx('btn btn-primary', { loading: nextQuestion.isLoading })}
          onClick={() => void handleNextQuestion()}
          disabled={nextQuestion.isLoading}
        >
          Next Question
        </button>
      </div>
      {question && <QuestionDisplay
        question={question}
        onCorrect={handleCorrect}
        onIncorrect={handleIncorrect}
        onFinshedAnimation={handleFinshedAnimation}
      />}
    </div>
  )
}

export default RogerStoryTestPage