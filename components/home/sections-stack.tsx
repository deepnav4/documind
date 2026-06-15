"use client";

import CanvasDemo from "../ai/canvas";
import { FlashCardsCarousel } from "../individual-project/flash_cards-tab/flash_cards_carousel";
import { QuizCarousel } from "../individual-project/quiz-tab/quiz-carousel";
import ScrollableCardStack from "../smoothui/scrollable-card-stack";
import React from "react";
import Headings from "./headings";
import ChatDemo from "./chatdemo";

export type TCardDataProps = {
    id: number; 
    content: React.ReactNode;
    caption?: string;
}
const MOCK_LLM_QUIZZES = [
  {
    question: "What is the capital city of Japan?",
    options: [
      { optionIndex: 1, option: "Seoul" },
      { optionIndex: 2, option: "Tokyo" },
      { optionIndex: 3, option: "Beijing" },
      { optionIndex: 4, option: "Bangkok" },
    ],
    explanation: "Tokyo became Japan's capital in 1868, replacing Kyoto.",
    correctOption: 2,
  },
  {
    question: 'Which planet is known as the "Red Planet"?',
    options: [
      { optionIndex: 1, option: "Venus" },
      { optionIndex: 2, option: "Jupiter" },
      { optionIndex: 3, option: "Mars" },
      { optionIndex: 4, option: "Saturn" },
    ],
    explanation: "Mars looks red because iron oxide (rust) covers its surface.",
    correctOption: 3,
  },
  {
    question: "Which gas do plants mainly absorb from the air?",
    options: [
      { optionIndex: 1, option: "Oxygen" },
      { optionIndex: 2, option: "Nitrogen" },
      { optionIndex: 3, option: "Carbon dioxide" },
      { optionIndex: 4, option: "Hydrogen" },
    ],
    explanation: "Plants take in CO₂ and release oxygen during photosynthesis.",
    correctOption: 3,
  },
  {
    question: "Who wrote the play Romeo and Juliet?",
    options: [
      { optionIndex: 1, option: "Charles Dickens" },
      { optionIndex: 2, option: "William Shakespeare" },
      { optionIndex: 3, option: "Mark Twain" },
      { optionIndex: 4, option: "Leo Tolstoy" },
    ],
    explanation: "Shakespeare wrote this tragedy in the 1590s.",
    correctOption: 2,
  },
  {
    question: "What is 15 × 4?",
    options: [
      { optionIndex: 1, option: "45" },
      { optionIndex: 2, option: "50" },
      { optionIndex: 3, option: "60" },
      { optionIndex: 4, option: "75" },
    ],
    explanation: "15 × 4 = 60 = (15 + 15 + 15 + 15).",
    correctOption: 3,
  },
];

const MOCK_LLM_FLASHCARDS = [
  {
    question: "What is photosynthesis?",
    answer:
      "The process by which plants use sunlight, water, and CO₂ to make glucose and release oxygen.",
  },
  {
    question: 'What is the "powerhouse" of the cell?',
    answer: "The mitochondria — they produce energy (ATP) for the cell.",
  },
  {
    question: "What is the chemical formula for water?",
    answer: "H₂O — two hydrogen atoms bonded to one oxygen atom.",
  },
  {
    question: "What force keeps planets in orbit around the Sun?",
    answer: "Gravity — the attractive force between masses.",
  },
  {
    question: "What are the three common states of matter?",
    answer: "Solid, liquid, and gas.",
  },
  {
    question: "What is Newton's First Law of Motion?",
    answer:
      "An object stays at rest or moves uniformly unless acted on by an external force (inertia).",
  },
  {
    question: "What does DNA stand for?",
    answer:
      "Deoxyribonucleic acid — the molecule that carries genetic information.",
  },
  {
    question: "Approximately how fast does light travel?",
    answer: "About 300,000 km per second in a vacuum.",
  },
];

// Sample mind map shown ONLY in the landing-page demo (passed to CanvasDemo).
const MIND_MAP_NODES = [
  { id: "p", type: "agent", position: { x: 40, y: 250 }, data: { label: "Photosynthesis" } },
  { id: "in", type: "agent", position: { x: 320, y: 70 }, data: { label: "Inputs" } },
  { id: "out", type: "agent", position: { x: 320, y: 265 }, data: { label: "Outputs" } },
  { id: "loc", type: "agent", position: { x: 320, y: 425 }, data: { label: "Where it happens" } },
  { id: "sun", type: "agent", position: { x: 600, y: 0 }, data: { label: "Sunlight" } },
  { id: "water", type: "agent", position: { x: 600, y: 70 }, data: { label: "Water (H₂O)" } },
  { id: "co2", type: "agent", position: { x: 600, y: 140 }, data: { label: "Carbon dioxide (CO₂)" } },
  { id: "glucose", type: "agent", position: { x: 600, y: 230 }, data: { label: "Glucose" } },
  { id: "oxygen", type: "agent", position: { x: 600, y: 300 }, data: { label: "Oxygen (O₂)" } },
  { id: "chloroplast", type: "agent", position: { x: 600, y: 390 }, data: { label: "Chloroplast" } },
  { id: "chlorophyll", type: "agent", position: { x: 600, y: 460 }, data: { label: "Chlorophyll" } },
];

const MIND_MAP_EDGES = [
  { id: "e-p-in", source: "p", target: "in" },
  { id: "e-p-out", source: "p", target: "out" },
  { id: "e-p-loc", source: "p", target: "loc" },
  { id: "e-in-sun", source: "in", target: "sun" },
  { id: "e-in-water", source: "in", target: "water" },
  { id: "e-in-co2", source: "in", target: "co2" },
  { id: "e-out-glucose", source: "out", target: "glucose" },
  { id: "e-out-oxygen", source: "out", target: "oxygen" },
  { id: "e-loc-chloroplast", source: "loc", target: "chloroplast" },
  { id: "e-loc-chlorophyll", source: "loc", target: "chlorophyll" },
];

export default function ScrollableCardStackDemo() {
 
  const cardData: TCardDataProps[] = [
    {
      id: 1,
      content: <div className="flex w-full h-full items-center justify-center px-1.5"><QuizCarousel quizzes={MOCK_LLM_QUIZZES} /></div>,
      caption: "Play quiz here only !!",
    },
    {
      id: 2,
      content: <div className="mt-10"><FlashCardsCarousel flashCards={MOCK_LLM_FLASHCARDS} /></div>,
      caption: "scroll your flash cards !!",
    },
    {
      id: 3,
      content: <CanvasDemo nodes={MIND_MAP_NODES} edges={MIND_MAP_EDGES} />,
      caption: "Edit or download your AI generated mindmap !!",
    },
    {
      id: 4,
      content: <ChatDemo />,
      caption: "Chat with your document !!",
    },
  ];

  return (
    <div className="max-w-full">
      <ScrollableCardStack
        cardHeight={600}
        className="mx-auto"
        items={cardData}
        perspective={1200}
        transitionDuration={200}
        header={
          <div className="flex flex-col items-center mb-5">
            <Headings title="Example Output" subtitle="Features" subheading="Interactive Playground" />
            
          </div>
        }
      />
    </div>
  );
}
