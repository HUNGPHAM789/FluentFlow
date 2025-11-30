import React from "react";

export const FillBlank: React.FC<{
  question: string;
  onAnswer: (value: string) => void;
  value?: string;
}> = ({ question, onAnswer, value }) => {
  return (
    <div className="space-y-6 text-center">
      <div className="text-xl font-bold text-slate-800">{question}</div>

      <div className="max-w-xs mx-auto">
        <input
            value={value || ""}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="w-full p-4 text-center text-lg border-2 rounded-2xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
        />
      </div>
    </div>
  );
};
