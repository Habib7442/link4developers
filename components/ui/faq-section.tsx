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
    <div className="glassmorphic rounded-[16px] p-6 shadow-[0px_8px_16px_rgba(0,0,0,0.20)] mb-4">
      <button
        className="flex justify-between items-center w-full text-left py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[18px] font-medium leading-[22px] tracking-[-0.54px] font-sharp-grotesk text-white pr-4">{question}</span>
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-[#54E0FF]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#54E0FF]" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-[#33373b]">
          <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">{answer}</p>
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
      answer: "Our GitHub integration allows you to connect your GitHub account and manually add your repository links through our link manager. You can showcase your open source work by adding project details and links directly through our intuitive dashboard."
    },
    {
      question: "Can I showcase projects that aren't on GitHub?",
      answer: "Absolutely! You can manually add projects from any source, including GitLab, Bitbucket, or personal projects. You can include links, descriptions, screenshots, and even embed live demos."
    },
  ];

  return (
    <section className="relative w-full bg-[#18181a] py-20 overflow-hidden">
      <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[48px] font-normal leading-[56px] tracking-[-2.88px] font-sharp-grotesk gradient-text-primary mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-[20px] font-light leading-[30px] tracking-[-0.6px] text-[#7a7a83] font-sharp-grotesk max-w-[600px] mx-auto">
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