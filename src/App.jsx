import { useState } from 'react';
import axios from 'axios';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';


function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: 'Hello! How can I assist you today?',
      sender: 'gemini',
      direction: 'incoming'
      
    },
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: 'user',
      direction:'outgoing'
      
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);
    await generateAnswer(message);
  };

  async function generateAnswer(userMessage) {
    setTyping(true); 
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: userMessage },
              ],
            },
          ],
        }
      );

      console.log("API Response:", response.data);
      if (response.data && response.data.candidates && response.data.candidates.length > 0) {
        const aiMessage = response.data.candidates[0].content.parts[0].text; 
        setMessages((prevMessages) => [
          ...prevMessages,
          { message: aiMessage, sender: "gemini", direction: "incoming" } 
        ]);
      } else {
        console.error("No valid response from the API");
      }
    } catch (error) {
      console.error("Error generating AI response:", error.response ? error.response.data : error.message);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="chatpage-div">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList typingIndicator={typing ? <TypingIndicator content="typing..." /> : null}>
              {messages.map((msg, index) => (
                <Message 
                  key={index} 
                  model={{ 
                    message: msg.message,
                    sender: msg.sender,
                    direction: msg.direction
                  }} 
                  
                />
              ))}
            </MessageList>
            <MessageInput
              placeholder="Type your message here"
              onSend={handleSend}
              />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
