import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function SendMessage() {
  
    const { recipientId } = useParams();
    const [message, setMessage] = useState('');
    const [recipientInfo, setRecipientInfo] = useState({ firstName: '', lastName: '' });
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState('');
    const [isStatusVisible, setIsStatusVisible] = useState(false);
  
    useEffect(() => {
      console.log('Recipient ID:', recipientId); // Log recipientId to ensure it's correct
  
      const fetchRecipientInfo = async () => {
        try {
          const response = await fetch(`http://localhost:5002/api/user/${recipientId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch recipient information');
          }
  
          const data = await response.json();
          console.log('Fetched recipient data:', data); // Log fetched data
  
          setRecipientInfo({
            firstName: data.firstName,
            lastName: data.lastName,
          });
        } catch (error) {
          console.error('Error fetching recipient information:', error);
        }
      };
  
      fetchRecipientInfo();
    }, [recipientId]);
  
    const handleSendMessage = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId,
            UN_Message: message,
          }),
        });
  
        if (response.ok) {
          setStatusMessage('Message sent successfully');
          setStatusType('success');
          setIsStatusVisible(true);
        } else {
          setStatusMessage('Failure sending message.');
          setStatusType('failure');
          setIsStatusVisible(true);
        }
      } catch (error) {
        console.error('Failure sending message:', error);
        setStatusMessage('Failure sending message.');
        setStatusType('failure');
        setIsStatusVisible(true);
      }
    };
  
    return (
      <div className="form-container w-full p-6 space-y-6 text-cyan-950">
      <h2 className="text-2xl font-bold">Send Message</h2>
      <div
        id="status"
        className={`${isStatusVisible ? '' : 'hidden'} ${statusType === 'success' ? 'bg-green-100 text-green-700 p-2 rounded' : 'bg-red-100 text-red-700 p-2 rounded'}`}
      >
        {statusMessage}
      </div>
        <p className="nogap nomargin">Sending to: {recipientInfo.firstName} {recipientInfo.lastName}</p>
        <div className="form-group">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message here" className="sendmessage-textarea"></textarea>
        </div>
        <button onClick={handleSendMessage} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Send</button>

      </div>
    );
  }
  
  export default SendMessage;
