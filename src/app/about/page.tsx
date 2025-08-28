
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building, Target, Mail } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Building className="h-12 w-12 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold">About Us</CardTitle>
                    <CardDescription className="text-lg">
                        Learn more about AI Councel Lab and our mission.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="prose max-w-none">
            <p>
              AI Councel Lab is an innovation-driven AI company that builds next-generation artificial intelligence solutions for individuals and businesses. We specialize in practical and impactful tools powered by advanced AI research and design to deliver measurable value.
            </p>

            <h2>Our Vision</h2>
            <div className="flex items-start gap-4">
                <Target className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                <p>
                    Our vision is to help people discover their true potential and secure the best opportunities to grow and succeed with confidence. We create AI products that make careers smarter and opportunities more accessible. Margdarshak AI serves as an intelligent career and learning guide, while the Resume Tailor App builds personalized job-ready resumes. At AI Councel Lab we focus on usability scalability and real impact, shaping the future of work and life with powerful AI solutions.
                </p>
            </div>

            <h2>Contact Us</h2>
             <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground"/>
                <a href="mailto:support@aicouncel.com" className="text-primary hover:underline not-prose text-base">
                    support@aicouncel.com
                </a>
             </div>

        </CardContent>
      </Card>
    </div>
  );
}
