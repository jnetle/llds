// MOCK COPY — invented, not real client words, so the homepage section can be reviewed with realistic text. Replace
// every `quote` before launch. Attributions are anonymized by place, per the convention above PROJECT_META.

export type Testimonial = {
  id: string;
  quote: string;
  attribution: string; // anonymized — no client surnames
  project: string;
  year: string;
};

// Ordered newest-first, matching PROJECT_META, so places and years line up with the rest of the site.
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'yucca-ave',
    quote:
      'The house feels older than it is, in the way we hoped it would. Nothing in it announces itself, and a year on there is still nothing we would take back.',
    attribution: 'A homeowner in North Augusta, SC',
    project: 'Yucca Ave',
    year: '2026'
  },
  {
    id: 'mcdonald-ln',
    quote: 'They read the light in the lot before they drew a single wall. Every room now gets the hour it was meant to get.',
    attribution: 'A homeowner in Evans, GA',
    project: 'McDonald Ln',
    year: '2025'
  },
  {
    id: 'faveran-ln',
    quote:
      'We came in with a folder of pictures and left with something quieter than any of them. That was the right trade, and they were patient enough to let us find it ourselves.',
    attribution: 'A homeowner in McCormick, SC',
    project: 'Faveran Ln',
    year: '2025'
  },
  {
    id: 'two-mile-dr',
    quote:
      'Every material choice still reads a year in — the floors, the plaster, the brass that was always going to darken. It was chosen to age, not to photograph.',
    attribution: 'A homeowner in Johnston, SC',
    project: 'Two Mile Dr',
    year: '2025'
  },
  {
    id: 'holiday-rd',
    quote: 'What surprised us was how little we had to explain. They asked how we actually spend a Sunday, and the plan answered it.',
    attribution: 'A homeowner in McCormick, SC',
    project: 'Holiday Rd',
    year: '2024'
  },
  {
    id: 'gordon-dr',
    quote:
      'The drawings were unhurried and the decisions held. We never once found ourselves reworking something that had already been settled.',
    attribution: 'A homeowner in Modoc, SC',
    project: 'Gordon Dr',
    year: '2024'
  }
];
