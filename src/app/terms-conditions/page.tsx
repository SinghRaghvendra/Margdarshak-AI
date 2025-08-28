
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
                        Please read these terms and conditions carefully before using our service.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <h2>1. Introduction</h2>
          <p>
            For the purpose of these Terms and Conditions, the term "we", "us", or "our" shall refer to AI Councel Lab. The terms "you", “your”, "user", or “visitor” shall refer to any natural or legal person visiting our website and/or agreeing to purchase from us. Your use of the website and/or purchase from us are governed by the following Terms and Conditions.
          </p>
          
          <h2>2. Use of Website & Services</h2>
          <ul>
            <li>The content of the pages of this website is for your general information and use only. It is subject to change without notice.</li>
            <li>Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness, or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors, and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.</li>
            <li>Your use of any information or materials on our website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services, or information available through this website meet your specific requirements.</li>
          </ul>

          <h2>3. Intellectual Property</h2>
           <ul>
            <li>Our website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance, and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.</li>
            <li>All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.</li>
           </ul>
          
          <h2>4. User Conduct</h2>
           <ul>
            <li>Unauthorized use of the information provided by us may give rise to a claim for damages and/or be a criminal offense.</li>
            <li>You may not create a link to our website from another website or document without AI Councel Lab’s prior written consent.</li>
           </ul>

          <h2>5. Third-Party Links</h2>
          <p>
            From time to time, our website may also include links to other websites. These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s).
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
             We shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any transaction, on account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.
          </p>

          <h2>7. Governing Law & Jurisdiction</h2>
          <p>
            Any dispute arising out of the use of our website, any purchase made with us, or any engagement with us is subject to the laws of India.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
