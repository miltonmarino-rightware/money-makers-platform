import { useState, useCallback, useEffect } from 'react';
import { chatService } from '@/services/supabase-services';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatMessage, ChatSession } from '@/types/database';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// System prompt — personalidade Money Makers
const MONEY_MAKERS_SYSTEM = `És o assistente de IA da Money Makers, uma academia de trading forex liderada por Owen de Jesus.

O teu nome é MM AI. Fala sempre em português de Moçambique/Portugal.
Tens profundo conhecimento em:
- Trading Forex (análise técnica e fundamental)
- Gestão de risco e psicologia de trading
- Pares de divisas (EUR/USD, GBP/USD, XAU/USD, etc.)
- Estratégias de entrada e saída
- Journaling de trades

Regras:
- Sê direto, profissional mas acessível
- Dá exemplos práticos quando possível
- Nunca dás garantias de lucro
- Encoraja disciplina e gestão de risco
- Se não souberes algo, diz honestamente
- Refere o mentor Owen quando relevante para cursos ou mentoria`;

export const useGeminiChat = (sessionId: string | null) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limitar free members a 3 msgs/dia
  const canSendMessage = useCallback((): boolean => {
    if (!profile) return false;
    if (profile.ai_subscription || profile.role === 'admin') return true;
    if (profile.role === 'paid') return true;
    // free: verificar limite
    return profile.ai_credits_used < profile.ai_credits_limit;
  }, [profile]);

  const loadMessages = useCallback(async () => {
    if (!sessionId) return;
    try {
      const msgs = await chatService.getMessages(sessionId);
      setMessages(msgs);
    } catch (e: any) {
      setError('Erro ao carregar mensagens');
    }
  }, [sessionId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId || !content.trim()) return;
    if (!canSendMessage()) {
      setError('Limite de mensagens atingido. Faz upgrade para continuar.');
      return;
    }

    setError(null);
    setLoading(true);

    // Guarda mensagem do user imediatamente
    const userMsg = await chatService.saveMessage(sessionId, 'user', content.trim());
    setMessages(prev => [...prev, userMsg]);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Gemini API key não configurada');

      // Construir histórico para a API
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: MONEY_MAKERS_SYSTEM }] },
          contents: [
            ...history,
            { role: 'user', parts: [{ text: content.trim() }] },
          ],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message ?? 'Erro na API Gemini');
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sem resposta';
      const tokensUsed = data.usageMetadata?.totalTokenCount ?? 0;

      // Guarda resposta do assistente
      const assistantMsg = await chatService.saveMessage(sessionId, 'assistant', reply, tokensUsed);
      setMessages(prev => [...prev, assistantMsg]);

      // Incrementar créditos usados (para free members)
      if (profile?.role === 'free' && !profile.ai_subscription) {
        await chatService.incrementAiCredits(1); // conta por mensagem
      }
    } catch (e: any) {
      setError(e.message ?? 'Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  }, [sessionId, messages, canSendMessage, profile]);

  return { messages, loading, error, sendMessage, canSendMessage, loadMessages };
};

// Hook para gerir sessões
export const useChatSessions = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await chatService.getSessions();
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        setCurrentSessionId(data[0].id);
      }
    } catch (e) {
      console.error('Erro ao carregar sessões');
    } finally {
      setSessionsLoading(false);
    }
  }, [currentSessionId]);

  const createSession = useCallback(async () => {
    const session = await chatService.createSession(`Chat ${new Date().toLocaleDateString('pt')}`);
    setSessions(prev => [session, ...prev]);
    setCurrentSessionId(session.id);
    return session;
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    await chatService.deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(sessions.find(s => s.id !== id)?.id ?? null);
    }
  }, [currentSessionId, sessions]);

  useEffect(() => {
    loadSessions();
  }, []);

  return {
    sessions, currentSessionId, sessionsLoading,
    setCurrentSessionId, createSession, deleteSession, loadSessions,
  };
};
