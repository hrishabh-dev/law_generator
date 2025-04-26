"use client";

import { useState } from "react";
import { generateAnswer } from "@/ai/flows/generate-answer";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const { toast } = useToast();

  const [introText, setIntroText] = useState<string | null>(null);

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

    try {
      const result = await generateAnswer({ question: question, context: context });
      const rawAnswer = result?.answer || "No answer available.";

      // Extract intro text (everything before the numbered points)
      const lines = rawAnswer.split('\n');
      let extractedIntroText = '';
      const answerPoints: string[] = [];

      for (const line of lines) {
        if (line.match(/^\d+\s*-\s*/)) { // Check if line starts with a number and a dash
          answerPoints.push(line);
        } else {
          extractedIntroText += line + '\n';
        }
      }

      setIntroText(extractedIntroText.trim());
      setAnswer(answerPoints.join('\n'));

      toast({
        title: "Success",
        description: "Answer generated successfully.",
      });
    } catch (error: any) {
      console.error("Error generating answer:", error);
      setAnswer("Error generating answer. Please try again.");
      toast({
        title: "Error",
        description:
          error?.message || "Failed to generate answer. Please try again.",
      });
    }
  };

  const answerPoints = answer ? answer.split('\n') : [];

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

        <Button className="w-full bg-primary text-primary-foreground" onClick={handleAnswer}>
          Get Answer
        </Button>

        {answer && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Answer</h2>
            </CardHeader>
            <CardContent>
              {introText && <p className="mb-4">{introText}</p>}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Point</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {answerPoints.map((point, index) => {
                    const parts = point.split(/(\d+\s*-\s*)/).filter(Boolean);
                    const pointNumber = parts[1] ? parts[1].trim() : '';
                    const description = parts[2] ? parts[2].trim() : '';

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{pointNumber}</TableCell>
                        <TableCell>{description}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      <p className="mt-8 text-muted-foreground">
        For any query contact me: <a href="mailto:hrishabh068@gmail.com">hrishabh068@gmail.com</a>
      </p>
    </div>
  );
}
