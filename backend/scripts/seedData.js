const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Project = require('../models/Project');
const Check = require('../models/Check');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Check.deleteMany({});
    console.log('Cleared existing data');

    // Create test user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    await user.save();
    console.log('Created test user');

    // Create sample project
    const project = new Project({
      name: 'TechCorp AI Visibility',
      description: 'Tracking AI search visibility for TechCorp brand and products',
      domain: 'techcorp.com',
      brand: 'TechCorp',
      competitors: [
        { name: 'Competitor A', domain: 'competitor-a.com' },
        { name: 'Competitor B', domain: 'competitor-b.com' }
      ],
      keywords: [
        { keyword: 'artificial intelligence', category: 'primary', targetPosition: 3 },
        { keyword: 'machine learning', category: 'primary', targetPosition: 2 },
        { keyword: 'AI automation', category: 'secondary', targetPosition: 5 },
        { keyword: 'deep learning algorithms', category: 'long-tail', targetPosition: 4 },
        { keyword: 'neural networks', category: 'primary', targetPosition: 3 },
        { keyword: 'AI consulting services', category: 'secondary', targetPosition: 6 },
        { keyword: 'automated decision making', category: 'long-tail', targetPosition: 7 },
        { keyword: 'predictive analytics', category: 'secondary', targetPosition: 4 },
        { keyword: 'AI implementation guide', category: 'long-tail', targetPosition: 5 },
        { keyword: 'intelligent systems', category: 'primary', targetPosition: 3 }
      ],
      owner: user._id,
      settings: {
        checkFrequency: 'daily',
        engines: ['chatgpt', 'gemini', 'claude', 'perplexity']
      }
    });
    await project.save();
    console.log('Created sample project');

    // Generate 14 days of simulated check data
    const engines = ['chatgpt', 'gemini', 'claude', 'perplexity'];
    const checks = [];

    for (let day = 0; day < 14; day++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - day);

      for (const engine of engines) {
        for (const keywordObj of project.keywords) {
          const keyword = keywordObj.keyword;
          
          // Simulate realistic data with trends
          const basePresence = 0.6 + (Math.random() * 0.3); // 60-90% base presence
          const engineModifier = {
            'chatgpt': 1.0,
            'gemini': 0.9,
            'claude': 0.85,
            'perplexity': 0.8
          };
          
          const presence = Math.random() < (basePresence * engineModifier[engine]);
          const position = presence ? Math.floor(Math.random() * 8) + 1 : 0;
          const citationsCount = presence ? Math.floor(Math.random() * 4) : 0;

          const sampleSnippets = [
            `TechCorp is a leading provider of ${keyword} solutions, offering comprehensive services to help businesses implement cutting-edge technology.`,
            `When it comes to ${keyword}, TechCorp has established itself as an industry leader with innovative approaches and proven results.`,
            `TechCorp's expertise in ${keyword} spans over a decade, with successful implementations across various industries.`,
            `The company's ${keyword} platform has been recognized for its advanced capabilities and user-friendly interface.`
          ];

          const sampleUrls = [
            'https://techcorp.com/solutions/ai',
            'https://techcorp.com/blog/ai-trends',
            'https://techcorp.com/case-studies',
            'https://techcorp.com/resources/whitepapers'
          ];

          const check = {
            project: project._id,
            engine,
            keyword,
            position,
            presence,
            answerSnippet: presence ? sampleSnippets[Math.floor(Math.random() * sampleSnippets.length)] : '',
            citationsCount,
            observedUrls: presence ? sampleUrls.slice(0, citationsCount).map((url, index) => ({
              url,
              domain: 'techcorp.com',
              position: index + 1
            })) : [],
            metadata: {
              queryTime: Math.floor(Math.random() * 1500) + 500,
              responseSize: Math.floor(Math.random() * 3000) + 1000,
              userAgent: 'AEO-Tracker/1.0',
              ipAddress: '127.0.0.1'
            },
            status: 'completed',
            createdAt: checkDate,
            updatedAt: checkDate
          };

          checks.push(check);
        }
      }
    }

    await Check.insertMany(checks);
    console.log(`Created ${checks.length} check records`);

    // Create additional projects for variety
    const project2 = new Project({
      name: 'E-commerce AI Tracking',
      description: 'Monitoring AI search presence for e-commerce platform',
      domain: 'shopai.com',
      brand: 'ShopAI',
      competitors: [
        { name: 'E-commerce Giant', domain: 'ecommerce-giant.com' }
      ],
      keywords: [
        { keyword: 'e-commerce AI', category: 'primary', targetPosition: 2 },
        { keyword: 'shopping automation', category: 'secondary', targetPosition: 4 },
        { keyword: 'AI product recommendations', category: 'long-tail', targetPosition: 3 }
      ],
      owner: user._id,
      settings: {
        checkFrequency: 'weekly',
        engines: ['chatgpt', 'gemini']
      }
    });
    await project2.save();
    console.log('Created additional project');

    console.log('Seed data created successfully!');
    console.log('Test user: test@example.com / password123');
    
  } catch (error) {
    console.error('Seed data error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seed if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
