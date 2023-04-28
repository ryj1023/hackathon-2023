import clsx from "clsx";
import { useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import ReactMarkdown from "react-markdown";
import { type QuestionReturn } from "~/server/api/routers/questioner";

const optionRE = /^(.+)\)\s*(.*)$/;

const labelOption = (option: string) => {
  const [, label, prompt] = option.match(optionRE) ?? [];
  return { label, prompt };
};

interface QuestionDisplayProps {
  question: QuestionReturn;
  onCorrect: (correctAnswer: string) => void;
  onIncorrect: (correctAnswer: string) => void;
  onFinshedAnimation: () => void;
}

const QuestionDisplay = ({
  question,
  onCorrect,
  onIncorrect,
  onFinshedAnimation,
}: QuestionDisplayProps) => {
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [enterComplete, setEnterComplete] = useState<boolean>(false);
  const [wasCorrect, setWasCorrect] = useState<boolean>(false);

  useEffect(() => {
    setHasAnswered(false);
    setEnterComplete(false);
    setWasCorrect(false);
  }, [question]);

  const questionText = question.question;
  const { options, answer } = question;

  if (!questionText || !options || !answer) {
    return (
      <div className="alert alert-error my-auto shadow-lg">
        INVALID QUESTION DATA!!!
      </div>
    );
  }

  const answerWithoutAnswer = answer.replace(/answer(:|\w)*\s*/i, "");
  const [, correctLabel] = answerWithoutAnswer.match(optionRE) ?? [];

  const labeledOptions = options
    .map(labelOption)
    .map((option) => ({ ...option, isCorrect: option.label === correctLabel }));

  type LabeledWithCorrectOption = (typeof labeledOptions)[number];

  const handleOptionClick = (option: LabeledWithCorrectOption) => {
    if (option.isCorrect) {
      onCorrect(answerWithoutAnswer);
    } else {
      onIncorrect(answerWithoutAnswer);
    }
    setHasAnswered(true);
    setWasCorrect(option.isCorrect);
  };

  const optionButtons = labeledOptions.map((option, i) => (
    <li key={i} className="mb-5">
      <button
        className={clsx(
          "btn-primary btn-block btn justify-start normal-case transition",
          {
            "btn-success": hasAnswered && option.isCorrect,
            "btn-error": hasAnswered && !option.isCorrect,
          }
        )}
        onClick={() => handleOptionClick(option)}
      >
        <span className="transf mr-5">{option.label})</span>{" "}
        <pre>{option.prompt}</pre>
      </button>
    </li>
  ));

  const handleAfterEnter = () => {
    setTimeout(() => setEnterComplete(true), 1000);
  };

  const handleAfterLeave = () => {
    onFinshedAnimation();
  };

  return (
    <div className="relative">
      <div className="my-3 text-xl font-bold">
        <ReactMarkdown>{questionText}</ReactMarkdown>
      </div>
      <ul className="relative">
        {optionButtons}
        <Transition
          show={hasAnswered && !enterComplete}
          className={clsx(
            "absolute top-0 h-full w-full skew-x-[45deg] text-6xl shadow-2xl",
            {
              "bg-success": wasCorrect,
              "bg-error": !wasCorrect,
              "text-success-content": wasCorrect,
              "text-error-content": !wasCorrect,
            }
          )}
          enter="transition-transform transform duration-[2000ms]"
          enterFrom="-translate-x-[125%]"
          enterTo="translate-x-0"
          afterEnter={handleAfterEnter}
          leave="transition-transform transform duration-[1000ms]"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-[125%]"
          afterLeave={handleAfterLeave}
        >
          <div className="flex h-full w-full -skew-x-[45deg] items-center justify-center">
            {wasCorrect ? "CORRECT!" : "INCORRECT!"}
          </div>
        </Transition>
      </ul>
    </div>
  );
};

export default QuestionDisplay;
