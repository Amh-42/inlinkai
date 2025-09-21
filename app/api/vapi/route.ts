import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { VapiClient } from '@vapi-ai/server-sdk';

const vapi = process.env.VAPI_API_KEY ? new VapiClient({ 
  token: process.env.VAPI_API_KEY 
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

    const { action, contactData } = await request.json();

    if (!vapi) {
      console.log('⚠️ VAPI API key not configured, returning mock response');
      return NextResponse.json({
        success: true,
        data: {
          assistantId: 'mock-assistant-id',
          phoneNumber: '+1-555-MOCK-NUM',
          message: 'VAPI integration is not configured. This is a mock response.',
          practiceScenario: contactData ? {
            contactName: contactData.name,
            contactTitle: contactData.title,
            suggestedApproach: 'Start with a warm introduction referencing their recent LinkedIn activity, then transition to discussing mutual interests in the industry.',
            keyTalkingPoints: [
              'Reference their recent engagement with your content',
              'Discuss industry trends and challenges',
              'Propose a specific collaboration or meeting',
              'Ask thoughtful questions about their work'
            ]
          } : null
        }
      });
    }

    switch (action) {
      case 'create_assistant':
        console.log('🤖 Creating VAPI assistant for cold call practice');
        
        const assistantPrompt = contactData ? 
          `You are a professional cold call practice assistant. You will roleplay as ${contactData.name}, a ${contactData.title}. 

          Your role:
          - Act as the contact receiving the cold call
          - Be realistic but not overly difficult
          - Provide constructive feedback after the call
          - Ask relevant questions about the caller's proposition
          - Show interest but also some natural skepticism
          
          The caller is practicing their outreach skills for LinkedIn networking and business development.
          
          Keep responses natural and conversational. After the call ends, provide brief feedback on:
          1. Opening effectiveness
          2. Value proposition clarity  
          3. Question quality
          4. Overall professionalism
          ` :
          `You are a cold call practice assistant. Help users practice their phone outreach skills by roleplaying as various types of business contacts. Be realistic, professional, and provide constructive feedback.`;

        const assistant = await vapi.assistants.create({
          name: contactData ? `Practice Call with ${contactData.name}` : "Cold Call Practice Assistant",
          firstMessage: contactData ? 
            `Hello, this is ${contactData.name}. I see you're calling - how can I help you today?` :
            "Hello, this is your practice contact. Go ahead and start your pitch!",
          model: {
            provider: "openai",
            model: "gpt-4",
            messages: [
              { 
                role: "system", 
                content: assistantPrompt
              }
            ]
          },
          voice: {
            provider: "11labs",
            voiceId: "21m00Tcm4TlvDq8ikWAM" // Professional voice
          }
        });

        console.log('✅ Successfully created VAPI assistant');

        return NextResponse.json({
          success: true,
          data: {
            assistantId: assistant.id,
            message: 'Practice assistant created successfully',
            practiceScenario: contactData ? {
              contactName: contactData.name,
              contactTitle: contactData.title,
              suggestedApproach: 'Start with a warm introduction, reference their LinkedIn activity, and propose a specific value proposition.',
              keyTalkingPoints: [
                'Reference their recent engagement with your content',
                'Discuss industry trends relevant to their role',
                'Propose a specific collaboration or meeting',
                'Ask thoughtful questions about their challenges'
              ]
            } : null
          }
        });

      case 'start_call':
        const { assistantId, phoneNumber } = await request.json();
        
        if (!assistantId || !phoneNumber) {
          return NextResponse.json({ error: 'Assistant ID and phone number are required' }, { status: 400 });
        }

        console.log('📞 Starting practice call');

        const call = await vapi.calls.create({
          assistantId: assistantId,
          customer: { number: phoneNumber }
        });

        return NextResponse.json({
          success: true,
          data: {
            callId: (call as any).id || 'call-initiated',
            status: 'initiated',
            message: 'Practice call started successfully'
          }
        });

      case 'get_phone_number':
        console.log('📱 Getting available phone numbers');

        const numbers = await vapi.phoneNumbers.list();
        
        return NextResponse.json({
          success: true,
          data: {
            phoneNumbers: numbers,
            message: 'Available phone numbers retrieved'
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error in VAPI integration:', error);
    return NextResponse.json(
      { error: 'Failed to process VAPI request' },
      { status: 500 }
    );
  }
}
