import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FaMicrophone, FaPaperPlane } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdStop } from 'react-icons/md';

interface CursorChatInputProps {
  onSendMessage: (text: string) => void;
  onStopTask: () => void;
  onMicClick?: () => void;
  isRecording?: boolean;
  isProcessingSpeech?: boolean;
  disabled: boolean;
  showStopButton: boolean;
  isDarkMode?: boolean;
  placeholder?: string;
}

export default function CursorChatInput({
  onSendMessage,
  onStopTask,
  onMicClick,
  isRecording = false,
  isProcessingSpeech = false,
  disabled,
  showStopButton,
  isDarkMode = false,
  placeholder = "What can I help you with?",
}: CursorChatInputProps) {
  const [text, setText] = useState('');
  const isSendButtonDisabled = useMemo(() => disabled || text.trim() === '', [disabled, text]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle text changes and resize textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  // Initial resize when component mounts
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (text.trim()) {
        onSendMessage(text);
        setText('');
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    },
    [text, onSendMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-input ${
        disabled 
          ? 'cursor-not-allowed opacity-60' 
          : 'focus-within:border-blue-400 hover:border-blue-300 focus-within:shadow-lg'
      } ${
        isDarkMode 
          ? 'border-slate-600 bg-slate-800' 
          : 'border-gray-200 bg-white shadow-sm'
      }`}
      aria-label="Chat input form"
    >
      <div className="flex flex-col">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-disabled={disabled}
          rows={1}
          className={`w-full resize-none border-none p-4 focus:outline-none transition-colors ${
            disabled
              ? isDarkMode
                ? 'cursor-not-allowed bg-slate-800 text-gray-500'
                : 'cursor-not-allowed bg-gray-50 text-gray-400'
              : isDarkMode
                ? 'bg-slate-800 text-gray-100 placeholder-gray-400'
                : 'bg-white text-gray-900 placeholder-gray-500'
          }`}
          placeholder={placeholder}
          aria-label="Message input"
        />

        <div
          className={`flex items-center justify-between px-4 py-3 border-t ${
            isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-gray-50'
          }`}
        >
          <div className="flex gap-2">
            {onMicClick && (
              <button
                type="button"
                onClick={onMicClick}
                disabled={disabled || isProcessingSpeech}
                aria-label={
                  isProcessingSpeech ? 'Processing speech...' : isRecording ? 'Stop recording' : 'Start voice input'
                }
                className={`rounded-lg p-2 transition-all duration-200 cursor-button ${
                  disabled || isProcessingSpeech
                    ? 'cursor-not-allowed opacity-50'
                    : isRecording
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                      : isDarkMode
                        ? 'hover:bg-slate-700 text-gray-400 hover:text-gray-200'
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                {isProcessingSpeech ? (
                  <AiOutlineLoading3Quarters className="h-4 w-4 cursor-spinner" />
                ) : (
                  <FaMicrophone className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
                )}
              </button>
            )}
            
            <div className={`text-xs px-2 py-1 rounded-md ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {text.length > 0 && `${text.length} chars`}
            </div>
          </div>

          {showStopButton ? (
            <button
              type="button"
              onClick={onStopTask}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-all duration-200 hover:bg-red-600 cursor-button shadow-md"
            >
              <MdStop className="h-4 w-4" />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSendButtonDisabled}
              aria-disabled={isSendButtonDisabled}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-all duration-200 cursor-button ${
                isSendButtonDisabled
                  ? 'cursor-not-allowed opacity-50 bg-gray-400'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg'
              }`}
            >
              <FaPaperPlane className="h-3 w-3" />
              Send
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
