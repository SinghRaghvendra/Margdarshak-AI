
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
            <div className="flex items-center gap-4">
                <FileText className="h-12 w-12 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold">Terms & Conditions</CardTitle>
                    <CardDescription className="text-lg">
                        Last Updated: [Date]
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <h2>1. Agreement to Terms</h2>
          <p>
            By using our application, Margdarshak AI, you agree to be bound by these Terms and Conditions. If you do not agree, do not use the application.
          </p>
          
          <h2>2. Service Description</h2>
          <p>
            Our application provides AI-powered career guidance, including psychometric assessments, career suggestions, and detailed reports. The information provided is for guidance purposes only and should not be considered as professional financial, legal, or psychological advice.
          </p>
          
          <h2>3. User Accounts</h2>
          <p>
            You are responsible for safeguarding your account and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
          </p>

          <h2>4. Payments</h2>
          <p>
            We offer paid services, such as detailed career reports. All payments are handled through a third-party payment processor. By making a purchase, you agree to their terms and conditions.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            The Application and its original content, features, and functionality are and will remain the exclusive property of AI Councel Lab and its licensors.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            In no event shall Margdarshak AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at: [Your Contact Email]
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
