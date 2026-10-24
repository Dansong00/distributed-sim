import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X, ExternalLink } from "lucide-react";
import { LessonDiagram } from "./LessonDiagram";
import { Dialog } from "../ui/Dialog";
import { clientServerLesson as lesson } from "./client-server";

export function LessonDialog({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const slide = lesson.slides[index];
  const move = (offset: number) => {
    heading.current?.focus();
    setIndex(value => Math.max(0, Math.min(lesson.slides.length - 1, value + offset)));
  };
  return createPortal(<Dialog title={lesson.title} onClose={onClose} className="lesson-dialog" closeOnBackdrop>
    <div onKeyDown={event => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault(); event.stopPropagation(); move(event.key === "ArrowLeft" ? -1 : 1);
      }
    }}>
      <button className="lesson-close" aria-label="Close lesson" title="Close lesson" onClick={onClose}><X size={20} /></button>
      <article className="lesson-body" aria-live="polite">
        <small>{slide.section}</small><h3 ref={heading} tabIndex={-1}>{slide.title}</h3>
        <LessonDiagram slide={index} />
        {slide.paragraphs.map(text => <p key={text}>{text}</p>)}
        <p className="lesson-takeaway"><strong>Remember: </strong>{slide.remember}</p>
        {slide.source && <a className="lesson-source" href={slide.source} target="_blank" rel="noreferrer">Source reference<ExternalLink size={14} aria-hidden="true" /></a>}
      </article>
      <footer className="lesson-navigation">
        <button aria-label="Previous slide" title="Previous slide" disabled={index === 0} onClick={() => move(-1)}><ArrowLeft size={20} /></button>
        <span>{index + 1} of {lesson.slides.length}</span>
        <button aria-label="Next slide" title="Next slide" disabled={index === lesson.slides.length - 1} onClick={() => move(1)}><ArrowRight size={20} /></button>
      </footer>
    </div>
  </Dialog>, document.body);
}
