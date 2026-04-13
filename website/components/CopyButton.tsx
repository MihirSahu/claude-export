"use client";

import { useEffect, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

type CopyButtonProps = {
  value: string;
  ariaLabel: string;
};

export function CopyButton({ value, ariaLabel }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") {
      return;
    }

    const timer = window.setTimeout(() => {
      setState("idle");
    }, 1600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [state]);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <button
      type="button"
      className={`copy-button${state === "copied" ? " is-copied" : ""}${
        state === "failed" ? " is-failed" : ""
      }`}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {state === "copied" ? "copied" : state === "failed" ? "copy failed" : "copy"}
    </button>
  );
}
