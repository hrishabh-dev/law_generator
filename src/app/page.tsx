"use client";

import { useState } from "react";
import { generateAnswer } from "@/ai/flows/generate-answer";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [yesNo, setYesNo] = useState<string | null>(null);

  const handleQuestionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setQuestion(event.target.value);
  };

  const handleContextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContext(event.target.value);
  };

  const handleAnswer = async () => {
    if (!question) {
      toast({
        title: "Error",
        description: "Please enter a question.",
      });
      return;
    }

    setLoading(true); // Set loading state to true
    setAnswer(null); // Clear previous answer

    try {
      const result = await generateAnswer({ question: question, context: context });

      if (result && result.answer) {
        let rawAnswer = result.answer;

        // Extract "Yes" or "No" from the beginning of the answer, if present
        const yesNoMatch = rawAnswer.match(/^(Yes|No),?/i);
        if (yesNoMatch) {
          setYesNo(yesNoMatch[1]);
          // Remove "Yes" or "No" (and any following comma) from the raw answer
          rawAnswer = rawAnswer.substring(yesNoMatch[0].length).trim();
        } else {
          setYesNo(null);
        }

        setAnswer(rawAnswer);

        toast({
          title: "Success",
          description: "Answer generated successfully.",
        });
      } else {
        setAnswer("No answer available.");
        setYesNo(null);
        toast({
          title: "Information",
          description: "No answer was generated.",
        });
      }
    } catch (error: any) {
      console.error("Error generating answer:", error);
      setAnswer("Error generating answer. Please try again.");
      setYesNo(null);
      toast({
        title: "Error",
        description:
          error?.message || "Failed to generate answer. Please try again.",
      });
    } finally {
      setLoading(false); // Set loading state to false after operation completes
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster />
      <h1 className="text-4xl font-bold mb-4 text-primary">Law Ace AI</h1>
      <p className="text-muted-foreground mb-8">
        Your AI-powered assistant for CA Inter Law questions.
      </p>

      <div className="w-full max-w-2xl flex flex-col gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Question</h2>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your CA Inter Law question here..."
              className="w-full mb-4"
              value={question}
              onChange={handleQuestionChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Context (Optional)</h2>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Add any relevant context or legal documents..."
              className="w-full mb-4"
              value={context}
              onChange={handleContextChange}
            />
          </CardContent>
        </Card>

        <Button
          className="w-full bg-primary text-primary-foreground"
          onClick={handleAnswer}
          disabled={loading}
        >
          {loading ? "Generating Answer..." : "Get Answer"}
        </Button>

        {answer && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Answer</h2>
            </CardHeader>
            <CardContent>
              {yesNo && <p className="mb-4 font-bold">{yesNo}</p>}
              {answer.split('\n\n').map((paragraph, index) => (
                <div key={index} className="mb-4">
                  {paragraph.split('\n').map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {lineIndex === 0 && <span className="font-semibold">{line.match(/^\d+\.\s*(.*)/)?.[1] ? line.match(/^\d+\.\s*(.*)/)?.[0] : ''}</span>}
                      {lineIndex === 0 && <br />}
                      <span>{line.match(/^\d+\.\s*(.*)/)?.[1] ? line.replace(/^\d+\.\s*/, '') : line}</span>
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
      <p className="mt-8 text-muted-foreground">
        For any query contact me:{" "}
        <a href="mailto:hrishabh068@gmail.com">hrishabh068@gmail.com</a>
      </p>
    </div>
  );
}

