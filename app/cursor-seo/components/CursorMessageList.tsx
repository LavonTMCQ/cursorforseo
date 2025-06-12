import { memo } from 'react';

interface SEOMessage {
  actor: 'USER' | 'SYSTEM' | 'SEO_AGENT';
  content: string;
  timestamp: number;
}

interface CursorMessageListProps {
  messages: SEOMessage[];
  isDarkMode?: boolean;
}

// Actor profiles for our SEO-focused interface
const ACTOR_PROFILES = {
  USER: {
    name: 'You',
    icon: '👤',
    iconBackground: '#3b82f6',
    textColor: 'text-blue-600',
  },
  SEO_AGENT: {
    name: 'Cursor SEO Assistant',
    icon: '🤖',
    iconBackground: '#8b5cf6',
    textColor: 'text-purple-600',
  },
  SYSTEM: {
    name: 'System',
    icon: '⚙️',
    iconBackground: '#6b7280',
    textColor: 'text-gray-600',
  },
};

export default memo(function CursorMessageList({ messages, isDarkMode = false }: CursorMessageListProps) {
  return (
    <div className="max-w-full space-y-6">
      {messages.map((message, index) => (
        <MessageBlock
          key={`${message.actor}-${message.timestamp}-${index}`}
          message={message}
          isSameActor={index > 0 ? messages[index - 1].actor === message.actor : false}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
});

interface MessageBlockProps {
  message: SEOMessage;
  isSameActor: boolean;
  isDarkMode?: boolean;
}

function MessageBlock({ message, isSameActor, isDarkMode = false }: MessageBlockProps) {
  if (!message.actor) {
    console.error('No actor found');
    return <div />;
  }
  
  const actor = ACTOR_PROFILES[message.actor];
  const isProgress = message.content === 'Showing progress...';
  const isUser = message.actor === 'USER';

  return (
    <div
      className={`flex max-w-full gap-4 ${
        !isSameActor
          ? `mt-6 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-blue-100/50'} pt-6 first:mt-0 first:border-t-0 first:pt-0`
          : ''
      } ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isSameActor && (
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm ${
            isUser ? 'ml-2' : 'mr-2'
          }`}
          style={{ backgroundColor: actor.iconBackground }}
        >
          <span className="text-white text-lg">{actor.icon}</span>
        </div>
      )}
      {isSameActor && <div className="w-10" />}

      <div className={`min-w-0 flex-1 ${isUser ? 'text-right' : ''}`}>
        {!isSameActor && (
          <div className={`mb-2 text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} ${actor.textColor}`}>
            {actor.name}
          </div>
        )}

        <div className="space-y-1">
          <div
            className={`inline-block max-w-full rounded-2xl px-4 py-3 shadow-sm ${
              isUser
                ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white`
                : isDarkMode
                  ? 'bg-slate-800 text-gray-200 border border-slate-700'
                  : 'bg-white text-gray-800 border border-gray-200'
            }`}
          >
            {isProgress ? (
              <div className={`h-2 overflow-hidden rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="animate-progress h-full bg-gradient-to-r from-blue-500 to-purple-500" />
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {message.content}
              </div>
            )}
          </div>
          
          {!isProgress && (
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} ${isUser ? 'text-right' : 'text-left'}`}>
              {formatTimestamp(message.timestamp)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Formats a timestamp (in milliseconds) to a readable time string
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted time string
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  // Check if the message is from today
  const isToday = date.toDateString() === now.toDateString();

  // Check if the message is from yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  // Check if the message is from this year
  const isThisYear = date.getFullYear() === now.getFullYear();

  // Format the time (HH:MM)
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return timeStr; // Just show the time for today's messages
  }

  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }

  if (isThisYear) {
    // Show month and day for this year
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  }

  // Show full date for older messages
  return `${date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}, ${timeStr}`;
}
