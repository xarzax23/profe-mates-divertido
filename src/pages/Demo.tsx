import MarkdownMath from "@/components/MarkdownMath";

export default function Demo() {
  return (
    <div className="p-6">
      <MarkdownMath>
        {`Suma de fracciones: $\\tfrac{1}{2} + \\tfrac{1}{3} = \\tfrac{5}{6}$`}
      </MarkdownMath>
    </div>
  );
}
