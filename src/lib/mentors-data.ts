import placeholderImages from '@/app/lib/placeholder-images.json';

export interface MentorReview {
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Mentor {
  id: string;
  name: string;
  bio: string;
  experienceYears: number;
  specialization: string;
  languages: string[];
  rating: number;
  imageUrl: string;
  sessionsCompleted: number;
  reviews: MentorReview[];
}

export const MOCK_MENTORS: Mentor[] = [
  {
    id: "m1",
    name: "Dr. Rajesh Khanna",
    bio: "Ex-Google hiring manager with 15+ years in tech career pathing. Helped 500+ students land jobs in FAANG companies and mentored them through technical interviews.",
    experienceYears: 15,
    specialization: "IT & Software Engineering",
    languages: ["English", "Hindi"],
    rating: 4.9,
    imageUrl: placeholderImages.mentors[0].url,
    sessionsCompleted: 1240,
    reviews: [
      { userName: "Aryan S.", rating: 5, comment: "Incredible depth of knowledge about the tech industry.", date: "2024-05-10" },
      { userName: "Meera K.", rating: 5, comment: "The mock interview session was exactly like the real one at Google.", date: "2024-04-22" }
    ]
  },
  {
    id: "m2",
    name: "Sarah Fernandes",
    bio: "Certified career counselor and UX expert. Specialized in helping students from arts and design backgrounds build portfolios that stand out in the global market.",
    experienceYears: 8,
    specialization: "Design & Product",
    languages: ["English", "Marathi"],
    rating: 4.8,
    imageUrl: placeholderImages.mentors[1].url,
    sessionsCompleted: 850,
    reviews: [
      { userName: "Priya D.", rating: 5, comment: "Sarah helped me pivot from fine arts to UX Design seamlessly.", date: "2024-06-01" }
    ]
  },
  {
    id: "m3",
    name: "Amitabh Singh",
    bio: "Corporate lawyer and career strategist for legal and management aspirants. Expert in competitive exam planning and professional career pivots for law students.",
    experienceYears: 12,
    specialization: "Management & Law",
    languages: ["English", "Hindi", "Punjabi"],
    rating: 4.7,
    imageUrl: placeholderImages.mentors[2].url,
    sessionsCompleted: 620,
    reviews: [
      { userName: "Vikram R.", rating: 4, comment: "Very practical advice on CLAT and corporate law paths.", date: "2024-03-15" }
    ]
  },
  {
    id: "m4",
    name: "Priya Iyer",
    bio: "Senior HR Lead with extensive experience in the banking and fintech sectors. Specializes in mock interviews, career mapping, and corporate communication skills.",
    experienceYears: 10,
    specialization: "Banking & Finance",
    languages: ["English", "Tamil"],
    rating: 4.9,
    imageUrl: placeholderImages.mentors[3].url,
    sessionsCompleted: 940,
    reviews: [
      { userName: "Suresh M.", rating: 5, comment: "The best advice I've received on building a career in Fintech.", date: "2024-05-28" }
    ]
  },
  {
    id: "m5",
    name: "David Miller",
    bio: "International education consultant specializing in admissions for Ivy League and top European universities. Expert in SOP writing and scholarship applications.",
    experienceYears: 18,
    specialization: "Study Abroad & Admissions",
    languages: ["English"],
    rating: 5.0,
    imageUrl: "https://picsum.photos/seed/mentor5/400/400",
    sessionsCompleted: 2100,
    reviews: [
      { userName: "Anjali T.", rating: 5, comment: "Got into my dream college thanks to David's guidance on my essay.", date: "2024-06-10" }
    ]
  },
  {
    id: "m6",
    name: "Dr. Kavita Reddy",
    bio: "Psychologist and certified career counselor. Focuses on adolescent career anxiety, parent-child alignment in career choices, and interest-based stream selection.",
    experienceYears: 14,
    specialization: "Psychology & Counseling",
    languages: ["English", "Telugu", "Hindi"],
    rating: 4.9,
    imageUrl: "https://picsum.photos/seed/mentor6/400/400",
    sessionsCompleted: 1560,
    reviews: [
      { userName: "Rajesh V.", rating: 5, comment: "Finally, someone who understands the pressure students face today.", date: "2024-05-05" }
    ]
  }
];
