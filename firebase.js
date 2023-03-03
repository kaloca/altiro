const firebase = require("firebase/app"),
  { getDatabase, ref, set, child, get } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyCx8tdEP2p04zx1W66nzVVqYaFE5zzheHg",
  authDomain: "altiro-chat.firebaseapp.com",
  databaseURL: "https://altiro-chat-default-rtdb.firebaseio.com",
  projectId: "altiro-chat",
  storageBucket: "altiro-chat.appspot.com",
  messagingSenderId: "739951598398",
  appId: "1:739951598398:web:b85a6ed5439ce7c2d96a6f",
  measurementId: "G-Y1T81KX1J5",
};

const firebase_app = firebase.initializeApp(firebaseConfig);
const dbRef = ref(getDatabase(firebase_app));

const writePreviousMessage = async (phone_number, assistant, human) => {
  const db = getDatabase(firebase_app);
  await set(ref(db, "users/" + phone_number), {
    phone_number: phone_number,
    question: human,
    answer: assistant,
  });
};

const getPreviousMessage = async (from) =>
  await get(child(dbRef, `users/${from}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        let context = snapshot.val().answer;
        let question = snapshot.val().question;
        return {context, question};
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });

module.exports = { writePreviousMessage, getPreviousMessage }
