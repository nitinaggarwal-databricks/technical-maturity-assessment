import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiMinimize2 } from 'react-icons/fi';
import chatService from '../services/chatService';

const ChatButton = styled(motion.button)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
  }
`;

const ChatContainer = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 9999;
  overflow: hidden;

  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    height: calc(100vh - 140px);
    bottom: 20px;
    right: 20px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
`;

const ChatSubtitle = styled.p`
  font-size: 0.85rem;
  margin: 4px 0 0 0;
  opacity: 0.9;
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`;

const Message = styled(motion.div)`
  display: flex;
  justify-content: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: ${props => props.$isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background: ${props => props.$isUser ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    'white'
  };
  color: ${props => props.$isUser ? 'white' : '#1e293b'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  line-height: 1.5;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ChatInput = styled.form`
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #667eea;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: fit-content;
`;

const Dot = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

const WelcomeIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
`;

const WelcomeText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
`;

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const sessionId = localStorage.getItem('sessionId') || 'anonymous';
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userEmail = user?.email || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(
        userMessage,
        conversationId,
        sessionId,
        userEmail
      );

      // Update conversation ID if new
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }

      // Add AI response to UI
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
      setIsTyping(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <ChatButton
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiMessageCircle size={28} />
          </ChatButton>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <ChatContainer
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <ChatHeader>
              <div>
                <ChatTitle>Maturity Assistant</ChatTitle>
                <ChatSubtitle>Ask me anything about the assessment</ChatSubtitle>
              </div>
              <HeaderButtons>
                <IconButton onClick={handleMinimize} title="Minimize">
                  <FiMinimize2 size={16} />
                </IconButton>
                <IconButton onClick={handleClose} title="Close">
                  <FiX size={18} />
                </IconButton>
              </HeaderButtons>
            </ChatHeader>

            <ChatMessages>
              {messages.length === 0 ? (
                <WelcomeMessage>
                  <WelcomeIcon>👋</WelcomeIcon>
                  <WelcomeText>
                    Hi! I'm your Databricks Maturity Assessment assistant. 
                    Ask me anything about getting started, understanding pillars, 
                    or navigating the assessment!
                  </WelcomeText>
                </WelcomeMessage>
              ) : (
                messages.map((msg, index) => (
                  <Message 
                    key={index} 
                    $isUser={msg.role === 'user'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MessageBubble $isUser={msg.role === 'user'}>
                      {msg.content}
                    </MessageBubble>
                  </Message>
                ))
              )}

              {isTyping && (
                <Message $isUser={false}>
                  <TypingIndicator>
                    <Dot
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    />
                    <Dot
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    />
                    <Dot
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    />
                  </TypingIndicator>
                </Message>
              )}

              <div ref={messagesEndRef} />
            </ChatMessages>

            <ChatInput onSubmit={handleSendMessage}>
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={isTyping}
              />
              <SendButton type="submit" disabled={!inputValue.trim() || isTyping}>
                <FiSend size={18} />
              </SendButton>
            </ChatInput>
          </ChatContainer>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;

