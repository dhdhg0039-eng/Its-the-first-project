// AI Chat with local knowledge base
class AIChat {
  constructor() {
    this.messages = [];
    this.facts = [
      'The global beverage market is worth over $2 trillion annually.',
      'Beer is the most consumed alcoholic beverage worldwide, accounting for ~50% of alcohol consumption.',
      'Craft beer represents over 13% of the US beer market by value.',
      'Wine consumption has grown 15-20% in emerging markets over the past 5 years.',
      'The spirits market is the fastest-growing segment, driven by premium products.',
      'Hard seltzers captured 5% of the beverage alcohol market in just 3 years.',
      'E-commerce alcohol sales are growing 30% annually, reshaping distribution.',
      'Sustainability is now a top consumer concern, driving packaging innovation in beverage industry.',
      'Non-alcoholic beverages are growing 3x faster than alcoholic drinks.',
      'The RTD (Ready-to-Drink) cocktail market is expected to reach $10 billion by 2025.',
      'Millennials prefer craft and premium beverages over mass-market brands.',
      'Regulatory changes continue to shape the beverage industry landscape.',
      'International markets offer huge growth opportunities for beverage brands.',
      'Direct-to-consumer sales are disrupting traditional three-tier distribution.',
      'Functional beverages with health benefits are emerging as a major trend.'
    ];
  }

  async chat(message) {
    const lower = message.toLowerCase();

    // Fun facts
    if (lower.includes('fact') || lower.includes('interesting')) {
      return '📊 ' + this.facts[Math.floor(Math.random() * this.facts.length)];
    }

    // Category questions
    if (lower.includes('beer')) {
      return 'Beer is the largest segment of the alcoholic beverage market. Major trends include craft beer growth, low-calorie options, and sustainability initiatives. What would you like to know more about?';
    }
    if (lower.includes('wine')) {
      return 'The wine market is experiencing growth in emerging regions. Key trends: organic wines, natural wines, and direct-to-consumer sales. Interested in a specific region or trend?';
    }
    if (lower.includes('spirit') || lower.includes('whiskey')) {
      return 'Spirits are the highest-margin beverage category. Premium spirits and craft distilleries are leading growth. Flavored spirits and international brands are major trends.';
    }
    if (lower.includes('market') || lower.includes('trend')) {
      return 'The beverage market is evolving rapidly with premiumization, health consciousness, and e-commerce expansion. What market segment interests you?';
    }
    if (lower.includes('regulation') || lower.includes('law')) {
      return 'Beverage regulations vary significantly by region. Key focus areas: labeling requirements, alcohol content restrictions, and distribution regulations. Which state interests you?';
    }

    // Default responses
    const responses = [
      'I can help you understand beverage industry trends, regulations, market data, and more. Ask me about beer, wine, spirits, market trends, or regulations!',
      'Beverage Brain provides real-time industry news and insights. What would you like to explore today?',
      'The beverage industry is dynamic and evolving. I can discuss trends, regulations, market opportunities, and specific segments. What interests you?',
      '🍷 Ask me about any beverage industry topic - from market trends to regulatory updates!'
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

const aiChat = new AIChat();
