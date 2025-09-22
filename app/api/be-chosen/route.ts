import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import OpenAI from 'openai';

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

    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    console.log('🎯 Building CRM for user:', username);

    // Fetch recent activity data
    let recentActivity;
    try {
      const response = await fetch(`http://localhost:5000/in/${username}/recent-activity/all/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'InlinkAI-Dashboard/1.0',
        },
      });

      if (response.ok) {
        recentActivity = await response.json();
        console.log('✅ Successfully fetched recent activity:', {
          postsCount: recentActivity?.posts?.length || 0,
          firstPostLikes: recentActivity?.posts?.[0]?.likes?.length || 0,
          firstPostComments: recentActivity?.posts?.[0]?.comments?.length || 0
        });
      } else {
        console.log('⚠️ External service unavailable, using mock data');
        // Mock recent activity data matching the new format
        recentActivity = {
          posts: [
            {
              id: 1,
              content: "Just launched our new AI-powered tool! Excited to see the impact it will have on productivity.",
              author: { id: 1, username: "johndoe", name: "John Doe" },
              created_at: "2025-09-15T10:30:00",
              likes_count: 5,
              comments_count: 2,
              likes: [
                { id: 1, user: { id: 2, username: "sarahjohnson", name: "Sarah Johnson" }, created_at: "2025-09-15T11:00:00" },
                { id: 2, user: { id: 3, username: "mikechen", name: "Mike Chen" }, created_at: "2025-09-15T12:00:00" }
              ],
              comments: [
                { id: 1, content: "Great work!", user: { id: 4, username: "lisawang", name: "Lisa Wang" }, created_at: "2025-09-15T13:00:00" }
              ]
            }
          ]
        };
      }
    } catch (error) {
      console.log('⚠️ Error fetching activity, using mock data:', error);
      recentActivity = {
        posts: [
          {
            id: 1,
            content: "Sample post content",
            author: { id: 1, username: "johndoe", name: "John Doe" },
            created_at: "2025-09-15T10:30:00",
            likes_count: 2,
            comments_count: 1,
            likes: [
              { id: 1, user: { id: 2, username: "johnsmith", name: "John Smith" }, created_at: "2025-09-15T11:00:00" }
            ],
            comments: []
          }
        ]
      };
    }

    // Extract unique contacts from likes and comments
    const contacts = new Map();
    
    recentActivity.posts?.forEach((post: any) => {
      // Add likers from the new format
      post.likes?.forEach((like: any) => {
        const user = like.user;
        const contactKey = user.username; // Use username as unique key
        
        if (!contacts.has(contactKey)) {
          contacts.set(contactKey, {
            id: user.id,
            name: user.name,
            username: user.username,
            title: `Professional at ${user.name.split(' ')[1] || 'Company'}`, // Generate a title
            profileUrl: `linkedin.com/in/${user.username}`,
            interactions: [],
            score: 0
          });
        }
        
        const contact = contacts.get(contactKey);
        contact.interactions.push({
          type: 'like',
          postId: post.id,
          postContent: post.content.substring(0, 100) + '...',
          date: like.created_at
        });
        contact.score += 1; // Like = 1 point
      });

      // Add commenters from the new format
      post.comments?.forEach((comment: any) => {
        const user = comment.user;
        const contactKey = user.username; // Use username as unique key
        
        if (!contacts.has(contactKey)) {
          contacts.set(contactKey, {
            id: user.id,
            name: user.name,
            username: user.username,
            title: `Professional at ${user.name.split(' ')[1] || 'Company'}`, // Generate a title
            profileUrl: `linkedin.com/in/${user.username}`,
            interactions: [],
            score: 0
          });
        }
        
        const contact = contacts.get(contactKey);
        contact.interactions.push({
          type: 'comment',
          postId: post.id,
          postContent: post.content.substring(0, 100) + '...',
          commentContent: comment.content,
          date: comment.created_at
        });
        contact.score += 3; // Comment = 3 points
      });
    });

    const crmContacts = Array.from(contacts.values()).sort((a, b) => b.score - a.score);

    console.log('📊 CRM Analysis:', {
      totalPosts: recentActivity.posts?.length || 0,
      totalContacts: crmContacts.length,
      topContactNames: crmContacts.slice(0, 5).map(c => c.name),
      topContactScores: crmContacts.slice(0, 5).map(c => c.score)
    });

    // Generate personalized outreach messages for top contacts
    const topContacts = crmContacts.slice(0, 5);
    const outreachMessages = [];

    for (const contact of topContacts) {
      try {
        const outreachPrompt = `
        Create a personalized LinkedIn outreach message for the following contact:
        
        Name: ${contact.name}
        Title: ${contact.title}
        Recent Interactions: ${contact.interactions.map((i: any) => `${i.type} on post: "${i.postContent}"`).join(', ')}
        
        The message should:
        1. Be professional and personalized
        2. Reference their recent engagement
        3. Suggest a valuable connection or collaboration
        4. Be concise (max 200 words)
        5. Include a clear call-to-action
        
        Format as JSON:
        {
          "message": "...",
          "subject": "..."
        }
        `;

        let message;
        if (openai) {
          let responseContent = '';
          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content: "You are a professional networking expert. Create personalized, valuable outreach messages. IMPORTANT: Respond ONLY with valid JSON in the exact format requested. Do not include any markdown, code blocks, or additional text."
                },
                {
                  role: "user",
                  content: outreachPrompt
                }
              ],
              temperature: 0.7,
            });

            responseContent = completion.choices[0].message.content || '';
            console.log(`🤖 Raw OpenAI response for ${contact.name}:`, responseContent);
            
            // More aggressive cleaning for JSON parsing
            let cleanedContent = responseContent || '{}';
            
            // Remove markdown code blocks if present
            cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            
            // Remove control characters but preserve necessary whitespace
            cleanedContent = cleanedContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
            
            // Fix common JSON issues
            cleanedContent = cleanedContent
              .replace(/\n/g, ' ') // Replace newlines with spaces
              .replace(/\r/g, ' ') // Replace carriage returns with spaces
              .replace(/\t/g, ' ') // Replace tabs with spaces
              .replace(/\s+/g, ' ') // Collapse multiple spaces
              .trim();
            
            console.log(`🧹 Cleaned response for ${contact.name}:`, cleanedContent);
            
            // Try parsing the cleaned content
            try {
              message = JSON.parse(cleanedContent);
            } catch (parseError) {
              console.warn(`⚠️ First JSON parse failed for ${contact.name}, trying to extract JSON from response...`);
              
              // Try to extract JSON from the response using regex
              const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  message = JSON.parse(jsonMatch[0]);
                  console.log(`✅ Successfully extracted JSON for ${contact.name}`);
                } catch (regexParseError) {
                  console.error(`❌ Regex JSON parse also failed for ${contact.name}:`, regexParseError);
                  throw parseError; // Throw original error
                }
              } else {
                throw parseError; // Throw original error
              }
            }
          } catch (error) {
            console.error(`❌ Error generating message for ${contact.name}:`, error);
            console.error(`❌ Problematic content:`, responseContent);
            message = null;
          }
        }

        // Fallback message if OpenAI is not available or failed
        if (!message) {
          message = {
            subject: `Thanks for engaging with my content, ${contact.name}!`,
            message: `Hi ${contact.name},\n\nI noticed you've been engaging with my recent posts about AI and technology - thank you for the ${contact.interactions[0]?.type}!\n\nGiven your role as ${contact.title}, I'd love to connect and share insights about the industry. I think we could have some valuable discussions about the future of technology.\n\nWould you be open to a brief coffee chat or call sometime this week?\n\nBest regards,\n[Your name]`
          };
        }

        outreachMessages.push({
          contact,
          ...message
        });

      } catch (error) {
        console.error(`❌ Error generating message for ${contact.name}:`, error);
        outreachMessages.push({
          contact,
          subject: `Great connecting with you, ${contact.name}!`,
          message: `Hi ${contact.name}, thanks for engaging with my content! Would love to connect and chat about our shared interests in the industry.`
        });
      }
    }

    console.log('✅ Successfully built CRM and generated outreach messages');

    return NextResponse.json({
      success: true,
      data: {
        totalContacts: crmContacts.length,
        crmContacts: crmContacts,
        topContacts: topContacts,
        outreachMessages: outreachMessages,
        recentActivity: recentActivity,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in be-chosen API:', error);
    return NextResponse.json(
      { error: 'Failed to build CRM' },
      { status: 500 }
    );
  }
}
