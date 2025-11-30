import React from "react";
import { MultipleChoice } from "./MultipleChoice";
import { FillBlank } from "./FillBlank";
import { DragDrop } from "./DragDrop";
import { ReorderSentence } from "./ReorderSentence";
import { GrammarDrillItem } from "../../types";

export const DrillRenderer: React.FC<{
  drill: GrammarDrillItem;
  onAnswer: (val: any) => void;
  value?: any;
}> = ({ drill, onAnswer, value }) => {

  // Default to multiple_choice if type is missing (backward compatibility)
  const type = drill.type || "multiple_choice";

  switch (type) {
    case "multiple_choice":
      return (
        <MultipleChoice 
          question={drill.question} 
          options={drill.options || []} 
          onAnswer={onAnswer} 
          selected={value} 
        />
      );

    case "fill_blank":
      return (
        <FillBlank 
          question={drill.question} 
          onAnswer={onAnswer} 
          value={value} 
        />
      );

    case "drag_drop":
      return (
        <DragDrop 
          question={drill.question} 
          pairs={drill.pairs} 
          sentence={drill.sentence} 
          choices={drill.choices} 
          onAnswer={onAnswer}
          value={value}
        />
      );

    case "reorder":
      return (
        <ReorderSentence 
          question={drill.question} 
          items={drill.items || []} 
          onAnswer={onAnswer} 
        />
      );

    default:
      return <div className="p-4 bg-red-50 text-red-500 rounded">Unsupported drill type: {type}</div>;
  }
};
