// The product IS this function. Everything else is set dressing.
//
// MVP/concept stage: returns canned prose so the whole app is clickable
// without any API keys. Swap the body for a real vision-LLM call when
// you're ready (see TODO). Keep the signature identical so nothing else
// in the app has to change.
//
// TODO (Rafa): replace with a real call. Recommended (per blueprint feedback):
// send the image straight to a vision-capable LLM with a prose prompt —
// one call, no separate Vision API. Sketch:
//
//   const res = await fetch("/api/describe", { method: "POST", body: formData });
//   const { prose } = await res.json();
//   return prose;
//
// The server route holds the API key, calls the model with a prompt like
// "Describe this image as 150–300 words of evocative prose. Capture light,
// mood, atmosphere, small details. Never mention that it's a photo." Then
// the image is discarded — never stored. (That's the real privacy promise.)

const SAMPLES: string[] = [
  "Late afternoon, and the light has gone the colour of weak tea. Someone has left a window open; the curtain breathes in and out without urgency. On the table, two cups, one of them still warm, the other long abandoned. There is the sense of a conversation that ended well. Dust drifts through the slant of sun like it has nowhere better to be, and neither, it seems, does anyone here.",
  "A street after rain, the kind that doesn't fall so much as settle. Neon bleeds into the puddles and gets stretched thin by passing tyres. A man in a grey coat waits at the crossing though there is no traffic to wait for. Somewhere a shutter is coming down for the night. The whole scene smells, you imagine, of wet concrete and someone's late dinner three floors up.",
  "Morning at the kitchen counter. A loaf, half-cut, leans against the board like it's tired. The kettle has just clicked off and is doing that small ticking thing as it cools. There's a single bright square of sun on the floor that the cat has not yet found but absolutely will. Nothing is happening. Everything is fine. It is, you decide, a good place to be a Tuesday.",
  "Out past the last of the houses, the field hasn't decided what season it's in. The grass is the dull gold of a coin left in a pocket too long. A fence post leans at the angle of a man who has given up arguing. The sky is enormous and a little bored. Far off, a dog is barking at something only the dog believes in.",
];

export async function generateProse(_imageFileName?: string): Promise<string> {
  // simulate the small wait of a real model call — it makes the UI honest
  await new Promise((r) => setTimeout(r, 900));
  return SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
}
