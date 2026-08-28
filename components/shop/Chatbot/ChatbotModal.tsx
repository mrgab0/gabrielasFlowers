"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, RefreshCw, PhoneCall, ExternalLink, Bot } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  "🌸 Ver arreglos de cumpleaños",
  "🌹 Ramos de rosas románticos",
  "🚚 ¿Cómo funciona el delivery en Houston?",
  "💍 Arreglos para aniversarios"
];

export const ChatbotModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      role: "model",
      text: "¡Hola! 🌸 Soy **Gabriela**, tu asesora floral virtual de *Gabriela's Flowers* en Houston, Texas.\n\n¿Buscas un arreglo especial para un cumpleaños, aniversario, o deseas conocer nuestras opciones de delivery hoy?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Filtrar el historial para la API
      const apiHistory = newMessages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiHistory })
      });

      if (!res.ok) throw new Error("Error en la respuesta");
      const data = await res.json();

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.text || "Disculpa, no pude procesar tu solicitud. Por favor intenta nuevamente.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "🌸 Hubo un pequeño inconveniente de conexión. Puedes escribirnos directo a nuestro WhatsApp [+1 832 391-1835](https://wa.me/18323911835) para asistirte de inmediato.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "model",
        text: "¡Hola de nuevo! 🌸 ¿En qué arreglo floral o consulta te puedo ayudar en este momento?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Renderizar enlaces markdown [Texto](URL) y negritas **texto**
  const renderFormattedText = (text: string) => {
    // Reemplazo básico de links en markdown: [label](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const [, label, url] = match;
      parts.push(
        url.startsWith('/') ? (
          <Link
            key={match.index}
            href={url}
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-1 font-bold text-[#8B0024] dark:text-pink-300 underline hover:text-[#5a0014] bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded transition-colors my-0.5"
          >
            {label} <ExternalLink size={12} />
          </Link>
        ) : (
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#25D366] underline hover:text-[#1da851] bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded transition-colors my-0.5"
          >
            {label} <ExternalLink size={12} />
          </a>
        )
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      {/* Botón Flotante del Chatbot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir Asistente Floral IA"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-[#8B0024] to-[#a81436] hover:from-[#70001d] hover:to-[#8B0024] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-[0px_10px_25px_rgba(139,0,36,0.4)] border-2 border-[#D4AF37]/80 hover:scale-105 active:scale-95 transition-all duration-300 group`}
      >
        <div className="relative">
          <Sparkles size={20} className="text-[#D4AF37] animate-spin-slow" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4AF37]"></span>
          </span>
        </div>
        <div className="hidden sm:flex flex-col items-start text-left leading-tight">
          <span className="text-[9px] uppercase font-black tracking-widest text-[#D4AF37]">Asesora Floral IA</span>
          <span className="text-xs font-bold">Chatear con Gabriela</span>
        </div>
      </button>

      {/* Ventana Modal del Chatbot */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[540px] max-h-[82vh] bg-white dark:bg-[#12131a] rounded-2xl shadow-[0px_15px_40px_rgba(0,0,0,0.3)] border border-[#D4AF37]/40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header del Chatbot */}
          <div className="bg-gradient-to-r from-[#2a0002] via-[#8B0024] to-[#2a0002] text-white px-4 py-3.5 flex items-center justify-between border-b border-[#D4AF37]/40">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="Gabriela's Flowers"
                  className="w-9 h-9 rounded-full object-cover border border-[#D4AF37]"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#2a0002]"></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">Gabriela</span>
                  <span className="text-[10px] bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/40 px-1.5 py-0.2 rounded font-semibold">IA</span>
                </div>
                <span className="text-[11px] text-pink-200/90 font-medium">Asesora Floral • En línea 🌸</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reiniciar chat"
                className="p-1.5 hover:bg-white/10 rounded-lg text-pink-200 hover:text-white transition-colors"
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Cerrar chat"
                className="p-1.5 hover:bg-white/10 rounded-lg text-pink-200 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#fffaf9] dark:bg-[#0d0e14] text-sm leading-relaxed">
            
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm whitespace-pre-line shadow-sm ${
                      isUser
                        ? 'bg-[#8B0024] text-white rounded-br-none'
                        : 'bg-white dark:bg-[#1a1b24] text-gray-800 dark:text-gray-100 border border-gray-200/80 dark:border-gray-800 rounded-bl-none'
                    }`}
                  >
                    {renderFormattedText(m.text)}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              );
            })}

            {/* Animación de escribiendo... */}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1a1b24] w-fit px-3.5 py-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <span className="w-1.5 h-1.5 bg-[#8B0024] dark:bg-pink-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#8B0024] dark:bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-[#8B0024] dark:bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-[11px] font-medium">Gabriela está escribiendo...</span>
              </div>
            )}

            {/* Preguntas Rápidas sugeridas si es el inicio */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Preguntas sugeridas:
                </span>
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left text-xs bg-white dark:bg-[#181922] hover:bg-[#fff0ef] dark:hover:bg-pink-950/40 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 px-3 py-2 rounded-xl transition-all font-medium hover:border-[#8B0024]/40 flex items-center justify-between group shadow-sm"
                  >
                    <span>{q}</span>
                    <span className="text-[#8B0024] dark:text-pink-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer e Input de Mensaje */}
          <div className="p-3 bg-white dark:bg-[#12131a] border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu consulta o arreglo deseado..."
                disabled={isLoading}
                className="flex-1 text-xs sm:text-sm bg-gray-50 dark:bg-[#1c1d28] text-gray-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-[#8B0024] dark:focus:border-pink-400 transition-colors placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Enviar mensaje"
                className="bg-[#8B0024] hover:bg-[#70001d] disabled:opacity-50 text-white p-2.5 rounded-xl transition-all flex items-center justify-center shadow-md hover:scale-105 active:scale-95 disabled:hover:scale-100"
              >
                <Send size={16} />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 px-1 pt-0.5">
              <span className="flex items-center gap-1">
                <Sparkles size={11} className="text-[#D4AF37]" />
                Potenciado por Gemini Flash
              </span>
              <a
                href="https://wa.me/18323911835"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:underline flex items-center gap-1 font-semibold"
              >
                <PhoneCall size={11} /> WhatsApp
              </a>
            </div>

          </div>

        </div>
      )}
    </>
  );
};
