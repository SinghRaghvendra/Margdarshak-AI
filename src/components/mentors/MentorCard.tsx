
'use client';

import { Mentor } from '@/lib/mentors-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Calendar, Globe } from 'lucide-react';

interface MentorCardProps {
  mentor: Mentor;
  onBook: (mentor: Mentor) => void;
}

export default function MentorCard({ mentor, onBook }: MentorCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 overflow-hidden border-primary/10">
      <div className="relative h-48 w-full">
        {/* Using standard img tag to bypass Next.js hostname whitelist restrictions which were causing build/runtime loops */}
        <img 
          src={mentor.imageUrl} 
          alt={mentor.name} 
          className="absolute inset-0 w-full h-full object-cover"
          data-ai-hint="professional portrait"
        />
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-sm">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          {mentor.rating}
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{mentor.name}</CardTitle>
          <Badge variant="outline">{mentor.experienceYears} yrs exp</Badge>
        </div>
        <CardDescription className="font-semibold text-primary">{mentor.specialization}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{mentor.bio}</p>
        <div className="flex flex-wrap gap-1">
          {mentor.languages.map(lang => (
            <Badge key={lang} variant="secondary" className="text-[10px] py-0">
              <Globe className="mr-1 h-3 w-3" /> {lang}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0 border-t bg-secondary/10 p-4">
        <Button onClick={() => onBook(mentor)} className="w-full font-bold">
          <Calendar className="mr-2 h-4 w-4" /> Book Session
        </Button>
      </CardFooter>
    </Card>
  );
}
