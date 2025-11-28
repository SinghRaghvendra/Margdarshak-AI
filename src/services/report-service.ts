
'use server';
/**
 * @fileOverview Service functions for managing user reports in Firestore.
 */

import { collection, query, where, getDocs, addDoc, serverTimestamp, limit, orderBy } from 'firebase/firestore';
// This file CANNOT be a server component if it's used by client components
// and relies on a client-side context hook like useFirebase.
// For this architecture to work, you'd need to pass the `db` instance from
// the component to these functions.

import type { Firestore } from 'firebase/firestore';

// Defines the structure of the compressed user traits data
export interface CompressedTraits {
  s1: Record<string, number>; // Personality & Temperament
  s2: Record<string, string>; // Interests & Enjoyment
  s3: Record<string, string | number>; // Motivation & Values
  s4: Record<string, string | number>; // Cognitive Style
  s5: Record<string, string | number>; // Social Style
  optional?: Record<string, number>; // Optional ratings
}

export interface ReportData {
  userId: string;
  userName: string;
  careerName: string;
  reportMarkdown: string;
  language: string;
  paymentId?: string; // Add the payment ID for auditing
  generatedAt?: any; // Firestore timestamp will be handled here
  assessmentData: {
    userTraits: CompressedTraits; // Using the new structured type
    matchScore: string;
    personalityProfile: string;
  };
}

/**
 * Saves a new report to the generatedReports collection in Firestore.
 * @param db The Firestore instance.
 * @param reportData The data for the report to be saved.
 * @returns The ID of the newly created report document.
 */
export async function saveReport(db: Firestore, reportData: ReportData): Promise<string> {
  try {
    const reportsCollection = collection(db, 'generatedReports');
    const docRef = await addDoc(reportsCollection, {
      ...reportData,
      generatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving report to Firestore:", error);
    throw new Error("Could not save the report to the database.");
  }
}

/**
 * Fetches the latest report for a specific user, career, and language from Firestore.
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @param careerName The name of the career.
 * @param language The language of the report.
 * @returns The report data if found, otherwise null.
 */
export async function getLatestReport(db: Firestore, userId: string, careerName: string, language: string): Promise<ReportData | null> {
  try {
    const reportsCollection = collection(db, 'generatedReports');
    const q = query(
      reportsCollection,
      where('userId', '==', userId),
      where('careerName', '==', careerName),
      where('language', '==', language),
      orderBy('generatedAt', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const reportDoc = querySnapshot.docs[0];
      // Note: Timestamps will be objects. They are handled by the client.
      return reportDoc.data() as ReportData;
    }

    return null;
  } catch (error) {
    console.error("Error fetching report from Firestore:", error);
    // Returning null instead of throwing an error allows the app to try generating a new report.
    return null;
  }
}
