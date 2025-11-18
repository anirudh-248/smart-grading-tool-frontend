"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ErrorModal from "@/app/components/ErrorModal";
import SuccessModal from "@/app/components/SuccessModal";

type BreakdownItem = {
  title: string;
  score: number;
  max?: number;
  notes?: string;
};

// ------------------------
// Auth Context (reads token/user once and exposes isReady)
// ------------------------

type User = { name: string; email?: string } | null;

const AuthContext = createContext<{
  user: User;
  isReady: boolean;
  login: (u: User, token?: string) => void;
  logout: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("sg_token");
      const rawUser = localStorage.getItem("sg_user");

      if (rawUser) {
        try {
          setUser(JSON.parse(rawUser));
        } catch {
          setUser(null);
        }
      } else if (token) {
        setUser({ name: "User" });
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    try {
      if (user) localStorage.setItem("sg_user", JSON.stringify(user));
      else localStorage.removeItem("sg_user");
    } catch {
      // ignore
    }
  }, [user, isReady]);

  function login(u: User, token?: string) {
    try {
      if (token) localStorage.setItem("token", token);
    } catch {}
    setUser(u);
  }

  function logout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("sg_token");
      localStorage.removeItem("sg_user");
    } catch {}
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, isReady, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// ------------------------
// Header
// ------------------------

function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-lg font-semibold">SmartGrader</span>
        </Link>

        <nav className="hidden md:flex items-center gap-3 ml-4">
          <Link href="/" className="text-sm font-medium hover:underline">
            Home
          </Link>
          <Link href="/evaluate" className="text-sm font-medium hover:underline">
            Evaluate
          </Link>
        </nav>
      </div>

      <nav className="flex items-center gap-3">
        {!user ? (
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center rounded-full border border-solid border-black/8 px-4 py-2 text-sm font-medium transition hover:bg-black/4"
          >
            Login
          </Link>
        ) : (
          // When logged in show only a logout button (no user dropdown)
          <button
            onClick={() => {
              logout();
              router.replace("/"); // navigate to home after logout
            }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
          >
            <FaSignOutAlt className="w-4 h-4" />
            <span className="hidden sm:inline-block text-sm">Logout</span>
          </button>
        )}
      </nav>
    </header>
  );
}

// ------------------------
// Footer
// ------------------------

function Footer() {
  return (
    <footer className="w-full border-t border-zinc-100 dark:border-zinc-800 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-semibold">SmartGrader</div>
            <div className="text-sm text-zinc-500">Fair, fast, and insightful grading</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-sm hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm hover:underline">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ------------------------
// Protected Evaluate UI (hooks declared unconditionally at top)
// ------------------------

function ProtectedEvaluate() {
  const router = useRouter();
  const { user, isReady } = useAuth();

  // All hooks MUST be declared at the top (including useMemo)
  const [schemaFile, setSchemaFile] = useState<File | null>(null);
  const [answerFile, setAnswerFile] = useState<File | null>(null);

  const [similarityWeight, setSimilarityWeight] = useState<number | "">(0.6);
  const [qualityWeight, setQualityWeight] = useState<number | "">(0.3);
  const [rubricWeight, setRubricWeight] = useState<number | "">(0.1);
  const [maxMarks, setMaxMarks] = useState<string>("5");

  const [pending, setPending] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [responseData, setResponseData] = useState<any>(null);

  const schemaInputRef = useRef<HTMLInputElement | null>(null);
  const answerInputRef = useRef<HTMLInputElement | null>(null);

  // useMemo must live with other hooks — moved here
  const parsedResult = useMemo(() => parseResponseData(responseData), [responseData]);

  // Effects that depend on auth readiness/user
  useEffect(() => {
    if (isReady && !user) {
      router.replace("/login");
    }
  }, [isReady, user, router]);

  // While auth check is running, render a small loader
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg font-medium">Checking authentication…</div>
        </div>
      </div>
    );
  }

  // If ready and user missing, we've triggered redirect; avoid rendering UI here
  if (!user) return null;

  // --- helper functions ---
  const resetForm = () => {
    setSchemaFile(null);
    setAnswerFile(null);
    setSimilarityWeight(0.6);
    setQualityWeight(0.3);
    setRubricWeight(0.1);
    setMaxMarks("5");
    setResponseData(null);
  };

  const handleFileSelection = async (file: File | null, setter: (f: File | null) => void, label: string) => {
    if (!file) {
      setter(null);
      return;
    }

    console.log(`[file] selected for ${label}:`, { name: file.name, size: file.size, type: file.type });

    if (file.type !== "application/pdf") {
      setErrorMessage(`Selected file for ${label} is not a PDF: ${file.type}`);
      setShowErrorModal(true);
      return;
    }

    const maxAcceptBytes = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxAcceptBytes) {
      const proceed = confirm(`${label} is ${(file.size / (1024 * 1024)).toFixed(1)} MB — upload may be slow. Proceed?`);
      if (!proceed) return;
    }

    setter(file);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schemaFile || !answerFile) {
      setErrorMessage("Please provide both schema PDF and answer sheet PDF.");
      setShowErrorModal(true);
      return;
    }

    setPending(true);
    try {
      const form = new FormData();
      form.append("schema_pdf", schemaFile);
      form.append("answer_sheet_pdf", answerFile);
      if (similarityWeight !== "") form.append("similarity_weight", String(similarityWeight));
      if (qualityWeight !== "") form.append("quality_weight", String(qualityWeight));
      if (rubricWeight !== "") form.append("rubric_weight", String(rubricWeight));
      if (maxMarks !== "") form.append("max_marks", maxMarks);

      const base = (process.env.NEXT_PUBLIC_API_BASE_URL1 || "").replace(/\/$/, "");
      if (!base) {
        setErrorMessage("Server URL not configured. Please set NEXT_PUBLIC_API_BASE_URL.");
        setShowErrorModal(true);
        setPending(false);
        return;
      }
      const url = `${base}/api/v1/evaluate`;
      console.log("[submit] POST ->", url, { schema: schemaFile.name, answer: answerFile.name });

      const res = await fetch(url, { method: "POST", body: form });
      const contentType = res.headers.get("content-type") || "";

      if (res.status === 204) {
        setResponseData({});
        setSuccessMessage("Evaluation completed (no content returned).");
        setShowSuccessModal(true);
        return;
      }

      if (!res.ok) {
        const errText = await (async () => {
          try {
            const j = await res.json().catch(() => null);
            return j ? JSON.stringify(j) : await res.text().catch(() => "");
          } catch {
            return `Status ${res.status}`;
          }
        })();
        setErrorMessage(`Evaluation failed (${res.status}). ${errText}`);
        setShowErrorModal(true);
        return;
      }

      if (contentType.includes("application/json")) {
        const data = await res.json().catch(() => ({}));
        setResponseData(data ?? {});
        setSuccessMessage("Evaluation completed successfully.");
        setShowSuccessModal(true);
        return;
      }

      if (contentType.includes("application/pdf")) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
        setResponseData({ file: { url: blobUrl, contentType } });
        setSuccessMessage("Evaluation completed — PDF opened in new tab.");
        setShowSuccessModal(true);
        return;
      }

      const text = await res.text().catch(() => "");
      try {
        const maybeJson = JSON.parse(text);
        setResponseData(maybeJson);
        setSuccessMessage("Evaluation returned JSON text.");
        setShowSuccessModal(true);
      } catch {
        setResponseData({ text });
        setSuccessMessage("Evaluation returned text response.");
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error("[submit] network error:", err);
      setErrorMessage("Network error. Check backend URL and CORS. See console/network tab for details.");
      setShowErrorModal(true);
    } finally {
      setPending(false);
    }
  };

  // --- RENDER (Header + Main Evaluate UI + Footer) ---
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 flex flex-col">
      <Header />

      <main className="mx-auto w-full max-w-4xl px-6 pb-24 flex-1">
        <div className="min-h-screen bg-black flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div
            className="w-full max-w-4xl rounded-2xl p-8 shadow-2xl"
            style={{ background: "linear-gradient(to bottom right, #3d7eaa, #ffe47a)" }}
          >
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <h2 className="mt-2 text-center text-2xl/9 font-bold tracking-tight text-white">Evaluate Answer Sheet</h2>
              <p className="mt-2 text-center text-sm text-blue-50">Upload the schema PDF and the answer sheet PDF to begin evaluation.</p>
            </div>

            <form className="mt-6 space-y-6" onSubmit={submitForm}>
              <div className="grid grid-cols-1 gap-4">
                {/* Hidden schema input + visible label/button */}
                <div>
                  <span className="text-sm font-medium text-white block mb-1">Schema PDF (schema.pdf) *</span>
                  <input
                    ref={schemaInputRef}
                    id="schema_input"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileSelection(e.target.files?.[0] ?? null, setSchemaFile, "Schema PDF")}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="schema_input"
                      className="inline-flex items-center px-4 py-2 rounded-md border border-gray-400 bg-white text-sm cursor-pointer hover:bg-gray-100 text-gray-900 font-medium"
                    >
                      {schemaFile ? "Change Schema PDF" : "Upload Schema PDF"}
                    </label>
                    <div className="text-xs text-blue-50">{schemaFile ? schemaFile.name : "No file selected"}</div>
                  </div>
                </div>

                {/* Hidden answer input + visible label/button */}
                <div>
                  <span className="text-sm font-medium text-white block mb-1">Answer Sheet PDF (answer_sheet_pdf) *</span>
                  <input
                    ref={answerInputRef}
                    id="answer_input"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileSelection(e.target.files?.[0] ?? null, setAnswerFile, "Answer Sheet PDF")}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="answer_input"
                      className="inline-flex items-center px-4 py-2 rounded-md border border-gray-400 bg-white text-sm cursor-pointer hover:bg-gray-100 text-gray-900 font-medium"
                    >
                      {answerFile ? "Change Answer Sheet PDF" : "Upload Answer Sheet PDF"}
                    </label>
                    <div className="text-xs text-blue-50">{answerFile ? answerFile.name : "No file selected"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Similarity Weight */}
                  <label className="block">
                    <span className="text-sm font-medium text-white">Similarity Weight</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={similarityWeight as any}
                      onChange={(e) => setSimilarityWeight(e.target.value === "" ? "" : Number(e.target.value))}
                      className="mt-1 block w-full rounded-md px-3 py-1.5 text-base text-white placeholder-white outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 bg-transparent"
                    />
                  </label>

                  {/* Quality Weight */}
                  <label className="block">
                    <span className="text-sm font-medium text-white">Quality Weight</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={qualityWeight as any}
                      onChange={(e) => setQualityWeight(e.target.value === "" ? "" : Number(e.target.value))}
                      className="mt-1 block w-full rounded-md px-3 py-1.5 text-base text-white placeholder-white outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 bg-transparent"
                    />
                  </label>

                  {/* Rubric Weight */}
                  <label className="block">
                    <span className="text-sm font-medium text-white">Rubric Weight</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={rubricWeight as any}
                      onChange={(e) => setRubricWeight(e.target.value === "" ? "" : Number(e.target.value))}
                      className="mt-1 block w-full rounded-md px-3 py-1.5 text-base text-white placeholder-white outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 bg-transparent"
                    />
                  </label>
                </div>

                {/* Max Marks */}
                <label className="block">
                  <span className="text-sm font-medium text-white">Max Marks</span>
                  <input
                    type="text"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    className="mt-1 block w-full rounded-md px-3 py-1.5 text-base text-white placeholder-white outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 bg-transparent"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex justify-center rounded-md border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex justify-center rounded-md border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {pending ? "Evaluating..." : "Evaluate"}
                </button>
              </div>
            </form>

            {responseData && (
              <div className="mt-8 grid grid-cols-1 gap-6">
                <div className="bg-white rounded-lg p-6 border shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Evaluation Result (PDF-like)</h3>
                      <p className="text-sm text-gray-500 mt-1">Formatted result ready to print / save as PDF.</p>
                    </div>
                    <div className="text-sm text-gray-500">Evaluated: {new Date().toLocaleString()}</div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-md bg-gray-50">
                      <div className="text-xs text-gray-600">Score</div>
                      <div className="mt-2 text-3xl font-bold text-gray-900">{parsedResult.total_score}</div>
                      <div className="text-xs mt-1 text-gray-500">(Out of {parsedResult.total_max_marks})</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Breakdown</h4>
                    <div className="mt-3 space-y-2">
                      {parsedResult.breakdown.length > 0 ? (
                        parsedResult.breakdown.map((b: BreakdownItem, idx: number) => (
                          <div key={idx} className="flex items:center justify-between p-3 border rounded-md bg-white">
                            <div>
                              <div className="text-sm font-medium text-gray-800">{b.title}</div>
                              {b.notes && <div className="text-xs text-gray-500 mt-1">{b.notes}</div>}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">
                                {b.score}
                                {b.max ? ` / ${b.max}` : ""}
                              </div>
                              {b.max && <div className="text-xs text-gray-500 mt-1">{Math.round(((b.score ?? 0) / b.max) * 100)}%</div>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No breakdown available in response.</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700">Evaluation method</h4>
                    <p className="mt-2 text-sm text-gray-600">The final score is computed using the weights supplied in the form:</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="p-3 border rounded-md bg-gray-50 text-center">
                        <div className="text-xs text-gray-500">Similarity</div>
                        <div className="font-semibold text-gray-900">{Number(similarityWeight) ?? 0}</div>
                      </div>
                      <div className="p-3 border rounded-md bg-gray-50 text-center">
                        <div className="text-xs text-gray-500">Quality</div>
                        <div className="font-semibold text-gray-900">{Number(qualityWeight) ?? 0}</div>
                      </div>
                      <div className="p-3 border rounded-md bg-gray-50 text-center">
                        <div className="text-xs text-gray-500">Rubric</div>
                        <div className="font-semibold text-gray-900">{Number(rubricWeight) ?? 0}</div>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">(Final score = similarity*W1 + quality*W2 + rubric*W3 — as applied by the evaluator.)</p>
                  </div>
                </div>
              </div>
            )}

            <ErrorModal show={showErrorModal} onClose={() => setShowErrorModal(false)} message={errorMessage} />
            <SuccessModal
              show={showSuccessModal}
              onClose={() => {
                setShowSuccessModal(false);
              }}
              message={successMessage}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ------------------------
// Page export wraps ProtectedEvaluate with AuthProvider
// ------------------------

export default function EvaluatePage() {
  return (
    <AuthProvider>
      <ProtectedEvaluate />
    </AuthProvider>
  );
}

/* ------------------ Helper Functions ------------------ */

function parseResponseData(res: any) {
  if (!res) return { total_score: 0, total_max_marks: 0, breakdown: [] as BreakdownItem[] };

  const questions =
    res?.raw?.result?.questions ?? res?.result?.questions ?? res?.data?.questions ?? res?.questions ?? [];

  let total_score = 0;
  let total_max_marks = 0;
  const breakdown: BreakdownItem[] = [];

  if (Array.isArray(questions) && questions.length > 0) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const obtained = Number(q.final_marks ?? q.final_mark ?? q.score ?? q.marks ?? q.obtained ?? 0) || 0;
      const max = Number(q.max_marks ?? q.maxMarks ?? q.max ?? q.marks_total ?? 0) || 0;

      total_score += obtained;
      total_max_marks += max;

      breakdown.push({
        title: q.question_id ? `Q${q.question_id}` : q.title ?? q.question ?? `Question ${i + 1}`,
        score: obtained,
        max: max || undefined,
        notes: q.feedback ?? q.note ?? q.comment ?? undefined,
      });
    }
  } else {
    const fallbackTotal = Number(res?.raw?.result?.total_score ?? res?.total_score ?? res?.score ?? 0) || 0;
    const fallbackMax = Number(res?.raw?.result?.max_marks ?? res?.max_marks ?? res?.maxMarks ?? res?.max ?? 0) || 0;
    total_score = fallbackTotal;
    total_max_marks = fallbackMax;
  }

  return { total_score, total_max_marks, breakdown };
}
