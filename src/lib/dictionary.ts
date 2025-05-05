import { Word } from "./common/model";

// Mock dictionary definitions
const dictionary: Record<string, string> = {
  are: "Present tense of the verb 'to be'.",
  you: "Used to refer to the person or people being addressed.",
  not: "Used to form a negative statement.",
  afraid: "Feeling fear or anxiety; frightened.",
  of: "Expressing the relationship between a part and a whole.",
  dying: "The process of death; ceasing to live.",
  heiter: "A character name, possibly referring to someone cheerful (from German 'heiter' meaning cheerful).",
  if: "Introducing a conditional clause.",
  happen: "Occur or take place.",
  to: "Expressing motion in the direction of a particular location.",
  visit: "Go to see and spend time with (someone) socially.",
  the: "Definite article used to refer to specific or particular nouns.",
  holy: "Dedicated or consecrated to God or a religious purpose.",
  city: "A large town, typically one that is a center of government, commerce, and culture.",
  leave: "Go away from a place or person.",
  some: "An unspecified amount or number of something.",
  bottles: "Containers, typically made of glass or plastic, with a narrow neck.",
  at: "Expressing location or arrival in a particular place or position.",
  my: "Belonging to or associated with the speaker.",
  grave: "A place of burial for a dead body, typically a hole dug in the ground.",
  we: "Used by a speaker to refer to himself or herself and one or more other people considered together.",
  party: "A group of people taking part in a particular activity or trip.",
  heroes: "People who are admired for their courage, outstanding achievements, or noble qualities.",
  that: "Used to identify a specific person or thing observed or heard by the speaker.",
  saved: "Rescued from danger or difficulty.",
  world: "The earth, together with all of its countries and peoples.",
  i: "Used by a speaker to refer to himself or herself.",
  know: "Be aware of through observation, inquiry, or information.",
  "we'll": "Contraction of 'we will'.",
  live: "Remain alive.",
  in: "Expressing the situation of being enclosed or surrounded by something.",
  luxury: "The state of great comfort and extravagant living.",
  heaven: "A place regarded in various religions as the abode of God and the angels, and of the good after death.",
  after: "In the time following an event or another period of time.",
  die: "Stop living.",
  "that's": "Contraction of 'that is'.",
  whole: "All of; entire.",
  reason: "A cause, explanation, or justification for an action or event.",
  fought: "Past tense of fight - engaged in a battle or conflict.",
  alongside: "Close to the side of; next to.",
}

/**
 * Get a definition for a word from dictionary saved on D1
 * Access serverless endpoint /api/words.
 */
export async function getDictionaryDefinition(word: string) {
  const cleanWord = word.toLowerCase().replace(/[^\w']/g, "")
  const resp = await fetch(`/api/words/${cleanWord}`);
  const data = await resp.json<Word>();
  return data.definition || "No definition available."
}