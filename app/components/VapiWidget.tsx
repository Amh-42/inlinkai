'use client';

import React, { useState, useEffect } from 'react';

// Dynamic import to avoid SSR issues
let Vapi: any = null;
if (typeof window !== 'undefined') {
  import('@vapi-ai/web').then((module) => {
    Vapi = module.default;
  });
}

interface VapiWidgetProps {
  apiKey: string;
  assistantId: string;
  contactData?: {
    name: string;
    title: string;
    score: number;
  };
  onCallStart?: () => void;
  onCallEnd?: () => void;
}

const VapiWidget: React.FC<VapiWidgetProps> = ({ 
  apiKey, 
  assistantId, 
  contactData,
  onCallStart,
  onCallEnd
}) => {
  const [vapi, setVapi] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Vapi || !apiKey) return;

    const vapiInstance = new Vapi(apiKey);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on('call-start', () => {
      console.log('🎤 VAPI: Call started');
      setIsConnected(true);
      setIsLoading(false);
      setError(null);
      onCallStart?.();
    });

    vapiInstance.on('call-end', () => {
      console.log('🎤 VAPI: Call ended');
      setIsConnected(false);
      setIsSpeaking(false);
      setIsLoading(false);
      onCallEnd?.();
    });

    vapiInstance.on('speech-start', () => {
      console.log('🎤 VAPI: Assistant started speaking');
      setIsSpeaking(true);
    });

    vapiInstance.on('speech-end', () => {
      console.log('🎤 VAPI: Assistant stopped speaking');
      setIsSpeaking(false);
    });

    vapiInstance.on('message', (message: any) => {
      if (message.type === 'transcript') {
        setTranscript(prev => [...prev, {
          role: message.role,
          text: message.transcript
        }]);
      }
    });

    vapiInstance.on('error', (error: any) => {
      console.error('🎤 VAPI Error:', error);
      setError(error.message || 'An error occurred during the call');
      setIsLoading(false);
      setIsConnected(false);
    });

    return () => {
      vapiInstance?.stop();
    };
  }, [apiKey, onCallStart, onCallEnd]);

  const startCall = async () => {
    if (!vapi || !assistantId) {
      setError('VAPI not initialized or assistant ID missing');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranscript([]);

    try {
      console.log('🎤 Starting VAPI call with assistant:', assistantId);
      await vapi.start(assistantId);
    } catch (error: any) {
      console.error('🎤 Failed to start call:', error);
      setError(error.message || 'Failed to start call');
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  if (!apiKey || !assistantId) {
    return (
      <div style={{
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        border: '2px dashed var(--border-color)',
        textAlign: 'center'
      }}>
        <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b', marginBottom: '0.5rem' }}></i>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          VAPI configuration missing. Check API key and assistant ID.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-exclamation-circle" style={{ color: '#dc2626' }}></i>
            <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</span>
          </div>
        </div>
      )}

      {!isConnected ? (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          {contactData && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                Practice Call with {contactData.name}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                {contactData.title} • Engagement Score: {contactData.score}
              </p>
            </div>
          )}
          
          <button
            onClick={startCall}
            disabled={isLoading}
            style={{
              background: isLoading ? 'var(--text-muted)' : '#12A594',
              color: '#fff',
              border: 'none',
              borderRadius: '50px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(18, 165, 148, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto'
            }}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Connecting...
              </>
            ) : (
              <>
                <i className="fas fa-phone"></i>
                Start Practice Call
              </>
            )}
          </button>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: isSpeaking ? '#ef4444' : '#12A594',
                animation: isSpeaking ? 'pulse 1s infinite' : 'none'
              }}></div>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {isSpeaking ? 'Assistant Speaking...' : 'Listening...'}
              </span>
            </div>
            <button
              onClick={endCall}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <i className="fas fa-phone-slash"></i>
              End Call
            </button>
          </div>
          
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            marginBottom: '12px',
            padding: '12px',
            background: 'var(--bg-primary)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            {transcript.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                Conversation will appear here...
              </p>
            ) : (
              transcript.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: '8px',
                    textAlign: msg.role === 'user' ? 'right' : 'left'
                  }}
                >
                  <span style={{
                    background: msg.role === 'user' ? '#12A594' : 'var(--text-muted)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    display: 'inline-block',
                    fontSize: '14px',
                    maxWidth: '80%',
                    wordWrap: 'break-word'
                  }}>
                    {msg.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VapiWidget;
