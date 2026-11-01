import { hash, validQuestions } from './gate.mjs';

const nonempty = value => typeof value === 'string' && value.trim().length > 0;

function cardsFor(packet) {
  const cards = packet.contract?.cards;
  if (!Array.isArray(cards) || !cards.length || cards.length !== packet.lesson.slides.length) {
    throw new Error('Contract must map every slide to one ordered card');
  }
  const seen = new Set();
  cards.forEach((card, index) => {
    if (!nonempty(card.id) || !/^[a-z][a-z0-9-]*$/.test(card.id) || seen.has(card.id) || card.slide !== index + 1
      || !nonempty(card.objective) || !Array.isArray(card.prerequisites)
      || new Set(card.prerequisites).size !== card.prerequisites.length
      || !card.prerequisites.every(id => seen.has(id))) {
      throw new Error(`Invalid card mapping, objective or earlier prerequisite at slide ${index + 1}`);
    }
    if (!validQuestions(card.questions)) {
      throw new Error(`Missing or invalid transfer questions for card ${card.id}`);
    }
    seen.add(card.id);
  });
  return cards;
}

export function cardPacket(packet, id) {
  const cards = cardsFor(packet);
  const card = cards.find(card => card.id === id);
  if (!card) throw new Error(`Unknown card: ${id}`);
  const { cards: omittedCards, ...baseContract } = packet.contract;
  const contract = { ...baseContract,
    objectives: [{ id: card.id, description: card.objective }], questions: card.questions,
    card: { id: card.id, slide: card.slide, objective: card.objective, prerequisites: card.prerequisites },
    // Bind earlier teaching contracts too, while keeping later answers out of the packet.
    prefixContracts: cards.slice(0, card.slide),
  };
  const lesson = { ...packet.lesson, slides: packet.lesson.slides.slice(0, card.slide) };
  return { ...packet, lesson, contract,
    lessonHash: hash({ lesson, assets: packet.assets, eligibility: packet.eligibility }),
    rubricHash: hash({ rubric: packet.rubric, contract }) };
}

export function releasePackets(packet) {
  return [...cardsFor(packet).map(card => ({ directory: `cards/${card.id}`, packet: cardPacket(packet, card.id) })),
    { directory: 'stack', packet }];
}
