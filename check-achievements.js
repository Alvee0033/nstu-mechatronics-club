const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyC7x7_RZ6nC23tdf0GD5fgTVVbDxx7rVSOSovVAt_bfw7p2WaKlWLoBYOIO162qwfQTwvBaSPSgfi15ie8L1kOrRfIIhTMP4La5qjM-FA-dQ',
  authDomain: 'nstumechatronicsclub.firebaseapp.com',
  projectId: 'nstumechatronicsclub',
  storageBucket: 'nstumechatronicsclub.appspot.com',
  messagingSenderId: '823201944058',
  appId: '1:823201944058:web:df2e6c2c5d181c8cc39443'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAndAddAchievements() {
  try {
    const achievementsRef = collection(db, 'achievements');
    const snapshot = await getDocs(achievementsRef);
    console.log('Number of achievements:', snapshot.size);

    if (snapshot.size === 0) {
      console.log('No achievements found. Adding sample achievements...');

      const sampleAchievements = [
        {
          title: 'National Robotics Championship 2024',
          description: 'Won 1st place in the National Robotics Championship organized by Bangladesh University of Engineering and Technology (BUET)',
          date: Timestamp.fromDate(new Date('2024-03-15')),
          category: 'Competition',
          awardedBy: 'BUET',
          teamMembers: ['John Doe', 'Jane Smith', 'Mike Johnson']
        },
        {
          title: 'IEEE International Conference Award',
          description: 'Received Best Paper Award at IEEE International Conference on Robotics and Automation for our research on autonomous navigation systems',
          date: Timestamp.fromDate(new Date('2024-02-20')),
          category: 'International',
          awardedBy: 'IEEE',
          teamMembers: ['Sarah Wilson', 'David Brown']
        },
        {
          title: 'Bangladesh Innovation Award',
          description: 'Recognized for innovative mechatronics project in the annual Bangladesh Innovation Awards ceremony',
          date: Timestamp.fromDate(new Date('2024-01-10')),
          category: 'Award',
          awardedBy: 'Ministry of Science and Technology',
          teamMembers: ['Alex Chen', 'Lisa Park', 'Tom Wilson']
        },
        {
          title: 'Line Following Robot Competition',
          description: 'Secured 2nd position in the Inter-University Line Following Robot Competition with advanced PID control algorithms',
          date: Timestamp.fromDate(new Date('2023-12-05')),
          category: 'Competition',
          awardedBy: 'Dhaka University',
          teamMembers: ['Rahul Kumar', 'Priya Singh']
        }
      ];

      for (const achievement of sampleAchievements) {
        const docRef = await addDoc(achievementsRef, achievement);
        console.log('Added achievement:', docRef.id);
      }

      console.log('Sample achievements added successfully!');
    } else {
      console.log('Achievements already exist:');
      snapshot.forEach((doc) => {
        console.log('Achievement:', doc.id, doc.data());
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAndAddAchievements();