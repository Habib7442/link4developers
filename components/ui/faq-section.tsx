'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 py-4">
      <button
        className="flex justify-between items-center w-full text-left font-medium py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-2 text-gray-600 dark:text-gray-400">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export function FaqSection() {
  const faqs = [
    {
      question: "What makes Link4Coders different from other link-in-bio tools?",
      answer: "Link4Coders is specifically designed for developers with features like GitHub integration, interactive code snippets, skill matrices, and project showcases that highlight your technical abilities in ways generic link-in-bio tools can't."
    },
    {
      question: "When will Link4Coders be available?",
      answer: "We're currently in development and plan to launch our beta version soon. Join our early access list to be among the first to try it out and receive updates on our progress."
    },
    {
      question: "Will there be a free plan?",
      answer: "Yes! We'll offer a free tier with essential features for developers to create a basic profile. Premium features will be available in our Pro and Team plans."
    },
    {
      question: "Can I use a custom domain with Link4Coders?",
      answer: "Custom domains will be available on our Pro and Team plans, allowing you to create a professional web presence with your own domain name."
    },
    {
      question: "How does the GitHub integration work?",
      answer: "Our GitHub integration automatically pulls repository data, stars, contributions, and other metrics to showcase your open source work. It updates dynamically to always show your latest projects and contributions."
    },
    {
      question: "Can I showcase projects that aren't on GitHub?",
      answer: "Absolutely! You can manually add projects from any source, including GitLab, Bitbucket, or personal projects. You can include links, descriptions, screenshots, and even embed live demos."
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Have questions about Link4Coders? Find answers to common questions below.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}