
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CircleDollarSign } from 'lucide-react';

export default function CancellationAndRefundPage() {
  return (
    <div className="py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
            <div className="flex items-center gap-4">
                <CircleDollarSign className="h-12 w-12 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold">Cancellation & Refund Policy</CardTitle>
                    <CardDescription className="text-lg">
                        Last Updated: [Date]
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <h2>1. Service Scope</h2>
          <p>
            Our service involves the generation of personalized digital reports based on user input. Due to the digital nature of our product and the instantaneous delivery upon payment, our refund policy is designed accordingly.
          </p>
          
          <h2>2. Cancellation</h2>
          <p>
            Once a payment has been successfully made and the report generation process has been initiated, the service cannot be canceled. This is because the process involves automated, irreversible costs related to the use of AI models and computational resources.
          </p>
          
          <h2>3. Refund Policy</h2>
          <p>
            <strong>We do not offer refunds once a report has been successfully generated and made available to you.</strong>
          </p>
          <p>
            A refund may be considered only in the following exceptional circumstances:
          </p>
          <ul>
            <li>
              <strong>Technical Failure:</strong> If you made a successful payment but did not receive your report due to a verifiable technical failure on our end, and we are unable to provide the report to you within a reasonable timeframe (e.g., 48 hours).
            </li>
            <li>
              <strong>Duplicate Payment:</strong> If you were charged multiple times for the same service due to a technical error.
            </li>
          </ul>

          <h2>4. How to Request a Refund</h2>
          <p>
            If you believe you are eligible for a refund based on the criteria above, please contact our support team at [Your Contact Email] within 7 days of the transaction. You must provide your payment receipt and a detailed explanation of the issue.
          </p>

           <h2>5. Our Discretion</h2>
          <p>
            All refund requests will be reviewed on a case-by-case basis. Margdarshak AI reserves the right to deny any refund request that does not meet the eligibility criteria outlined in this policy.
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
