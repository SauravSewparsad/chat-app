import { useState, useEffect } from 'react';
import './App.css';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { getFirestore, onSnapshot, collection, addDoc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { auth, app } from '../firebase';

const db = getFirestore(app);

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyToMessageId, setReplyToMessageId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      })));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  const sendMessage = async () => {
    const messageData = {
      uid: user.uid,
      photoURL: user.photoURL,
      displayName: user.displayName,
      text: newMessage,
      timestamp: serverTimestamp()
    };

    // If replying to a message, add a replyTo field
    if (replyToMessageId) {
      messageData.replyTo = replyToMessageId;
    }

    await addDoc(collection(db, 'messages'), messageData);

    setNewMessage('');
    setReplyToMessageId(null);
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.log(error);
    }
  };

  const handleReply = (messageId) => {
    setReplyToMessageId(messageId);
    const userName = messages.find(msg => msg.id === messageId).data.displayName;
    setNewMessage(`@${userName}: `);
  };

  return (
    <div className='flex justify-center bg-gray-800 py-10 min-h-screen'>
      {user ? (
        <div>
          <div>Logged in as {user.displayName}</div>
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button className='bg-white rounded-[10px] hover:bg-blue-400 p-3' onClick={sendMessage}>Send Message</button>
          <button className='mb-8 bg-white rounded-[10px] p-3' onClick={() => auth.signOut()}>Logout</button>

          <div className="flex flex-col gap-5">
            {messages.map(msg => (
              <div key={msg.id} className={`message flex ${msg.data.uid === user.uid ? 'justify-end' : 'justify-start'}`}>
                <div className={`message flex flex-row p-3 gap-3 rounded-[20px] items-center ${msg.data.uid === user.uid ? 'current' : 'other'}`}>
                  <img className='w-10 h-10 rounded-full' src={msg.data.photoURL} />
                  <div>
                    <div>{msg.data.text}</div>
                    {/*Line 91 - 96 is the code that is causing the message to disappear.*/}
                    {/*{msg.data.replyTo && (
                      <div className="reply">
                        <span>Replying to:</span>
                        <div>{messages.find(m => m.id === msg.data.replyTo).data.displayName}</div>
                      </div>
                    )}*/}
                    <button onClick={() => handleReply(msg.id)}>Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) :
        <button onClick={handleGoogleLogin}>Login with Google</button>
      }
    </div>
  );
}

export default App


