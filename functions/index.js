//const functions = require("firebase-functions");
const { initializeApp, getApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");
const {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    setDoc,
    connectFirestoreEmulator,
    getFirestore
    
    } = require ("firebase/firestore");
const fetch = require("node-fetch");
const dotenv= require("dotenv");
dotenv.config();

const {getFunctions, connectFunctionsEmulator } = require('firebase/functions')

const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};
//const app = initializeApp(config);
const db = getFirestore();
const usersCollectionRef = collection(db, "users");
const storage = getStorage();
const functions = getFunctions(getApp());
connectFirestoreEmulator(db, 'localhost', 8081);
connectFunctionsEmulator(functions, "localhost", 5001);
connectStorageEmulator(storage, "localhost", 9199);

exports.generateCache = functions.region("asia-southeast1").storage.object().onFinalize(async (object) => {
    
    // ...
    let objectName = object.name;
    let arrObj = objectName.split("/");
    let adsId = arrObj[0];
    let dateString = arrObj[1].replace(".json", "");
    let dateArr = dateString.split("_");
    let [yearVal, monthVal, dayVal, hourVal, minuteVal ] = dateArr;
    let dynamicDateString = yearVal + "_" + monthVal + "_" + dayVal + "_" + hourVal + "_";
    //console.log(dateString);
    // let yearVal = dateArr[0];
    // let monthVal = dateArr[1];
    // let dayVal = dateArr[2];
    // let hourVal = dateArr[3];
    // let minuteVal = dateArr[4];
    //console.log(adsId, dateArr[dateArr.length-1]);
    //object.name = test-5555-test-5555/2022_0_17_12_22.json
    //let stopsAt = "59";
    if (minuteVal === "08"){
        
        let countData = 0;
        let sumData = 0;
        for (let i = 0; i <= 59; i++){
            let linkString = "https://firebasestorage.googleapis.com/v0/b/nuads-1.appspot.com/o/" + 
            adsId + "%2F" + 
            dynamicDateString + i + ".json?alt=media&token="+ 
            object.metadata.firebaseStorageDownloadTokens;
            let log = await fetch(linkString)
            .then( async (res)=> {
                let storageData = await res.json();
                storageData.forEach((eachRes)=> {
                    sumData += eachRes.count;
                    countData += 1
                });
            });
        }
        monthVal += 1
        let string1 = yearVal + "-" + monthVal + "-" + dayVal + "-" + hourVal;
        let averageCollectionRef = doc(db, adsId, string1);
        await setDoc(averageCollectionRef, {
            average : (sumData/countData),
        });
    }

    //addDoc(usersCollectionRef, object);
});





// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
