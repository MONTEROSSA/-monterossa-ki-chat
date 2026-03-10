'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Mic, 
  MicOff, 
  X, 
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  Phone,
  Image as ImageIcon,
  Film,
  FileText,
  Play,
  Square,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  rating?: number;
  attachments?: Attachment[];
  isVoiceMessage?: boolean;
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
}

interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  mimeType: string;
}

interface Settings {
  welcomeMessage: string;
  companyName: string;
  primaryColor: string;
  transferEnabled: boolean;
  transferPhone?: string;
}

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function EmbedChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [handoffReason, setHandoffReason] = useState('');
  const [handoffSubmitted, setHandoffSubmitted] = useState(false);
  const [handoffForm, setHandoffForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    voiceNoteUrl: ''
  });
  
  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceNoteUploaded, setVoiceNoteUploaded] = useState(false);
  
  // File attachment state
  const [pendingFiles, setPendingFiles] = useState<Attachment[]>([]);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    fetchSettings();
    initSpeechRecognition();
    
    // Close upload menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(e.target as Node)) {
        setShowUploadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        if (data.data.welcomeMessage && messages.length === 0) {
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: data.data.welcomeMessage,
            timestamp: new Date()
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.lang = 'de-CH';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice note recording functions
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      
      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordingTime(0);
      setRecordedBlob(null);
      setVoiceNoteUploaded(false);
      
      // Update recording time
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch {
      alert('Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff auf Ihr Mikrofon.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
    setRecordedBlob(null);
    setRecordingTime(0);
    setVoiceNoteUploaded(false);
  };

  const uploadVoiceNote = async (): Promise<string | null> => {
    if (!recordedBlob) return null;
    
    const formData = new FormData();
    formData.append('file', recordedBlob, 'voice-note.webm');
    formData.append('type', 'voice');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setVoiceNoteUploaded(true);
        return data.data.url;
      }
    } catch {
      console.error('Failed to upload voice note');
    }
    return null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Text-to-speech input
  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.onstart = () => setIsRecording(true);
      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(prev => prev + transcript);
      };
      recognitionRef.current.start();
    }
  };

  // Get file type from mime type
  const getFileType = (mimeType: string): Attachment['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  // File attachment handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'attachment');

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          const attachment: Attachment = {
            name: file.name,
            url: data.data.url,
            type: getFileType(file.type),
            mimeType: file.type
          };
          setPendingFiles(prev => [...prev, attachment]);
        }
      } catch {
        console.error('Failed to upload file:', file.name);
      }
    }
    e.target.value = '';
    setShowUploadMenu(false);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Send message
  const sendMessage = async (voiceNoteUrl?: string) => {
    const content = input.trim();
    if (!content && pendingFiles.length === 0 && !voiceNoteUrl) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: new Date(),
      attachments: pendingFiles.length > 0 ? pendingFiles : undefined,
      isVoiceMessage: !!voiceNoteUrl,
      voiceNoteUrl,
      voiceNoteDuration: voiceNoteUrl ? recordingTime : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setPendingFiles([]);
    setRecordedBlob(null);
    setRecordingTime(0);
    setVoiceNoteUploaded(false);
    setIsLoading(true);

    try {
      const apiMessages = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      // Build message content with attachments info
      let messageContent = content;
      if (pendingFiles.length > 0) {
        const attachmentInfo = pendingFiles.map(f => `[${f.type}: ${f.name}]`).join(' ');
        messageContent = content ? `${content}\n${attachmentInfo}` : attachmentInfo;
      }
      if (voiceNoteUrl) {
        messageContent = content ? `${content}\n[Sprachnachricht: ${formatTime(recordingTime)}]` : `[Sprachnachricht: ${formatTime(recordingTime)}]`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...apiMessages, { role: 'user', content: messageContent }],
          sessionId,
          attachments: pendingFiles,
          voiceNoteUrl
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Es tut mir leid, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send voice message
  const sendVoiceMessage = async () => {
    const url = await uploadVoiceNote();
    if (url) {
      await sendMessage(url);
    }
  };

  // Rate message
  const rateMessage = async (messageId: string, rating: number) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, rating } : m
    ));

    if (rating <= 2 && settings?.transferEnabled) {
      setTimeout(() => setShowHandoffModal(true), 500);
    }

    try {
      await fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, rating, sessionId })
      });
    } catch {
      console.error('Failed to save rating');
    }
  };

  // Submit handoff request
  const submitHandoff = async () => {
    try {
      await fetch('/api/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          reason: handoffReason,
          ...handoffForm
        })
      });
      setHandoffSubmitted(true);
    } catch {
      console.error('Failed to submit handoff');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const closeChat = () => {
    window.parent.postMessage('monterossa-chat-close', '*');
  };

  // Render attachment preview
  const renderAttachmentPreview = (attachment: Attachment, showRemove = false, index = 0) => {
    return (
      <div key={index} className="relative group">
        {attachment.type === 'image' && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
            <img 
              src={attachment.url} 
              alt={attachment.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
        {attachment.type === 'video' && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
            <Film className="w-8 h-8 text-[#f97316]" />
            <span className="absolute bottom-1 left-1 text-[10px] text-white/70 truncate max-w-[72px]">
              {attachment.name}
            </span>
          </div>
        )}
        {attachment.type === 'document' && (
          <div className="w-20 h-20 rounded-lg border border-white/10 bg-white/5 flex flex-col items-center justify-center p-1">
            <FileText className="w-8 h-8 text-[#22d3bb]" />
            <span className="text-[10px] text-white/70 truncate max-w-full mt-1">
              {attachment.name}
            </span>
          </div>
        )}
        {showRemove && (
          <button
            onClick={() => removePendingFile(index)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  // Render message attachment
  const renderMessageAttachment = (attachment: Attachment, index: number) => {
    if (attachment.type === 'image') {
      return (
        <a 
          key={index}
          href={attachment.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block mt-2"
        >
          <img 
            src={attachment.url} 
            alt={attachment.name}
            className="max-w-[200px] rounded-lg border border-white/10"
          />
        </a>
      );
    }
    if (attachment.type === 'video') {
      return (
        <video 
          key={index}
          src={attachment.url} 
          controls
          className="max-w-[200px] rounded-lg mt-2"
        />
      );
    }
    return (
      <a
        key={index}
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 mt-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
      >
        {attachment.type === 'document' ? (
          <FileText className="w-4 h-4 text-[#22d3bb]" />
        ) : (
          <Film className="w-4 h-4 text-[#f97316]" />
        )}
        <span className="truncate max-w-[150px]">{attachment.name}</span>
      </a>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a1628] text-white overflow-hidden">
      {/* Header */}
      <div className="relative px-4 py-3 flex items-center gap-3 border-b border-white/10 bg-[#0f2035] shrink-0">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22d3bb] to-[#f97316]" />
        
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#22d3bb]/20 to-[#22d3bb]/5 border border-[#22d3bb]/30">
          <Sparkles className="w-5 h-5 text-[#22d3bb]" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-sm text-white flex items-center gap-2">
            KI-Chat Agent
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22d3bb] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22d3bb]"></span>
            </span>
          </h2>
          <p className="text-[#22d3bb]/70 text-xs">Powered by {settings?.companyName || 'Monterossa AG'}</p>
        </div>
        <button
          onClick={closeChat}
          className="text-white/60 hover:text-white hover:bg-white/10 h-9 w-9 rounded-lg flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Input Mode Hints - Visual indicators for capabilities */}
      <div className="px-4 py-2 bg-[#0f2035]/50 border-b border-white/5">
        <div className="flex items-center justify-center gap-4 text-xs text-white/50">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22d3bb]"></div>
            <span>Text</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f97316]"></div>
            <span>Sprachnachricht</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <span>Dateien</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#22d3bb] to-[#1aa395] text-white'
                    : 'bg-white/5 border border-white/10 text-[#22d3bb]'
                }`}
              >
                {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`rounded-2xl px-3 py-2 max-w-[85%] text-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#22d3bb] to-[#1aa395] text-white rounded-tr-sm'
                    : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                }`}
              >
                {/* Voice message indicator */}
                {message.isVoiceMessage && (
                  <div className="flex items-center gap-2 mb-1 text-white/80 text-xs">
                    <Mic className="w-3 h-3" />
                    <span>Sprachnachricht</span>
                    {message.voiceNoteDuration && (
                      <span className="text-white/60">({formatTime(message.voiceNoteDuration)})</span>
                    )}
                  </div>
                )}
                
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                
                {/* Render attachments */}
                {message.attachments && message.attachments.map((att, i) => 
                  renderMessageAttachment(att, i)
                )}
              </div>
            </div>
            
            {/* Rating buttons for assistant messages */}
            {message.role === 'assistant' && message.id !== 'welcome' && (
              <div className={`flex items-center gap-2 mt-2 ml-11`}>
                <span className="text-xs text-white/30">War das hilfreich?</span>
                <button
                  onClick={() => rateMessage(message.id, message.rating === 5 ? 0 : 5)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    message.rating === 5 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'text-white/30 hover:text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => rateMessage(message.id, message.rating === 1 ? 0 : 1)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    message.rating === 1 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'text-white/30 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-[#22d3bb]">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#22d3bb]" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Pending Files Preview */}
      {pendingFiles.length > 0 && (
        <div className="px-4 py-2 border-t border-white/5 bg-[#0f2035]/50">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {pendingFiles.map((file, i) => renderAttachmentPreview(file, true, i))}
          </div>
        </div>
      )}

      {/* Voice Recording UI */}
      {isRecordingVoice && (
        <div className="px-4 py-3 border-t border-white/10 bg-red-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                <Mic className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Sprachnachricht wird aufgenommen...</p>
                <p className="text-xs text-white/60">{formatTime(recordingTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={cancelVoiceRecording}
                className="px-3 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 text-sm"
              >
                Abbrechen
              </button>
              <button
                onClick={stopVoiceRecording}
                className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stoppen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Note Ready to Send */}
      {recordedBlob && !isRecordingVoice && (
        <div className="px-4 py-3 border-t border-white/10 bg-[#22d3bb]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#22d3bb]/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#22d3bb]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Sprachnachricht bereit</p>
                <p className="text-xs text-white/60">Dauer: {formatTime(recordingTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={cancelVoiceRecording}
                className="px-3 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 text-sm"
              >
                Löschen
              </button>
              <button
                onClick={sendVoiceMessage}
                className="px-3 py-2 rounded-lg bg-[#22d3bb] text-white hover:bg-[#22d3bb]/90 text-sm flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Senden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      {!isRecordingVoice && !recordedBlob && (
        <div className="p-3 border-t border-white/10 bg-[#0f2035] shrink-0">
          <div className="flex gap-2 items-center">
            {/* File attachment menu */}
            <div ref={uploadMenuRef} className="relative">
              <input 
                ref={fileInputRef} 
                type="file" 
                onChange={handleFileSelect} 
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 rounded-xl shrink-0 flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-[#22d3bb] hover:bg-white/10 transition-all"
                title="Datei anhängen (Bilder, Videos, Dokumente)"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>

            {/* Voice note button - Prominent */}
            <button
              onClick={startVoiceRecording}
              className="h-10 px-4 rounded-xl shrink-0 flex items-center justify-center gap-2 bg-[#f97316]/20 border border-[#f97316]/30 text-[#f97316] hover:bg-[#f97316]/30 transition-all"
              title="Sprachnachricht aufnehmen (wie Telefonbeantworter)"
            >
              <Mic className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">Sprachnachricht</span>
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ihre Nachricht eingeben..."
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/40 bg-white/5 border border-white/10 focus:outline-none focus:border-[#22d3bb]/50 disabled:opacity-50 transition-all"
              />
            </div>
            
            {/* Voice-to-text input */}
            {speechSupported && (
              <button
                onClick={toggleRecording}
                className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-[#22d3bb] hover:bg-white/10'
                }`}
                title="Spracheingabe (Diktat)"
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            
            {/* Send */}
            <button
              onClick={() => sendMessage()}
              disabled={(!input.trim() && pendingFiles.length === 0) || isLoading}
              className="h-10 w-10 rounded-xl shrink-0 bg-gradient-to-r from-[#22d3bb] to-[#1aa395] text-white flex items-center justify-center disabled:opacity-50 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-white/30">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Bilder
            </span>
            <span className="flex items-center gap-1">
              <Film className="w-3 h-3" /> Videos
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" /> Dokumente
            </span>
            <span className="flex items-center gap-1">
              <Mic className="w-3 h-3" /> Sprachnachricht
            </span>
          </div>
        </div>
      )}

      {/* Handoff Modal */}
      {showHandoffModal && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0f2035] border border-white/10 rounded-2xl w-full max-w-md p-6 my-4">
            {handoffSubmitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Vielen Dank!</h3>
                <p className="text-white/60 mb-4">
                  Ein Mitarbeiter wird sich umgehend bei Ihnen melden.
                </p>
                <button
                  onClick={() => { setShowHandoffModal(false); setHandoffSubmitted(false); }}
                  className="px-6 py-3 bg-[#22d3bb] text-white rounded-xl font-medium"
                >
                  Schliessen
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f97316]/20 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-[#f97316]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Mit Mitarbeiter sprechen</h3>
                    <p className="text-sm text-white/50">Wir helfen Ihnen persönlich weiter</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Name (optional)</label>
                    <input
                      type="text"
                      value={handoffForm.name}
                      onChange={(e) => setHandoffForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-white/60 mb-1">E-Mail</label>
                      <input
                        type="email"
                        value={handoffForm.email}
                        onChange={(e) => setHandoffForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Telefon</label>
                      <input
                        type="tel"
                        value={handoffForm.phone}
                        onChange={(e) => setHandoffForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Ihre Nachricht</label>
                    <textarea
                      value={handoffForm.message}
                      onChange={(e) => setHandoffForm(f => ({ ...f, message: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50 resize-none"
                      placeholder="Wie können wir Ihnen helfen?"
                    />
                  </div>

                  {/* Voice note option */}
                  <div className="border-t border-white/10 pt-4">
                    <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                      <Mic className="w-4 h-4 text-[#f97316]" />
                      Oder Sprachnachricht hinterlassen (Telefonbeantworter):
                    </label>
                    
                    {handoffForm.voiceNoteUrl ? (
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Sprachnachricht angehängt
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {isRecordingVoice ? (
                          <>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/50">
                              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                              Aufnahme: {formatTime(recordingTime)}
                            </div>
                            <button
                              onClick={stopVoiceRecording}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl"
                            >
                              Stop
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={startVoiceRecording}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                            >
                              <Mic className="w-4 h-4" />
                              Aufnehmen
                            </button>
                            {recordedBlob && (
                              <button
                                onClick={async () => {
                                  const url = await uploadVoiceNote();
                                  if (url) {
                                    setHandoffForm(prev => ({ ...prev, voiceNoteUrl: url }));
                                  }
                                }}
                                className="px-4 py-2 bg-[#22d3bb]/20 text-[#22d3bb] rounded-xl"
                              >
                                Anhängen ({formatTime(recordingTime)})
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowHandoffModal(false)}
                    className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={submitHandoff}
                    className="flex-1 px-4 py-3 bg-[#f97316] text-white rounded-xl font-medium"
                  >
                    Anfrage senden
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
