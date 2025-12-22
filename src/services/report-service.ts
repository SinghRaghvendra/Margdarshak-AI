

'use server';
/**
 * @fileOverview This file is DEPRECATED for client-side use.
 * Service functions for managing user reports are now split into
 * client-safe and server-only versions.
 */

import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';


// Defines the structure of the compressed user traits data
export interface CompressedTraits {
  s1: Record<string, number>;
  s2: Record<string, string>;
  s3: Record<string, string | number>;
  s4: Record<string, string | number>;
  s5: Record<string, string | number>;
  optional?: Record<string, number>;
}

export interface ReportData {
  userId: string;
  userName: string;
  careerName: string;
  reportMarkdown: string;
  language: string;
  paymentId?: string;
  generatedAt?: any;
  assessmentData: {
    userTraits: CompressedTraits;
    matchScore: string;
    personalityProfile: string;
  };
}

/**
 * @deprecated This function should not be used from the client.
 * Server-side logic now handles report saving.
 */
export async function saveReport(db: Firestore, reportData: ReportData): Promise<string> {
  throw new Error("saveReport is deprecated on the client. Use the API route for saving reports.");
}

/**
 * Fetches the latest report for a specific user, career, and language from Firestore.
 * This function is safe to call from the client as it only performs reads.
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
      return reportDoc.data() as ReportData;
    }

    return null;
  } catch (error) {
    console.error("Error fetching report from Firestore:", error);
    return null;
  }
}
