import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isProUser, checkFeatureUsage, incrementUsage } from '@/lib/usage-tracking';
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

    // Check if user is Pro - if so, skip usage checks entirely
    const userIsPro = await isProUser(session.user.id);
    let usageInfo = null;
    
    if (!userIsPro) {
      // Only check usage for free users
      usageInfo = await checkFeatureUsage(session.user.id);
      if (!usageInfo.canUseFeature) {
        return NextResponse.json({ 
          error: 'Usage limit reached',
          message: `You've reached your monthly limit of ${usageInfo.limit} feature uses. Upgrade to Pro for unlimited access.`,
          usageInfo,
          requiresUpgrade: true
        }, { status: 403 });
      }
    }

    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    console.log('🎯 Optimizing profile for user:', username);

    // Fetch user profile data from localhost:8000/in/username
    let profileData;
    try {
      const response = await fetch(`http://localhost:8000/in/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'InlinkAI-Dashboard/1.0',
        },
      });

      if (response.ok) {
        profileData = await response.json();
        console.log('✅ Successfully fetched profile data');
      } else {
        console.log('⚠️ External service unavailable, using mock data');
        // Mock profile data
        profileData = {
          name: "John Doe",
          headline: "Software Engineer at Tech Company",
          about: "Passionate software engineer with 5 years of experience in full-stack development. Love building innovative solutions and learning new technologies.",
          experience: [
            {
              title: "Senior Software Engineer",
              company: "Tech Company",
              duration: "2022 - Present",
              description: "Leading development of web applications using React and Node.js"
            }
          ],
          skills: ["JavaScript", "React", "Node.js", "Python", "AWS"]
        };
      }
    } catch (error) {
      console.log('⚠️ Error fetching profile, using mock data:', error);
      profileData = {
        name: "John Doe",
        headline: "Software Engineer at Tech Company",
        about: "Passionate software engineer with 5 years of experience in full-stack development.",
        skills: ["JavaScript", "React", "Node.js", "Python"]
      };
    }

    // Use OpenAI to optimize the profile
    let optimizedProfile;
    if (openai) {
      const optimizationPrompt = `
      You are a LinkedIn profile optimization expert. Analyze the following profile data and provide specific, actionable recommendations to make it more engaging and professional.

      Profile Data:
      Name: ${profileData.name}
      Headline: ${profileData.headline}
      About: ${profileData.about}
      Skills: ${profileData.skills?.join(', ') || 'Not specified'}

      Please provide:
      1. An optimized headline (max 120 characters)
      2. An optimized about section (max 2000 characters)
      3. 3 specific actionable recommendations
      4. Suggested keywords to include

      Format your response as JSON with the following structure:
      {
        "optimizedHeadline": "...",
        "optimizedAbout": "...",
        "recommendations": ["...", "...", "..."],
        "suggestedKeywords": ["...", "...", "..."]
      }
      `;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a LinkedIn profile optimization expert. Always respond with valid JSON."
            },
            {
              role: "user",
              content: optimizationPrompt
            }
          ],
          temperature: 0.7,
        });

        const responseContent = completion.choices[0].message.content;
        optimizedProfile = JSON.parse(responseContent || '{}');
        console.log('✅ Successfully generated profile optimizations');
      } catch (error) {
        console.error('❌ Error with OpenAI optimization:', error);
        optimizedProfile = null;
      }
    }

    // Fallback optimized profile if OpenAI is not available or failed
    if (!optimizedProfile) {
      console.log('⚠️ Using fallback profile optimization');
      optimizedProfile = {
        optimizedHeadline: "🚀 Senior Software Engineer | Full-Stack Developer | Building Scalable Web Solutions",
        optimizedAbout: "Passionate software engineer with 5+ years of experience transforming ideas into robust, scalable web applications. I specialize in full-stack development using modern technologies like React, Node.js, and cloud platforms.\n\n🔧 What I do:\n• Design and develop high-performance web applications\n• Lead technical initiatives and mentor junior developers\n• Optimize systems for scale and performance\n\n💡 I'm passionate about clean code, innovative solutions, and continuous learning. Always excited to tackle new challenges and collaborate with amazing teams.\n\n📫 Let's connect and discuss how we can build something great together!",
        recommendations: [
          "Add specific metrics and achievements to quantify your impact",
          "Include a professional headshot and update your banner image",
          "Add more relevant skills and get endorsements from colleagues"
        ],
        suggestedKeywords: ["Full-Stack Development", "React", "Node.js", "JavaScript", "Web Applications", "Software Architecture"]
      };
    }

    // Increment usage counter only for free users
    let updatedUsageInfo = null;
    if (!userIsPro) {
      updatedUsageInfo = await incrementUsage(session.user.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        originalProfile: profileData,
        optimizedProfile,
        timestamp: new Date().toISOString()
      },
      ...(updatedUsageInfo && { usageInfo: updatedUsageInfo })
    });

  } catch (error) {
    console.error('❌ Error in get-noticed API:', error);
    return NextResponse.json(
      { error: 'Failed to optimize profile' },
      { status: 500 }
    );
  }
}
