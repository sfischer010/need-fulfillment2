/*
import React, { useEffect, useState } from 'react';

function Messages({ userId }) {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setReplyMessage(''); // Reset reply message when selecting a new message
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyMessage,
          replyTo: selectedMessage.M_MessageID,
          userId,
        }),
      });

      if (response.ok) {
        // Optionally, fetch messages again to update the list
        const updatedMessages = await response.json();
        setMessages(updatedMessages);
        setReplyMessage(''); // Clear the reply message input
      } else {
        console.error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="messages-container flex w-full p-6 space-x-6 text-cyan-950">
      <div className="messages-list w-1/3 space-y-2">
        <h2 className="text-2xl font-bold">Messages</h2>
        {messages.length === 0 ? (
          <div>No messages found.</div>
        ) : (
          <ul>
            {messages.map((message, index) => (
              <li 
                key={message.M_MessageID} 
                className={`message-item p-2 mb-2 cursor-pointer hover:bg-gray-200 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}`}
                onClick={() => handleSelectMessage(message)}
              >
                <p><strong>{message.sendername}</strong></p>
                <p>{new Date(message.un_date).toLocaleString()}</p>
                <p>{message.un_message.substring(0, 30)}...</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="message-view w-2/3 p-4 bg-white rounded shadow">
        {selectedMessage ? (
          <div>
            <div className="mb-2">
              <span className="font-bold">Message From:</span> {selectedMessage.sendername}
            </div>
            <div className="mb-2">
              <span className="font-bold">Date:</span> {new Date(selectedMessage.un_date).toLocaleString()}
            </div>
            <div className="mb-4">
              <span className="font-bold">Message:</span>
              <p className="mt-2">{selectedMessage.un_message}</p>
            </div>
            <div className="reply-section mt-4">
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
                placeholder="Type your reply here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              ></textarea>
              <button 
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                onClick={handleReply}
              >
                Reply
              </button>
            </div>
          </div>
        ) : (
          <div>Select a message to view</div>
        )}
      </div>
    </div>
  );
}

export default Messages;
*/

/*
import React, { useEffect, useState } from 'react';

function Messages({ userId }) {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        console.log(data); // Debug log to check the received data
        // Separate main messages and replies
        const mainMessages = data.filter(message => message.un_isparent);
        setMessages(mainMessages);
        setReplies(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setReplyMessage(''); // Reset reply message when selecting a new message
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyMessage,
          replyTo: selectedMessage.M_MessageID,
          userId,
        }),
      });

      if (response.ok) {
        // Optionally, fetch messages again to update the list
        const updatedMessages = await response.json();
        const mainMessages = updatedMessages.filter(message => message.un_isparent);
        setMessages(mainMessages);
        setReplies(updatedMessages);
        setReplyMessage(''); // Clear the reply message input
      } else {
        console.error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const renderMessages = () => {
    if (loading) {
      return <div>Loading messages...</div>;
    }

    if (error) {
      return <div>{error}</div>;
    }

    return (
      <div className="messages-container flex w-full p-6 space-x-6 text-cyan-950">
        <div className="messages-list w-1/3 space-y-2">
          <h2 className="text-2xl font-bold">Messages</h2>
          {messages.length === 0 ? (
            <div>No messages found.</div>
          ) : (
            <ul>
              {messages.map((message, index) => (
                <li 
                  key={message.m_messageID} 
                  className={`message-item p-2 mb-2 cursor-pointer hover:bg-gray-200 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}`}
                  onClick={() => handleSelectMessage(message)}
                >
                  <p><strong>{message.sendername}</strong></p>
                  <p>{new Date(message.un_date).toLocaleString()}</p>
                  <p>{message.un_message.substring(0, 30)}...</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="message-view w-2/3 p-4 bg-white rounded shadow">
          {selectedMessage ? (
            <div>
              <div className="mb-2">
                <span className="font-bold">Message From:</span> {selectedMessage.sendername}
              </div>
              <div className="mb-2">
                <span className="font-bold">Date:</span> {new Date(selectedMessage.un_date).toLocaleString()}
              </div>
              <div className="mb-4">
                <span className="font-bold">Message:</span>
                <p className="mt-2">{selectedMessage.un_message}</p>
              </div>
              <div className="reply-section mt-4">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                  placeholder="Type your reply here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                ></textarea>
                <button 
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                  onClick={handleReply}
                >
                  Reply
                </button>
              </div>
              <div className="replies mt-4">
                <h3 className="text-xl font-bold">Replies</h3>
                {replies
                  .filter(reply => reply.un_replyto === selectedMessage.m_messageid)
                  .map(reply => (
                    <div key={reply.m_messageid} className="reply-item ml-4 p-2 border-t border-gray-300">
                      <p><strong>{reply.sendername}</strong></p>
                      <p>{new Date(reply.un_date).toLocaleString()}</p>
                      <p>{reply.un_message}</p>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div>Select a message to view</div>
          )}
        </div>
      </div>
    );
  };

  return renderMessages();
}

export default Messages;
*/
import React, { useEffect, useState } from 'react';

function Messages({ userId }) {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        console.log(data); // Debug log to check the received data
        // Separate main messages and replies
        const mainMessages = data.filter(message => message.un_isparent);
        setMessages(mainMessages);
        setReplies(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setReplyMessage(''); // Reset reply message when selecting a new message
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyMessage,
          replyTo: selectedMessage.m_messageid,
          userId,
        }),
      });

      if (response.ok) {
        // Optionally, fetch messages again to update the list
        const updatedMessages = await response.json();
        const mainMessages = updatedMessages.filter(message => message.un_isparent);
        setMessages(mainMessages);
        setReplies(updatedMessages);
        setReplyMessage(''); // Clear the reply message input
      } else {
        console.error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const renderMessages = () => {
    if (loading) {
      return <div>Loading messages...</div>;
    }

    if (error) {
      return <div>{error}</div>;
    }

    return (
      <div className="messages-container flex w-full p-6 space-x-6 text-cyan-950">
        <div className="messages-list w-1/3 space-y-2">
          <h2 className="text-2xl font-bold">Messages</h2>
          {messages.length === 0 ? (
            <div>No messages found.</div>
          ) : (
            <ul>
              {messages.map((message, index) => (
                <li 
                  key={message.m_messageID} 
                  className={`message-item p-2 mb-2 cursor-pointer hover:bg-gray-200 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}`}
                  onClick={() => handleSelectMessage(message)}
                >
                  <p><strong>{message.sendername}</strong></p>
                  <p>{new Date(message.un_date).toLocaleString()}</p>
                  <p>{message.un_message.substring(0, 30)}...</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="message-view w-2/3 p-4 bg-white rounded shadow">
          {selectedMessage ? (
            <div>
              <div className="mb-2">
                <span className="font-bold">Message From:</span> {selectedMessage.sendername}
              </div>
              <div className="mb-2">
                <span className="font-bold">Date:</span> {new Date(selectedMessage.un_date).toLocaleString()}
              </div>
              <div className="mb-4">
                <span className="font-bold">Message:</span>
                <p className="mt-2">{selectedMessage.un_message}</p>
              </div>
              <div className="reply-section mt-4">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                  placeholder="Type your reply here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                ></textarea>
                <button 
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                  onClick={handleReply}
                >
                  Reply
                </button>
              </div>
              {replies.some(reply => reply.un_replyto === selectedMessage.m_messageid) && (
                <div className="replies mt-4">
                  <h3 className="text-xl font-bold">Replies</h3>
                  {replies
                    .filter(reply => reply.un_replyto === selectedMessage.m_messageid)
                    .map(reply => (
                      <div key={reply.m_messageid} className="reply-item ml-4 p-2 border-t border-gray-300">
                        <p><strong>{reply.sendername}</strong></p>
                        <p>{new Date(reply.un_date).toLocaleString()}</p>
                        <p>{reply.un_message}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div>Select a message to view</div>
          )}
        </div>
      </div>
    );
  };

  return renderMessages();
}

export default Messages;
