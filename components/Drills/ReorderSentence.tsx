import React, { useState, useEffect } from "react";

export const ReorderSentence: React.FC<{
  question: string;
  items: string[];
  onAnswer: (value: string[]) => void;
}> = ({ question, items, onAnswer }) => {
  
  const [order, setOrder] = useState<string[]>([]);

  // Initialize order when items change
  useEffect(() => {
    setOrder(items);
    onAnswer(items); // Set initial state
  }, [items]); // Removed onAnswer from deps to avoid loop

  const move = (idx: number, direction: "left" | "right") => {
    const newOrder = [...order];
    const targetIdx = direction === "left" ? idx - 1 : idx + 1;

    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    [newOrder[idx], newOrder[targetIdx]] = [
      newOrder[targetIdx],
      newOrder[idx],
    ];

    setOrder(newOrder);
    onAnswer(newOrder);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="text-xl font-bold text-slate-800">{question}</div>

      <div className="flex flex-wrap justify-center gap-3 py-4">
        {order.map((word, idx) => (
          <div key={`${word}-${idx}`} className="flex flex-col items-center group">
            <div className="px-5 py-3 bg-white border-2 border-slate-200 rounded-xl text-lg font-bold text-slate-700 shadow-sm transition-all group-hover:border-blue-400 group-hover:shadow-md">
              {word}
            </div>
            <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-blue-100 rounded-full text-slate-600"
                onClick={() => move(idx, "left")}
                disabled={idx === 0}
              >
                ←
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-blue-100 rounded-full text-slate-600"
                onClick={() => move(idx, "right")}
                disabled={idx === order.length - 1}
              >
                →
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">Use arrows to reorder</p>
    </div>
  );
};
