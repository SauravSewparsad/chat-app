import { useState, useEffect, useRef } from 'react';
import './App.css';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { getFirestore, onSnapshot, collection, addDoc, orderBy, query, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { auth, app } from '../firebase';
import '@fortawesome/fontawesome-free/css/all.css';


const db = getFirestore(app);

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyToMessageId, setReplyToMessageId] = useState(null);
  const [moreOptionsMessageId, setMoreOptionsMessageId] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false); // State to track input focus
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return; // Don't send empty messages

    const messageData = {
      uid: user.uid,
      photoURL: user.photoURL,
      displayName: user.displayName,
      text: newMessage,
      timestamp: serverTimestamp()
    };

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

  const handleMoreOptions = (messageId) => {
    setMoreOptionsMessageId(moreOptionsMessageId === messageId ? null : messageId);
  };

  const handleDelete = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  {/*-----------------------------------------------------------Chat app display-----------------------------------------------------------*/}
  return (
    <div>
      {user ? (
        <div>
          <div className="header">

            {/*Display the user that is logged in*/}
            <div className='user_name'>{user.displayName}</div>

            {/*Logout button that will log the user out of the account*/}
            <button onClick={() => auth.signOut()}>Logout</button>
          </div>

{/*--------------------------------------------------------------Messages-----------------------------------------------------------*/}
          <div className='Message-area'>
            {messages.map(msg => (
             <div key={msg.id}className={`message flex ${msg.data.uid === user.uid ? 'justify-end' : 'justify-start'}`}>
             <div className="more-options" onClick={() => handleMoreOptions(msg.id)}>
               &#8942;
               {moreOptionsMessageId === msg.id && (
                 <div className="options-menu">
                   {user.uid === msg.data.uid ? (
                     <>
                       <div onClick={() => handleReply(msg.id)}>Reply</div>
                       <div onClick={() => handleDelete(msg.id)}>Delete</div>
                     </>
                   ) : (
                     <div onClick={() => handleReply(msg.id)}>Reply</div>
                   )}
                 </div>
               )}
             </div>
             <div className={`message ${msg.data.uid === user.uid ? 'current' : 'other'}`}>
               <div>
                 <strong>{msg.data.displayName}</strong>
               </div>
               <img src={msg.data.photoURL} /> 
               {msg.data.text}
               <div style={{ textAlign: 'right' }}>
                 <div className="timestamp">
                   <span className = "date">
                    {new Date(msg.data.timestamp?.toDate()).toLocaleDateString()}
                   </span>
                   &nbsp;
                   <span className="time">
                   {new Date(msg.data.timestamp?.toDate()).toLocaleTimeString()}
                  </span>
                 </div>
               </div>
             </div>
           </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
{/*---------------------------------------------------------Message box-----------------------------------------------------------------*/}
          <div className="footer">
            <input
             value={newMessage}
             onChange={e => setNewMessage(e.target.value)}
             onFocus={() => setIsInputFocused(true)}
             onBlur={() => setIsInputFocused(false)}
             style={{ backgroundColor: isInputFocused ? 'white' : '' }}
             placeholder='Type your message....'
            />
            <button onClick={sendMessage}>Send Message</button>
          </div>
        </div>
      ) :
      ( <div> 
        <i className="fas fa-key fa-6x" style={{ marginLeft: '150px', color: "black"}}>
          </i> <h1 style={{ marginLeft: '-15px', color: "black"}}>Chat Application</h1>
          <button onClick={handleGoogleLogin} style={{ marginLeft: '90px' }}>Login with Google</button>
      </div>       
    )}
    </div>
  );
}

export default App;
