import { db, storage } from './firebase.js';
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';  // Importiere notwendige Firestore-Methoden
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";

export const uploadImage = async (file) => {
    try {
        const storageRef = ref(storage, `products/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export const getProducts = async () => {
    try {
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return productList;
    } catch (error) {
        console.error('Fehler beim Abrufen der Produkte:', error);
        throw error;
    }
};

export const addProduct = async (product) => {
    try {
      const imageUrls = [];
  
      for (let file of product.imageFiles) {
        const imageUrl = await uploadImage(file);
        imageUrls.push(imageUrl);
      }
  
      const productData = {
        ...product,
        imageUrls: imageUrls
      };
      delete productData.imageFiles;
  
      const productsCollection = collection(db, 'products');
      const docRef = await addDoc(productsCollection, productData);
      return { id: docRef.id, ...productData };
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

export const deleteProduct = async (productId) => {
    try {
        const productRef = doc(db, 'products', productId);
        await deleteDoc(productRef);
    } catch (error) {
        console.error('Fehler beim Löschen des Produkts:', error);
        throw error;
    }
};

export const updateProductQuantity = async (id, quantityChange, action) => {
    try {
        const productRef = doc(db, 'products', id);
        const productSnapshot = await getDoc(productRef);

        const currentQuantity = productSnapshot.data().quantity;
        let newQuantity;

        if (action === 'subtract') {
            newQuantity = currentQuantity - quantityChange;
        } else if (action === 'add') {
            newQuantity = currentQuantity + quantityChange;
        } else {
            throw new Error(`Invalid action: ${action}. Use 'add' or 'subtract'.`);
        }
        await updateDoc(productRef, { quantity: newQuantity });
                return true; 
    } catch (error) {
        console.error('Error updating product quantity:', error);
        throw error;
    }
};

export const updateProductData = async (productId, updatedProduct) => {
    try {
        const productRef = doc(db, 'products', productId);
        const productData = { ...updatedProduct };

        if (updatedProduct.imageFiles && updatedProduct.imageFiles.length > 0) {
            const imageUrls = [];

            for (let file of updatedProduct.imageFiles) {
                const imageUrl = await uploadImage(file);
                imageUrls.push(imageUrl);
            }

            productData.imageUrls = imageUrls;
        }

        delete productData.imageFiles;
        
        await updateDoc(productRef, productData);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Produkts:', error);
        throw error;
    }
};

export const getOrders = async () => {
    try {
        const ordersCollection = collection(db, 'orders');
        const orderSnapshot = await getDocs(ordersCollection);
        const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return orderList;
    } catch (error) {
        console.error('Fehler beim Abrufen der Bestellungen:', error);
        throw error;
    }
};

export const getOrderById = async (orderId) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
            return { id: orderSnap.id, ...orderSnap.data() };
        } else {
            console.error('No such order!');
            return null;
        }
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};

export const addOrder = async (order) => {
    try {
        const ordersCollection = collection(db, 'orders');
        const docRef = await addDoc(ordersCollection, order);
        await updateDoc(doc(db, 'orders', docRef.id), { id: docRef.id });
        for (let item of order.items) {
            await updateProductQuantity(item.productId, item.quantity, 'subtract');
        }
        return { id: docRef.id, ...order };
    } catch (error) {
        console.error('Error adding the order:', error);
        throw error;
    }
};



export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { orderStatus: newStatus });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Bestellstatus:', error);
        throw error;
    }
};

export const updateOrderPayment = async (orderId, paymentStatus) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { paymentStatus: paymentStatus });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Zahlungsstatus:', error);
        throw error;
    }
};


export const getPromoCodes = async () => {
    try {
        const promoCodesCollection = collection(db, 'promocodes');
        const promoCodesSnapshot = await getDocs(promoCodesCollection);
        const promoCodes = promoCodesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return promoCodes;
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        throw error;
    }
};

export const validateAdminPassword = async (email, password) => {
    const auth = getAuth();
    try {
        // Versuche, den Benutzer mit der eingegebenen E-Mail und dem Passwort anzumelden
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Wenn die Anmeldung erfolgreich war, gib true zurück
        return true;
    } catch (error) {
        console.error('Error validating user credentials:', error);
        // Wenn der Benutzer nicht existiert oder die Anmeldedaten falsch sind, gib false zurück
        return false;
    }
};

export const getCategories = async () => {
    try {
        const products = await getProducts();
        const categories = [...new Set(products.map(product => product.category))];
        return categories;
    } catch (error) {
        console.error('Fehler beim Abrufen der Kategorien:', error);
        throw error;
    }
};
