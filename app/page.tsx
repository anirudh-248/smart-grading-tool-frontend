"use client";

import React from "react";
import Link from "next/link";
import {
  FaGraduationCap,
  FaLightbulb,
  FaBrain,
  FaChartLine,
  FaCogs,
  FaRocket,
  FaEye,
  FaComments,
  FaHandPaper,
} from "react-icons/fa";
import { AuthProvider } from "@/app/context/AuthContext";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const processSteps = [
  {
    icon: <FaHandPaper className="w-6 h-6" />,
    title: "Handwritten Input",
    description:
      "Students submit their handwritten answer sheets through our secure upload system. Our platform accepts various image formats and ensures high-quality processing.",
  },
  {
    icon: <FaEye className="w-6 h-6" />,
    title: "OCR Conversion",
    description:
      "Advanced Optical Character Recognition technology converts handwritten text to digital format with high accuracy, preserving meaning and context.",
  },
  {
    icon: <FaCogs className="w-6 h-6" />,
    title: "Answer Processing",
    description:
      "Our intelligent system analyzes the converted text, identifies key concepts, and structures the answers for comprehensive evaluation.",
  },
  {
    icon: <FaBrain className="w-6 h-6" />,
    title: "ML Model Grading",
    description:
      "State-of-the-art machine learning algorithms evaluate answers based on accuracy, completeness, and relevance to provide fair and consistent grading.",
  },
  {
    icon: <FaChartLine className="w-6 h-6" />,
    title: "Evaluation & Analysis",
    description:
      "Comprehensive performance analysis identifies strengths and areas for improvement, delivering detailed insights into student understanding.",
  },
  {
    icon: <FaComments className="w-6 h-6" />,
    title: "Feedback & Results",
    description:
      "Personalized feedback and clear results help students understand their performance and guide their learning journey effectively.",
  },
];

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 flex flex-col">
        <Header />

        <main className="mx-auto w-full max-w-4xl px-6 pb-24 flex-1">
          <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 via-rose-600 to-amber-700 text-white p-10 shadow-lg mt-6">
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="sm:max-w-xl">
                <div className="inline-flex items-center justify-center mb-4 w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 shadow-lg">
                  <FaGraduationCap className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                  Smart Grading System
                </h1>
                <p className="mt-3 text-lg font-medium opacity-90">
                  Revolutionizing education through AI-powered assessment
                  transform handwritten assessments into intelligent, fair, and
                  comprehensive evaluations.
                </p>
              </div>

              <div className="mt-6 sm:mt-8 sm:self-end flex flex-col items-center gap-3">
                <Link
                  href="/evaluate"
                  className="rounded-full bg-white/90 text-indigo-700 px-4 py-2 font-semibold shadow-sm hover:opacity-95 transition"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="sm:col-span-2">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FaLightbulb className="w-6 h-6 text-indigo-600" />
                Our Mission
              </h2>
              <p className="mt-3 text-base text-zinc-700 dark:text-zinc-300">
                We believe every student deserves fair, consistent, and
                constructive feedback. Our mission is to eliminate bias in
                grading while providing educators with powerful tools to
                understand and support their students learning journey.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="relative w-40 h-40 rounded-lg bg-white dark:bg-zinc-900/70 border border-black/5 dark:border-white/10 flex items-center justify-center shadow-md">
                <div className="absolute inset-0 rounded-lg bg-linear-to-br from-indigo-50 to-indigo-100 opacity-60" />
                <div className="relative z-10 grid grid-cols-2 gap-3 p-3">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FaBrain className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FaGraduationCap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FaChartLine className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FaRocket className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h3 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-50">
              How Our System Works
            </h3>
            <p className="mt-3 text-center text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
              From upload to feedback our pipeline converts handwritten
              responses into rich analytics and actionable feedback.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {processSteps.map((step, idx) => (
                <article
                  key={idx}
                  className="group relative rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {step.title}
                      </h4>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 text-xs text-zinc-400 group-hover:text-indigo-500">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-xl p-6 bg-linear-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/80 border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <FaCogs className="w-6 h-6 text-indigo-600" />
              What Makes Us Unique
            </h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div>
                <h4 className="font-semibold">AI-Powered Accuracy</h4>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Advanced ML ensures consistent and fair grading.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Detailed Analytics</h4>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Comprehensive insights into student performance and learning
                  patterns.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Educator-Friendly</h4>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Designed by educators, for educators, with intuitive
                  interfaces.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 mb-6 rounded-xl p-6 bg-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xl font-bold">
                Ready to make grading easier?
              </h4>
              <p className="text-sm/6 mt-1 opacity-90">
                Sign in and bring fairness, speed and insight into your
                classroom.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/evaluate"
                className="rounded-full border border-white/30 px-4 py-2 hover:bg-white/10 transition"
              >
                Get Started
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}
