import React from "react";

export const MultipleChoice: React.FC<{
  question: string;
  options: string[];
  onAnswer: (value: string) => void;
  selected?: string;
}> = ({ question, options, onAnswer, selected }) => {
  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold text-center text-slate-800">{question}</div>

      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt}
            className={`
              w-full p-4 rounded-xl border-2 text-left transition-all duration-200
              ${
                selected === opt
                  ? "bg-blue-600 text-white border-blue-700 shadow-md transform scale-[1.01]"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300"
              }
            `}
            onClick={() => onAnswer(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
