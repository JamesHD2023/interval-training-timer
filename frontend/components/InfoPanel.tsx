import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InfoPanelProps {
  title: string;
  description: string;
  howToPerform: string[];
  benefits: string[];
  frequency: string;
  tips?: string[];
}

export default function InfoPanel({ title, description, howToPerform, benefits, frequency, tips }: InfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <Button
        variant="ghost"
        className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-semibold text-foreground">{title}</span>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </Button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 text-sm">
          <p className="text-muted-foreground">{description}</p>

          <div>
            <h3 className="font-semibold mb-2 text-foreground">How to Perform:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {howToPerform.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {tips && tips.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Tips for Success:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {tips.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2 text-foreground">Benefits:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {benefits.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-foreground">Recommended Frequency:</h3>
            <p className="text-muted-foreground">{frequency}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
