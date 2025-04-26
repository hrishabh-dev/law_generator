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
  const [answerPoints, setAnswerPoints] = useState<
    { point: string; description: string }[]
  >([]);

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

      try {
        // Attempt to parse the raw answer as JSON
        let parsedAnswer;
        try {
          parsedAnswer = JSON.parse(rawAnswer);
        } catch (parseError) {
          // If it's not a JSON, consider the entire rawAnswer as a single description.
          console.log("Raw answer:", rawAnswer);
          parsedAnswer = {
            introText: null,
            points: [],
            descriptions: [rawAnswer], // Wrap rawAnswer in an array
          };
        }

        setIntroText(parsedAnswer.introText || '');
  
        // Ensure points and descriptions are arrays before mapping
        const points = Array.isArray(parsedAnswer.points) ? parsedAnswer.points : [];
        const descriptions = Array.isArray(parsedAnswer.descriptions) ? parsedAnswer.descriptions : [];
  
        // Combine points and descriptions into answerPoints array
        const combinedAnswerPoints = points.map((_, index) => ({
          point: String(index + 1),
          description: descriptions[index] || 'No description available.',
        }));
  
        setAnswerPoints(combinedAnswerPoints);
        setAnswer(rawAnswer); // Keep raw answer for debugging/future use
      } catch (parseError) {
        console.error("Error parsing JSON answer:", parseError);
        setIntroText("Error parsing answer.");
        setAnswerPoints([]);
        setAnswer("Error parsing JSON answer.");
      }

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
                  {answerPoints.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.point}</TableCell>
                      <TableCell>{item.description}</TableCell>
                    </TableRow>
                  ))}
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
