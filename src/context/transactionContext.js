// src/context/transactionContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/libs/firebase.config";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";

// Create the context
const TransactionContext = createContext(null); // Initialize with null

// Provider component
export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch transactions from Firestore
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const transactionsRef = collection(db, "transactions");
      const q = query(transactionsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const transactionData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to JS Date for display
        date: doc.data().date?.toDate?.() 
          ? doc.data().date.toDate().toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      }));
      
      setTransactions(transactionData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add transaction to Firestore
  const addTransaction = async (transaction) => {
    try {
      // Convert date string to Firestore timestamp
      const formattedTransaction = {
        ...transaction,
        amount: Number(transaction.amount), // Ensure amount is a number
        createdAt: serverTimestamp(),
        // Convert string date to Firestore timestamp
        date: new Date(transaction.date)
      };

      const docRef = await addDoc(collection(db, "transactions"), formattedTransaction);
      
      // Add the new transaction to the state with the Firestore ID
      const newTransaction = {
        id: docRef.id,
        ...transaction,
      };
      
      setTransactions([newTransaction, ...transactions]);
      return newTransaction;
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  };

  // Initialize - fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const contextValue = {
    transactions,
    addTransaction,
    loading,
    refreshTransactions: fetchTransactions
  };

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
}

// Custom hook for using the transaction context
export function useTransactions() {
  const context = useContext(TransactionContext);
  
  if (context === undefined || context === null) {
    console.error("useTransactions must be used within a TransactionProvider");
  }
  
  return context;
}