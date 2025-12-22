
import { FieldValue } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';

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
 * Saves a new report to the generatedReports collection in Firestore using the Admin SDK.
 * @param db The Firestore admin instance.
 * @param reportData The data for the report to be saved.
 * @returns The ID of the newly created report document.
 */
export async function saveReport(db: Firestore, reportData: Omit<ReportData, 'generatedAt'>): Promise<string> {
  try {
    const reportsCollection = db.collection('generatedReports');
    const docRef = await reportsCollection.add({
      ...reportData,
      generatedAt: FieldValue.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving report to Firestore (Admin):", error);
    throw new Error("Could not save the report to the database.");
  }
}
