import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LessonViewer({ markdown }: { markdown: string }) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  );
}
