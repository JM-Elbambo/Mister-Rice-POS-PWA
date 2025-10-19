import {
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase.js";

export class BaseCollection {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.query = null;
    this.data = [];
    this.loading = false;
    this.error = null;
    this.subscribers = new Set();
    this.unsubscribe = null;
  }

  // Fetch data once
  async fetch() {
    if (this.loading) return this.data;

    this.loading = true;
    this.error = null;
    this.notify();

    try {
      const target = this.query ?? collection(db, this.collectionName);
      const snapshot = await getDocs(target);

      const rawData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.processData(rawData);

      this.error = null;
    } catch (error) {
      console.error(`Error fetching ${this.collectionName}:`, error);
      this.error = error;
    } finally {
      this.loading = false;
      this.notify();
    }

    return this.data;
  }

  // Override in child class for custom sorting/processing
  processData(rawData) {
    this.data = rawData;
  }

  // Setup real-time listener
  listen() {
    if (this.unsubscribe) return; // Already listening

    const target = this.query ?? collection(db, this.collectionName);

    this.unsubscribe = onSnapshot(
      target,
      (snapshot) => {
        const rawData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.processData(rawData);
        this.loading = false;
        this.error = null;
        this.notify();
      },
      (error) => {
        console.error(`${this.collectionName} listener error:`, error);
        this.error = error;
        this.notify();
      },
    );
  }

  // Subscribe to data changes
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify subscribers
  notify() {
    this.subscribers.forEach((callback) =>
      callback(this.data, this.loading, this.error),
    );
  }

  // Add document
  async add(data) {
    const docRef = await addDoc(collection(db, this.collectionName), data);
    return { id: docRef.id, ...data };
  }

  // Update document
  async update(id, updates) {
    await updateDoc(doc(db, this.collectionName, id), updates);
  }

  // Delete document
  async delete(id) {
    await deleteDoc(doc(db, this.collectionName, id));
  }

  // Stop listening
  stopListening() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // Cleanup
  cleanup() {
    this.stopListening();
    this.subscribers.clear();
  }
}
