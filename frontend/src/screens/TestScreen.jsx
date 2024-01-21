//
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
const socket = io.connect('http://localhost:5000');

function TestScreen() {
  const [message, setMessage] = useState('');
  const [messageReceived, setMessageReceived] = useState('');

  function sendMessage() {
    console.log('Button clicked');
    socket.emit('send_message', { message: message });
  }

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessageReceived(data.message);
    });
  }, [socket]);

  console.log(messageReceived);
  
  return (
    <div className="App">
      <input
        placeholder="Message"
        onChange={(e) => {
          setMessage(e.target.value);
        }}
      />
      <button onClick={sendMessage}>Send message</button>
      <h1>Message: {messageReceived === '' ? message : messageReceived}</h1>
    </div>
  );
}

export default TestScreen;
