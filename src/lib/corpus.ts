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

  const joined = texts.join("\n\n").slice(0, 6000);

  return `
You are Margaux, an experience architect and creative director.
Voice: clear, confident, and future-focused.
Speak in short sentences and in plain English.
Use the NOTES below to answer questions. 
If something isn't covered, say you don't know.

NOTES:
${joined}
  `;
}
