// Beverage Brain™ - Real AI Assistant (Completely Free)

class AIAssistant {
    constructor() {
        this.chatHistory = [];
        this.isLoading = false;
        this.knowledgeBase = this.buildKnowledgeBase();
    }

    // Build local knowledge base (NO API CALLS NEEDED for basic responses!)
    buildKnowledgeBase() {
        return {
            // Beverage industry facts
            beverage_facts: {
                market_size: 'Global beverage market is worth over $2 trillion',
                beer_stats: 'Beer represents about 50% of alcoholic beverage consumption globally',
                wine_growth: 'Wine consumption has grown 15-20% in emerging markets',
                spirits_trends: 'Craft spirits and premium spirits are the fastest-growing segment',
                regulations: 'Every US state has different alcohol licensing and distribution laws',
                trends: ['Hard seltzers gaining market share', 'Low/no-alcohol beverages growing', 'Craft beverages preferred', 'E-commerce delivery expanding']
            },

            // US State regulations summary (simplified)
            state_regulations: {
                'California': 'Three-tier system, craft brewery friendly, high taxes',
                'Texas': 'Large market, beer-focused, moderate regulations',
                'New York': 'Craft spirits hub, craft beer friendly, competitive',
                'Florida': 'Growing market, tourist-driven, seasonal variations',
                'default': 'Most states follow three-tier distribution: manufacturer → wholesaler → retailer'
            },

            // Business insights
            business_insights: {
                consolidation: 'Large beverage corporations acquiring craft brands',
                retail_shift: 'Off-premise consumption growing, on-premise challenged',
                innovation: 'CBD beverages, functional drinks, sustainability focus',
                sustainability: 'Consumers prefer eco-friendly packaging and production',
                digital: 'Direct-to-consumer sales growing, social media marketing crucial'
            },

            // Frequently asked questions
            faqs: {
                'what is rtd': 'RTD = Ready-to-Drink. Pre-mixed cocktails, hard seltzers, etc.',
                'craft beer definition': 'Small, independent breweries producing < 6 million barrels/year',
                'three tier system': 'Distribution model: Producers → Wholesalers → Retailers (prevents monopoly)',
                'alcohol license': 'Required for production, distribution, or retail sale of alcohol',
                'excise tax': 'Federal tax on alcoholic beverages, varies by type and state',
                'proof': 'Measure of alcohol content (100 proof = 50% ABV)',
                'abv': 'Alcohol by Volume - percentage of alcohol in beverage',
                'distillation': 'Process of separating alcohol from liquid through heating/cooling'
            }
        };
    }

    // ============ LOCAL AI RESPONSE (No API Key Needed!) ============
    async generateLocalResponse(userMessage) {
        const input = userMessage.toLowerCase();

        // Check for FAQ matches first
        for (const [question, answer] of Object.entries(this.knowledgeBase.faqs)) {
            if (input.includes(question)) {
                return this.formatResponse(`**Q: ${question}**\n\n${answer}`);
            }
        }

        // Check for state-specific questions
        const stateMatch = CONFIG.usStates.find(state => input.includes(state.toLowerCase()));
        if (stateMatch && (input.includes('regulation') || input.includes('law') || input.includes('license'))) {
            const regulation = this.knowledgeBase.state_regulations[stateMatch] || this.knowledgeBase.state_regulations['default'];
            return this.formatResponse(`**Regulations in ${stateMatch}:**\n\n${regulation}`);
        }

        // Check for beverage type questions
        if (input.includes('beer') && !input.includes('whiskey')) {
            return this.generateBeerResponse(input);
        } else if (input.includes('wine')) {
            return this.generateWineResponse(input);
        } else if (input.includes('spirit') || input.includes('whiskey') || input.includes('vodka') || input.includes('rum')) {
            return this.generateSpiritsResponse(input);
        } else if (input.includes('rtd') || input.includes('hard seltzer') || input.includes('premix')) {
            return this.generateRTDResponse(input);
        } else if (input.includes('trend') || input.includes('market') || input.includes('grow')) {
            return this.generateTrendResponse(input);
        } else if (input.includes('regulation') || input.includes('law') || input.includes('license')) {
            return this.generateRegulatoryResponse(input);
        } else if (input.includes('business') || input.includes('brand') || input.includes('company')) {
            return this.generateBusinessResponse(input);
        }

        // Default helpful response
        return this.generateGenericResponse(userMessage);
    }

    generateBeerResponse(input) {
        const responses = [
            `🍺 **Beer Industry Insights:**\n\nBeer is the world's most consumed alcoholic beverage. The craft beer movement has revolutionized the industry, with thousands of small breweries competing on quality and innovation.\n\n**Key Trends:**\n- IPA popularity remains strong\n- Low-calorie/low-carb options gaining traction\n- Craft beer consolidation increasing\n- Sustainability in packaging critical\n\nWant specific info about a beer style, region, or trend?`,
            
            `🍺 **About Beer Markets:**\n\nThe beer industry spans from mega-breweries (Anheuser-Busch, Molson-Coors) to thousands of craft breweries. Key factors:\n\n- **Production**: Brewing requires expertise, equipment, and licensing\n- **Distribution**: Three-tier system (Brewery → Wholesaler → Retailer)\n- **Trends**: Craft, premium, and healthier options dominating growth\n- **Regulations**: Vary significantly by state and country\n\nAsk about specific styles, regulations, or market trends!`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateWineResponse(input) {
        const responses = [
            `🍷 **Wine Industry Overview:**\n\nWine production and consumption involve sophisticated knowledge:\n\n**Regions Famous for Wine:**\n- Napa Valley, CA (USA's premier wine region)\n- Oregon Willamette Valley (Pinot Noir)\n- New York Finger Lakes (Riesling)\n\n**Market Trends:**\n- Natural and organic wines growing\n- E-commerce wine sales booming\n- Direct-to-consumer gaining share\n- Premium wines outperforming bulk wine\n\nWhat specific aspect interests you?`,
            
            `🍷 **Wine Business Insights:**\n\nThe wine industry combines agriculture with hospitality. Key points:\n\n- **Production**: Climate, soil, grapes, and technique matter immensely\n- **Regulations**: Complex labeling and import/export rules\n- **Distribution**: Must navigate three-tier system (with exceptions)\n- **Trends**: Millennial preferences shifting market dynamics\n\nAsk about regions, regulations, or market shifts!`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateSpiritsResponse(input) {
        const responses = [
            `🥃 **Spirits & Liquor Industry:**\n\nSpirits represent premium, high-margin products:\n\n**Major Categories:**\n- Whiskey (Scotch, Bourbon, Rye)\n- Vodka (dominated by large producers)\n- Rum (Caribbean & Latin American production)\n- Gin (London Dry, modern botanical styles)\n- Tequila (Agave-based, Mexican origin)\n\n**Growth Areas:**\n- Craft spirits movement\n- Premium pricing strategies\n- International expansion\n- Flavored/infused spirits\n\nAny specific spirit category?`,
            
            `🥃 **Premium Spirits Market:**\n\nSpirits are the highest-margin beverage category:\n\n- **Production**: Distillation is capital-intensive\n- **Aging**: Barrel aging adds time and cost\n- **Margins**: Higher profit potential than beer/wine\n- **Trends**: Craft producers breaking into premium segment\n- **Regulations**: Complex import/export, labeling requirements\n\nWhat would you like to know?`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateRTDResponse(input) {
        const responses = [
            `🥤 **RTD (Ready-to-Drink) Beverage Boom:**\n\nOne of the fastest-growing segments:\n\n**Products Include:**\n- Hard seltzers (White Claw, Truly)\n- Canned cocktails\n- Hard teas\n- CBD-infused drinks\n- Energy alcohol blends\n\n**Why It's Growing:**\n- Convenience for consumers\n- Portion control\n- Lower calories than traditional drinks\n- Instagram-friendly packaging\n- Younger demographics prefer RTD\n\n**Market Challenge:**\n- Intense competition\n- Price wars\n- Sustainability concerns\n\nSpecific RTD category interest you?`,
            
            `🥤 **RTD Market Dynamics:**\n\nReady-to-Drink beverages revolutionized alcohol consumption:\n\n- **Segment**: Hard seltzers exploded 2019-2021\n- **Saturation**: Market now consolidating\n- **Innovation**: Brands differentiating with flavors, functional benefits\n- **Distribution**: Easier than beer (lighter, more shelf-stable)\n- **Regulation**: Still alcohol, must follow state/federal rules\n\nAsk about specific brands or trends!`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateTrendResponse(input) {
        const responses = [
            `📈 **Current Beverage Industry Trends (2025):**\n\n1. **Health & Wellness**: Low/no-alcohol, functional ingredients\n2. **Sustainability**: Eco-friendly packaging, local sourcing\n3. **Direct-to-Consumer**: DTC sales bypassing distributors\n4. **Premium Shift**: Consumers trading up in quality\n5. **Innovation**: CBD, adaptogens, unique flavor combinations\n6. **Digital**: Social commerce, TikTok-driven trends\n7. **Consolidation**: Large corporations buying craft brands\n8. **Regulation**: More states allowing alcohol e-commerce\n\nWhich trend interests you most?`,
            
            `📈 **Market Growth Drivers:**\n\n**Growing Segments:**\n- Premium spirits (+8% yearly)\n- Hard seltzers (stabilizing after hype)\n- Non-alcoholic craft beverages (+15% yearly)\n- Direct-to-consumer (+20% yearly)\n\n**Declining Segments:**\n- Mass-produced beer (-2% yearly)\n- Traditional wine (flat to declining)\n- On-premise consumption (slowly recovering)\n\n**Investment Areas:**\n- Sustainability solutions\n- E-commerce platforms\n- Functional beverages\n- International expansion\n\nWhat else would you like to know?`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateRegulatoryResponse(input) {
        const responses = [
            `⚖️ **US Alcohol Regulations Overview:**\n\n**Federal Level:**\n- TTB (Alcohol and Tobacco Tax and Trade Bureau) oversees all alcohol\n- Excise taxes on all alcoholic beverages\n- Strict labeling requirements\n- Import/export restrictions\n\n**State Level:**\n- Each state has unique regulations\n- Three-tier system required (producer → wholesaler → retailer)\n- Different rules for beer, wine, spirits\n- On-premise vs. off-premise licensing varies\n\n**Local Level:**\n- Counties and cities add additional restrictions\n- Some areas "dry" (no alcohol sales)\n- License fees and requirements vary widely\n\nNeed info about specific state?`,
            
            `⚖️ **Starting a Beverage Business:**\n\n**Legal Requirements:**\n1. **Licensing**: Federal and state alcohol license\n2. **Compliance**: TTB formula approval, labeling\n3. **Taxes**: Excise tax registration and payment\n4. **Insurance**: Product liability insurance required\n5. **Location**: Zoning restrictions, proximity rules\n\n**Three-Tier System:**\n- Direct-to-consumer prohibited in most states\n- Must sell through wholesale distribution\n- Exception: Some direct-to-consumer laws being created\n\n**State Variation:**\nTexas ≠ California ≠ New York. Research your specific state!\n\nWhich aspect?`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateBusinessResponse(input) {
        const responses = [
            `💼 **Beverage Business Insights:**\n\n**Starting a Beverage Brand:**\n- Capital needed: $50K-$500K depending on model\n- Contract manufacturing available (lower startup cost)\n- Distribution is biggest challenge\n- Marketing/branding = critical success factor\n\n**Business Models:**\n1. **Craft Producer**: Full control, high capital, regulatory complexity\n2. **Brand/Contract Manufacturer**: Lower capital, less control\n3. **Distribution/Wholesale**: Low capital, relationships matter\n4. **Retail/Bar**: Tangible product, local presence\n\n**Success Factors:**\n- Unique positioning (health, taste, sustainability)\n- Strong distribution partnerships\n- Effective marketing and social proof\n- Financial management (margins are thin)\n\nWhat business model interests you?`,
            
            `💼 **Beverage Industry Economics:**\n\n**Typical Margins:**\n- Beer: 20-35% gross margin\n- Wine: 30-50% gross margin\n- Spirits: 40-70% gross margin\n- RTD: 25-40% gross margin\n\n**Market Consolidation:**\n- Large corporations control 60-70% of market\n- Craft brands being acquired ($100M+ deals)\n- Distribution critical (hard to break in)\n- Direct-to-consumer = future opportunity\n\n**Investment Opportunities:**\n- Craft brands with strong following\n- Functional/health-forward beverages\n- Sustainable packaging solutions\n- E-commerce platforms\n\nAny specific business question?`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateGenericResponse(userMessage) {
        const responses = [
            `I can help with beverage industry topics! Try asking about:\n\n- **Beer, wine, spirits**: Production, trends, regions\n- **RTD & hard seltzers**: Market dynamics and growth\n- **Regulations**: State/federal laws, licensing\n- **Business**: Starting a brand, market opportunities\n- **Trends**: Current market movements\n- **Specific states**: Regional regulations and markets\n\nWhat interests you?`,

            `That's an interesting question about the beverage industry! To give you the best answer, could you be more specific about:\n\n- **Product type**: Beer, wine, spirits, RTD?\n- **Topic**: Market trends, regulations, business, production?\n- **Location**: Specific state or region?\n- **Context**: Personal interest, business research, or learning?\n\nBeverage Brain™ is here to help!`,

            `Great question! The beverage industry is complex and varies by:\n\n**Market Segments:**\n- **Beer**: Most consumed, diverse styles\n- **Wine**: Quality and region-focused\n- **Spirits**: Premium, high-margin\n- **RTD**: Fast-growing, innovation-driven\n\n**Key Success Factors:**\n1. Understanding your market segment\n2. Distribution strategy\n3. Regulatory compliance\n4. Brand differentiation\n5. Consumer trends awareness\n\nWhat specific aspect interests you?`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    formatResponse(text) {
        return text;
    }

    // ============ PUBLIC INTERFACE ============
    async chat(userMessage) {
        if (!userMessage.trim()) return null;

        // Add user message to history
        this.chatHistory.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });

        this.isLoading = true;

        try {
            // Generate response using local knowledge base
            const aiResponse = await this.generateLocalResponse(userMessage);

            // Add AI response to history
            this.chatHistory.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            });

            this.isLoading = false;
            return aiResponse;
        } catch (error) {
            console.error('Chat error:', error);
            this.isLoading = false;
            return 'Sorry, I encountered an issue generating a response. Please try again.';
        }
    }

    getChatHistory() {
        return this.chatHistory;
    }

    clearChatHistory() {
        this.chatHistory = [];
    }
}

// Create global instance
const aiAssistant = new AIAssistant();
