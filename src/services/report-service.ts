
'use server';
/**
 * @fileOverview Service functions for managing user reports in Firestore.
 */

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit, orderBy } from 'firebase/firestore';

export interface ReportData {
  userId: string;
  userName: string;
  careerName: string;
  reportMarkdown: string;
  language: string;
  generatedAt?: any; // Firestore timestamp will be handled here
  assessmentData: {
    userTraits: string;
    matchScore: string;
    personalityProfile: string;
  };
}

const reportsCollection = collection(db, 'generatedReports');

/**
 * Saves a new report to the generatedReports collection in Firestore.
 * @param reportData The data for the report to be saved.
 * @returns The ID of the newly created report document.
 */
export async function saveReport(reportData: ReportData): Promise<string> {
  try {
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
 * @param userId The ID of the user.
 * @param careerName The name of the career.
 * @param language The language of the report.
 * @returns The report data if found, otherwise null.
 */
export async function getLatestReport(userId: string, careerName: string, language: string): Promise<ReportData | null> {
  try {
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
    throw new Error("Could not retrieve the report from the database.");
  }
}
