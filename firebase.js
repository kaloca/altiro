const firebase = require("firebase/app"),
  { getDatabase, ref, set, child, get, update, increment } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyActIEMW0zaUrxpEYe0Ij5kGt8NAfEBL6U",
  authDomain: "altiro-chat.firebaseapp.com",
  databaseURL: "https://altiro-chat-default-rtdb.firebaseio.com",
  projectId: "altiro-chat",
  storageBucket: "altiro-chat.appspot.com",
  messagingSenderId: "739951598398",
  appId: "1:739951598398:web:41738ba6d21f7015d96a6f",
  measurementId: "G-4RLNJF1YDN",
};


const firebase_app = firebase.initializeApp(firebaseConfig);
const dbRef = ref(getDatabase(firebase_app));

const writePreviousMessage = async (phone_number, assistant, human, name) => {
  const now = new Date();
  const db = getDatabase(firebase_app);
  await set(ref(db, "users/" + phone_number), {
    phone_number: phone_number,
    question: human,
    answer: assistant,
    name: name,
  });
  await set(ref(db, "daily_message_count/" + `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`), {
    value: increment(1)
  });
};

const getPreviousMessage = async (from, previous_message) =>
  await get(child(dbRef, `users/${from}`))
    .then(async (snapshot) => {
      if (snapshot.exists()) {
        previous_message.context = snapshot.val().answer;
        previous_message.question = snapshot.val().question;
        //return { context, question };
      } else {
        await update(child(dbRef, 'user_count'), {
          value: increment(1)
      });
      }
    })
    .catch((error) => {
      console.error(error);
    });

module.exports = { writePreviousMessage, getPreviousMessage };
