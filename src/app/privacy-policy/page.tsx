
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
            <div className="flex items-center gap-4">
                <ShieldCheck className="h-12 w-12 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
                    <CardDescription className="text-lg">
                        Last Updated: [Date]
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <h2>Introduction</h2>
          <p>
            Welcome to Margdarshak AI. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
          </p>
          
          <h2>Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect via the Application includes:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, contact number, country, and demographic information, such as your age, that you voluntarily give to us when you register with the Application.
            </li>
            <li>
              <strong>Assessment Data:</strong> Information you provide when completing the psychometric tests and answering personalized questions, including your answers, user traits, and career preferences.
            </li>
             <li>
              <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Application.
            </li>
          </ul>

          <h2>Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Generate personalized career reports and insights.</li>
            <li>Improve our application and services.</li>
            <li>Communicate with you regarding your account or reports.</li>
            <li>Comply with legal and regulatory requirements.</li>
          </ul>

           <h2>Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Email]
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
