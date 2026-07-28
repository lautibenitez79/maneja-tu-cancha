import { useEffect, useState } from "react";

export function Typewriter({
  words,
  className,
}: {
  words: string[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];
    const speed = deleting ? 40 : 70;
    const t = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, sub.length + 1);
        setSub(next);
        if (next === current) setTimeout(() => setDeleting(true), 1400);
      } else {
        const next = current.slice(0, sub.length - 1);
        setSub(next);
        if (next.length === 0) {
          setDeleting(false);
          setIndex((i) => i + 1);
        }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [sub, deleting, index, words]);

  return (
    <span className={className}>
      {sub}
      <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] animate-pulse bg-primary align-middle" />
    </span>
  );
}
