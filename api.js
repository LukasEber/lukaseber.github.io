import { getAuth } from 'https://www.gstatic.com/firebasejs/9.20.0//firebase-auth.js';
import { collection, getDocs, getDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { db } from './firebase.js';

export function checkAuthStatus(callback) {
    const auth = getAuth();
    auth.onAuthStateChanged((user) => {
        console.log(user);
        callback(user);
    });
}

export async function checkIfAdmin() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        return false;
    }

    try {
        const adminDocRef = doc(db, 'AdminUsers', user.uid);
        const adminDoc = await getDoc(adminDocRef);
        return adminDoc.exists();
    } catch (error) {
        return false;
    }
}

export async function getUserProjects() {
    const isAdmin = await checkIfAdmin();

    try {
        let projects = [];
        const projectsRef = collection(db, 'DemoProjectAccesses');

        if (isAdmin) {
            const querySnapshot = await getDocs(projectsRef);
            querySnapshot.forEach((doc) => {
                projects.push(doc.data());
            });
        } else {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                return { error: 'not-authenticated' };
            }

            const q = query(
                projectsRef, 
                where('ClientUid', '==', user.uid), 
                where('CanAccess', '==', true)
            );
            
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                projects.push(doc.data());
            });
        }

        return projects;
    } catch (error) {
        return { error: 'fetch-failed' };
    }
}