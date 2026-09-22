import type { LearningDomainId } from "@/lib/types/domain";

export interface DomainMeta {
  id: LearningDomainId;
  name: string;
  description: string;
  colorVar: string;
}

// Matches the five fixed rows seeded in public.learning_domains. Never editable by clients.
export const LEARNING_DOMAINS: DomainMeta[] = [
  {
    id: 1,
    name: "Neuroscience & Cognition",
    description: "Neurons, synapses, neural circuits, memory, learning, cognition and neurotechnology",
    colorVar: "var(--color-topic-neuro)",
  },
  {
    id: 2,
    name: "Biological Sciences",
    description: "Cell and molecular biology, genetics, epigenetics, biochemistry, physiology and systems biology",
    colorVar: "var(--color-topic-bio)",
  },
  {
    id: 3,
    name: "Aging & Regenerative Science",
    description: "Biological aging, senescence, stem cells, tissue repair, reprogramming, drug discovery and biotechnology",
    colorVar: "var(--color-topic-aging)",
  },
  {
    id: 4,
    name: "AI & Computational Science",
    description: "Programming, statistics, machine learning, bioinformatics, simulation and scientific computing",
    colorVar: "var(--color-topic-ai)",
  },
  {
    id: 5,
    name: "Engineering & Technology",
    description: "Mechanical design, sensors, robotics, control, biomedical engineering and scientific instrumentation",
    colorVar: "var(--color-topic-eng)",
  },
];

export function domainById(id: LearningDomainId): DomainMeta {
  return LEARNING_DOMAINS.find((d) => d.id === id)!;
}
