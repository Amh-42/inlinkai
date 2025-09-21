import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Firecrawl from '@mendable/firecrawl-js';
import OpenAI from 'openai';

const firecrawl = process.env.FIRECRAWL_API_KEY ? new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY }) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sources, contentType = 'linkedin_post' } = await request.json();
    
    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json({ error: 'At least one source URL is required' }, { status: 400 });
    }

    console.log('📰 Creating content from sources:', sources);
    console.log('🔧 Firecrawl configured:', !!firecrawl);
    console.log('🔧 OpenAI configured:', !!openai);
    console.log('🔧 Firecrawl API key present:', !!process.env.FIRECRAWL_API_KEY);
    console.log('🔧 Firecrawl API key prefix:', process.env.FIRECRAWL_API_KEY?.substring(0, 8) + '...');

    // Test Firecrawl with a simple URL first if this is the first source
    if (firecrawl && sources.length > 0) {
      try {
        console.log('🧪 Testing Firecrawl API with simple URL...');
        const testResult = await firecrawl.scrape('https://example.com', { formats: ['markdown'] }) as any;
        console.log('🧪 Firecrawl test result:', {
          result: testResult,
          type: typeof testResult,
          keys: testResult ? Object.keys(testResult) : [],
          success: testResult?.success,
          hasData: !!testResult?.data,
          error: testResult?.error
        });
      } catch (testError: any) {
        console.error('🧪 Firecrawl test failed:', testError.message);
      }
    }

    // Crawl the provided sources using Firecrawl
    const crawledContent = [];
    
    for (const source of sources) {
      try {
        console.log(`🔍 Crawling: ${source}`);
        
        if (!firecrawl) {
          console.log('⚠️ Firecrawl API key not configured, using mock data');
          crawledContent.push({
            url: source,
            title: "Sample News Article",
            content: "This is a sample news article about the latest trends in AI and technology. The article discusses how artificial intelligence is transforming various industries and creating new opportunities for professionals.",
            source: 'mock'
          });
          continue;
        }

        // Special handling for Wikipedia and other challenging sites
        const isWikipedia = source.includes('wikipedia.org') || source.includes('wikitia.com');
        console.log(`🔍 Crawling ${isWikipedia ? 'Wikipedia-style' : 'regular'} site: ${source}`);

        // Start with basic options and add complexity if needed
        const scrapeOptions: any = {
          formats: ['markdown'],
          onlyMainContent: true
        };

        // Add Wikipedia-specific options if needed
        if (isWikipedia) {
          scrapeOptions.waitFor = 5000;
          scrapeOptions.timeout = 30000;
        }

        console.log(`🔧 Using scrape options:`, {
          formats: scrapeOptions.formats,
          waitFor: scrapeOptions.waitFor,
          timeout: scrapeOptions.timeout,
          hasActions: !!scrapeOptions.actions
        });

        console.log(`🚀 Making Firecrawl API call...`);
        const result = await firecrawl.scrape(source, scrapeOptions) as any;

        console.log(`🔍 Raw Firecrawl response:`, {
          result: result,
          type: typeof result,
          keys: result ? Object.keys(result) : [],
          success: result?.success,
          data: result?.data,
          error: result?.error
        });

        // Handle both success property and direct data response
        const isSuccess = result?.success === true || (result?.data && !result?.error);
        const responseData = result?.data || result;

        console.log(`🔍 Processed Firecrawl result for ${source}:`, {
          isSuccess,
          hasResponseData: !!responseData,
          dataKeys: responseData ? Object.keys(responseData) : [],
          title: responseData?.metadata?.title,
          hasMarkdown: !!responseData?.markdown,
          hasHtml: !!responseData?.html,
          contentLength: responseData?.markdown?.length || responseData?.html?.length || 0
        });

        if (isSuccess && responseData) {
          crawledContent.push({
            url: source,
            title: responseData.metadata?.title || 'Untitled',
            content: responseData.markdown || responseData.html || '',
            source: 'firecrawl'
          });
          console.log(`✅ Successfully crawled: ${source}`);
        } else {
          console.log(`⚠️ Failed to crawl ${source}, using mock data`);
          crawledContent.push({
            url: source,
            title: "Sample Article",
            content: "Sample content from the provided URL. This would normally contain the actual scraped content.",
            source: 'mock'
          });
        }
      } catch (error: any) {
        console.error(`❌ Error crawling ${source}:`, {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          response: error.response?.data,
          stack: error.stack?.split('\n').slice(0, 3) // First 3 lines of stack
        });
        
        crawledContent.push({
          url: source,
          title: "Error Loading Article",
          content: `Unable to load content from this source. Error: ${error.message || 'Unknown error'}`,
          source: 'error'
        });
      }
    }

    // Generate content using OpenAI
    const contentPrompt = `
    You are a professional LinkedIn content creator. Based on the following news articles and information, create engaging ${contentType} content.

    Source Articles:
    ${crawledContent.map((item, index) => `
    Article ${index + 1}: ${item.title}
    URL: ${item.url}
    Content: ${item.content.substring(0, 1000)}...
    `).join('\n')}

    Please create:
    1. A compelling LinkedIn post (max 1300 characters)
    2. 3-5 relevant hashtags
    3. A call-to-action
    4. Key insights from the articles

    Format your response as JSON:
    {
      "post": "...",
      "hashtags": ["...", "...", "..."],
      "callToAction": "...",
      "keyInsights": ["...", "...", "..."]
    }
    `;

    let generatedContent;
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a professional LinkedIn content creator. Always respond with valid JSON."
            },
            {
              role: "user",
              content: contentPrompt
            }
          ],
          temperature: 0.7,
        });

        const responseContent = completion.choices[0].message.content;
        generatedContent = JSON.parse(responseContent || '{}');
        console.log('✅ Successfully generated content');
      } catch (error) {
        console.error('❌ Error generating content with OpenAI:', error);
        generatedContent = null;
      }
    }

    // Fallback generated content if OpenAI is not available or failed
    if (!generatedContent) {
      console.log('⚠️ Using fallback content generation');
      generatedContent = {
        post: "🚀 Exciting developments in the tech world! Based on the latest industry insights, here are the key trends shaping our future:\n\n✨ AI continues to revolutionize how we work and innovate\n💡 New opportunities are emerging for professionals to upskill\n🌟 The intersection of technology and human creativity is more important than ever\n\nWhat trends are you most excited about? Share your thoughts below! 👇",
        hashtags: ["#TechTrends", "#AI", "#Innovation", "#ProfessionalDevelopment", "#FutureOfWork"],
        callToAction: "What trends are you most excited about? Share your thoughts below! 👇",
        keyInsights: [
          "AI is transforming multiple industries simultaneously",
          "Continuous learning is becoming essential for career growth",
          "Human creativity remains irreplaceable in the age of automation"
        ]
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        sources: crawledContent,
        generatedContent,
        contentType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in stay-relevant API:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
