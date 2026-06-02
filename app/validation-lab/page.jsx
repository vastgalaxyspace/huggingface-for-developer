import ModelValidationLab from "../../src/components/validation-lab/ModelValidationLab";
import { pageMetadata } from "../../src/lib/seo";

export const metadata = pageMetadata({
  title: "Model Validation Lab",
  description:
    "Generate model test prompts, runtime snippets, VRAM warnings, and validation notes before choosing an AI model for deployment.",
  path: "/validation-lab",
  keywords: ["AI model validation", "LLM test prompts", "Hugging Face model testing", "model deployment validation"],
});

export default function ValidationLabPage() {
  return (
    <div className="min-h-[calc(100vh-78px)] bg-gray-100 py-8 md:py-12">
      <div className="shell-container">
        <ModelValidationLab />
      </div>
    </div>
  );
}
