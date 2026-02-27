'use client';

import { Mentor } from '@/lib/mentors-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Globe, User, History } from 'lucide-react';

interface MentorCardProps {
  mentor: Mentor;
  onBook: (mentor: Mentor) => void;
  onViewProfile?: (mentor: Mentor) => void;
}

export default function MentorCard({ mentor, onBook, onViewProfile }: MentorCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 overflow-hidden border-primary/10 cursor-pointer group" onClick={() => onViewProfile?.(mentor)}>
      <div className="relative h-48 w-full">
        <img 
          src={mentor.imageUrl} 
          alt={mentor.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          data-ai-hint="professional portrait"
        />
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-sm">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          {mentor.rating}
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-[10px] text-white font-medium">
          <History className="h-3 w-3" />
          {mentor.sessionsCompleted}+ Sessions
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{mentor.name}</CardTitle>
          <Badge variant="outline">{mentor.experienceYears} yrs</Badge>
        </div>
        <CardDescription className="font-semibold text-primary">{mentor.specialization}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>
        <div className="flex flex-wrap gap-1">
          {mentor.languages.slice(0, 2).map(lang => (
            <Badge key={lang} variant="secondary" className="text-[10px] py-0">
              <Globe className="mr-1 h-3 w-3" /> {lang}
            </Badge>
          ))}
          {mentor.languages.length > 2 && <span className="text-[10px] text-muted-foreground">+{mentor.languages.length - 2} more</span>}
        </div>
      </CardContent>
      <CardFooter className="pt-0 border-t bg-secondary/10 p-4 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 font-bold" 
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile?.(mentor);
          }}
        >
          <User className="mr-2 h-4 w-4" /> Profile
        </Button>
        <Button 
          size="sm" 
          className="flex-1 font-bold" 
          onClick={(e) => {
            e.stopPropagation();
            onBook(mentor);
          }}
        >
          <Calendar className="mr-2 h-4 w-4" /> Book
        </Button>
      </CardFooter>
    </Card>
  );
}
