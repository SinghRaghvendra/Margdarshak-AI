
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
                        Last Updated: July 2025
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>
            AI Councel Lab ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI Councel application (the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
          </p>
          
          <h2>1. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect via the Service includes:</p>
          <ul>
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and contact number, that you voluntarily give to us when you register with the Service.</li>
            <li><strong>Demographic Information:</strong> Information such as your country, preferences, and interests that you voluntarily provide.</li>
            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Service, such as your psychometric test answers and AI-generated reports, which are stored to provide the service and for internal analysis.</li>
          </ul>

          <h2>2. Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Generate personalized career reports and guidance.</li>
            <li>Improve our products, services, and operations.</li>
            <li>Periodically send you promotional emails about new products, special offers, or other information we think you may find interesting.</li>
            <li>Contact you for market research purposes, with your consent.</li>
            <li>Customize the application according to your interests.</li>
            <li>Maintain internal records.</li>
          </ul>

          <h2>3. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2>4. Cookies and Tracking Technologies</h2>
          <p>
            We may use cookies and other tracking technologies on the Service to help customize the Service and improve your experience. When you access the Service, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the Service.
          </p>
          
          <h2>5. Your Data Protection Rights</h2>
          <p>You may choose to restrict the collection or use of your personal information. You have the following data protection rights:</p>
          <ul>
            <li><strong>The right to access, update or to delete the information we have on you.</strong></li>
            <li><strong>The right to object to our processing of your personal information for direct marketing purposes.</strong> If you have previously agreed to us using your personal information for direct marketing, you may change your mind at any time by contacting us.</li>
            <li><strong>The right to data portability.</strong></li>
          </ul>
          <p>
            We will not sell, distribute, or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you believe that any information we are holding on you is incorrect or incomplete, or if you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:hello@aicouncel.com">hello@aicouncel.com</a>. We will promptly correct any information found to be incorrect.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
