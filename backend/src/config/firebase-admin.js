const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const initializeFirebaseAdmin = async () => {
  if (!admin.apps.length) {
    try {
      const config = {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://agro-intel-default-rtdb.firebaseio.com'
      };

      admin.initializeApp(config);
      console.log('Firebase Admin initialized successfully');

      // Verify database connection
      const db = admin.database();
      try {
        await db.ref('.info/connected').once('value');
        console.log('Successfully connected to Firebase Realtime Database');
      } catch (error) {
        console.error('Database connection error:', error);
      }

    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      throw error;
    }
  }
};

module.exports = { 
  initializeFirebaseAdmin,
  admin 
}; 