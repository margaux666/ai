// src/lib/corpus.ts
export async function loadNotes() {
  const files = [
    "/corpus/projects.md",
    "/corpus/style.md",
    "/corpus/faq.md",
  ];
  const texts = await Promise.all(
    files.map((p) => fetch(p).then((r) => r.text()).catch(() => ""))
  );
  // keep it short to avoid long prompts
  const joined = texts.join("\n\n").slice(0, 6000);
  return `NOTES:\n${joined}\n\nGuidelines: Use ONLY these notes. If not covered, say you don't know.`;
}
