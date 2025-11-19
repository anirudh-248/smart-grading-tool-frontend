"use client";

import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useRef,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

interface QuestionResult {
  question_id: number;
  student_answer: string;
  similarity_score: number;
  quality_score: number;
  rubric_score: number;
  final_marks: number;
  max_marks: number;
  feedback: string;
}

interface EvaluateResponse {
  status: string;
  weights: {
    similarity: number;
    quality: number;
    rubric: number;
  };
  result: {
    questions: QuestionResult[];
    total_score: number;
  };
}

export default function EvaluatePage() {
  const router = useRouter();

  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [schemaFile, setSchemaFile] = useState<File | null>(null);
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);

  const [similarityWeight, setSimilarityWeight] = useState<string>("0.6");
  const [qualityWeight, setQualityWeight] = useState<string>("0.3");
  const [rubricWeight, setRubricWeight] = useState<string>("0.1");
  const [maxMarks, setMaxMarks] = useState<string>("10");

  const [isLoading, setIsLoading] = useState(false);
  const [apiResult, setApiResult] = useState<EvaluateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const schemaInputRef = useRef<HTMLInputElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      setIsAuthChecking(false);
    }
  }, [router]);

  const handleFileChange =
    (setter: React.Dispatch<React.SetStateAction<File | null>>) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setter(e.target.files[0]);
      }
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setApiResult(null);

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!schemaFile || !answerSheetFile) {
      setError("Please upload both Schema and Answer Sheet PDF files.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("schema_pdf", schemaFile);
      formData.append("answer_sheet_pdf", answerSheetFile);
      formData.append("similarity_weight", similarityWeight);
      formData.append("quality_weight", qualityWeight);
      formData.append("rubric_weight", rubricWeight);
      formData.append("max_marks", maxMarks);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evaluate`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data: EvaluateResponse = await response.json();
      setApiResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSchemaFile(null);
    setAnswerSheetFile(null);
    setSimilarityWeight("0.6");
    setQualityWeight("0.3");
    setRubricWeight("0.1");
    setMaxMarks("10");
    setApiResult(null);
    setError(null);
    if (schemaInputRef.current) schemaInputRef.current.value = "";
    if (answerInputRef.current) answerInputRef.current.value = "";
  };

  if (isAuthChecking) {
    return null;
  }

  return (
    <div className="w-full bg-linear-to-br from-[#5D9CEC] via-[#A0EACD] to-[#F4D03F] rounded-3xl shadow-2xl overflow-hidden min-h-[600px] p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md mb-2">
            Evaluate Answer Sheet
          </h1>
          <p className="text-white/90 text-lg">
            Upload the schema PDF and the answer sheet PDF to begin evaluation.
          </p>
        </div>

        {!apiResult ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Schema PDF (schema.pdf) *
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    ref={schemaInputRef}
                    accept="application/pdf"
                    onChange={handleFileChange(setSchemaFile)}
                    className="hidden"
                    id="schema-upload"
                  />
                  <label
                    htmlFor="schema-upload"
                    className="bg-white text-gray-800 px-4 py-2 rounded-md font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Upload Schema PDF
                  </label>
                  <span className="text-white/80 text-sm">
                    {schemaFile ? schemaFile.name : "No file selected"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Answer Sheet PDF (answer_sheet_pdf) *
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    ref={answerInputRef}
                    accept="application/pdf"
                    onChange={handleFileChange(setAnswerSheetFile)}
                    className="hidden"
                    id="answer-upload"
                  />
                  <label
                    htmlFor="answer-upload"
                    className="bg-white text-gray-800 px-4 py-2 rounded-md font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Upload Answer Sheet PDF
                  </label>
                  <span className="text-white/80 text-sm">
                    {answerSheetFile
                      ? answerSheetFile.name
                      : "No file selected"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Similarity Weight
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={similarityWeight}
                  onChange={(e) => setSimilarityWeight(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-gray-800 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">
                  Quality Weight
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={qualityWeight}
                  onChange={(e) => setQualityWeight(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-gray-800 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">
                  Rubric Weight
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={rubricWeight}
                  onChange={(e) => setRubricWeight(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-gray-800 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Max Marks
              </label>
              <input
                type="text"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-gray-800 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {}}
                className="bg-white text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-white text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Evaluating..." : "Evaluate"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 md:p-8 shadow-lg animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Evaluation Result
              </h2>
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase font-semibold">
                  Total Score
                </p>
                <p className="text-3xl font-bold text-indigo-600">
                  {apiResult.result.total_score.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-xs font-bold text-gray-500 uppercase">
                  Similarity Weight
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {apiResult.weights.similarity}
                </p>
              </div>
              <div className="text-center border-l border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase">
                  Quality Weight
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {apiResult.weights.quality}
                </p>
              </div>
              <div className="text-center border-l border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase">
                  Rubric Weight
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {apiResult.weights.rubric}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {apiResult.result.questions.map((q) => (
                <div
                  key={q.question_id}
                  className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-800 text-lg">
                      Question {q.question_id}
                    </h3>
                    <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                      {q.final_marks.toFixed(2)} / {q.max_marks}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 font-semibold uppercase mb-1">
                      Answer
                    </p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm leading-relaxed border border-gray-100">
                      {q.student_answer}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-[10px] text-blue-600 font-bold uppercase">
                        Similarity
                      </div>
                      <div className="font-mono text-blue-800 font-bold">
                        {q.similarity_score.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <div className="text-[10px] text-purple-600 font-bold uppercase">
                        Quality
                      </div>
                      <div className="font-mono text-purple-800 font-bold">
                        {q.quality_score.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <div className="text-[10px] text-orange-600 font-bold uppercase">
                        Rubric
                      </div>
                      <div className="font-mono text-orange-800 font-bold">
                        {q.rubric_score.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-500 font-semibold uppercase mb-1">
                      Feedback
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      &quot;{q.feedback}&quot;
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-right">
              <button
                onClick={handleReset}
                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                Evaluate New Sheet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
