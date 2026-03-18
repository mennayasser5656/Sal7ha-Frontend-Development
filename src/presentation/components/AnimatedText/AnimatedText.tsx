"use client";

import React from "react";
import styles from "./AnimatedText.module.css";

interface AnimatedTextProps {
  text: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  baseDelay?: number;
  letterDelay?: number;
}

export default function AnimatedText({
  text,
  as: Tag = "span",
  className,
  baseDelay = 500,
  letterDelay = 30,
}: AnimatedTextProps) {
  let charIndex = 0;

  const words = text.split(" ");

  return (
    <Tag className={className}>
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className={styles.word}>
          {word.split("").map((char) => {
            const delay = baseDelay + letterDelay * charIndex;
            charIndex++;
            return (
              <span
                key={`${wordIdx}-${charIndex}`}
                className={styles.letter}
                style={{ animationDelay: `${delay}ms` }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
