
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
                        Our policy regarding order management and refunds.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="prose max-w-none">
            <p>
                AI Councel Lab believes in helping its customers as far as possible and has therefore a liberal policy regarding order management. Under this policy, cancellations will be considered only for specific services and within a set timeframe.
            </p>

            <h2>Cancellations</h2>
            <ul>
                <li>
                    <strong>Report Generation:</strong> Orders for report generation <strong>cannot be canceled</strong>. This process involves the immediate consumption of computational resources, and as such, all sales are final.
                </li>
                <li>
                    <strong>Other Services:</strong> Cancellations for services other than report generation will be considered only if the request is made within <strong>3-5 days</strong> of placing the order. However, cancellation requests may not be entertained if the services have already been initiated or communicated to vendors.
                </li>
            </ul>

            <h2>Refunds & Replacements</h2>
            <p>
                Due to the nature of our digital services, our refund policy is designed to align with the consumption of global, non-recoverable resources.
            </p>
            <ul>
                <li>
                    <strong>Report Generation:</strong> The amount paid for report generation is <strong>non-refundable</strong>. This is due to the immediate and irreversible consumption of chargeable resources once the generation process begins.
                </li>
                <li>
                    <strong>Counseling Services:</strong> For any services related to counseling, a <strong>50% refund</strong> may be issued if the cancellation is approved.
                </li>
                <li>
                    <strong>Damaged or Defective Products:</strong> In case of damaged or defective items, please report the issue to our Customer Service team within <strong>3-5 days</strong> of receipt. The request will be processed after the merchant has checked and verified the claim.
                </li>
                <li>
                    <strong>Product Discrepancies:</strong> If you feel that the product received is not as shown on the site or is not as per your expectations, you must notify our customer service within <strong>3-5 days</strong> of receiving the product. The Customer Service Team will review your complaint and make an appropriate decision.
                </li>
                <li>
                    <strong>Third-Party Warranties:</strong> In the case of products that come with a warranty from manufacturers, please refer the issue directly to them.
                </li>
            </ul>

            <h2>General Policy</h2>
            <p>
                For any inquiries or concerns, please reach out to us through the email or WhatsApp contact information provided in our "Contact Us" section.
            </p>

        </CardContent>
      </Card>
    </div>
  );
}
