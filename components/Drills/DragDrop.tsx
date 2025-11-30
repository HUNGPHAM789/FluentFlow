import React, { useState, useEffect } from "react";

export const DragDrop: React.FC<{
  question: string;
  pairs?: { left: string; right: string }[];
  sentence?: string;     
  choices?: string[];
  onAnswer: (value: string) => void;
  value?: string;
}> = ({ question, pairs, sentence, choices, onAnswer, value }) => {
  
  // Internal state to track selection if controlled value is not sufficient for UI logic
  // But here we can rely on 'value' prop for the 'sentence' mode
  
  if (pairs) {
    // MATCHING MODE (Display only for now based on requirements)
    return (
      <div className="space-y-4">
        <div className="text-lg font-semibold text-center text-slate-800">{question}</div>

        {pairs.map((p, idx) => (
          <div
            key={idx}
            className="flex justify-between p-4 border rounded-xl bg-white shadow-sm"
          >
            <div className="font-bold text-slate-700">{p.left}</div>
            <div className="text-slate-500">{p.right}</div>
          </div>
        ))}
      </div>
    );
  }

  if (sentence && choices) {
    // FILL SLOT MODE
    return (
      <div className="space-y-8 text-center">
        <div className="text-lg font-semibold text-slate-600">{question}</div>

        <div className="p-6 bg-slate-100 rounded-2xl text-2xl font-medium text-slate-800 leading-relaxed shadow-inner">
          {sentence.split("___").map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className={`inline-block min-w-[60px] border-b-4 mx-1 transition-colors px-2 ${value ? "text-blue-600 border-blue-600 bg-blue-50 rounded" : "border-slate-400 text-transparent"}`}>
                  {value || "____"}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {choices.map((c) => (
            <button
              key={c}
              onClick={() => onAnswer(c)}
              className={`px-6 py-3 border-2 rounded-xl text-lg font-medium transition-all transform active:scale-95
                ${value === c 
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105" 
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50"
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
