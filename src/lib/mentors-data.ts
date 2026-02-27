import placeholderImages from '@/app/lib/placeholder-images.json';

export interface Mentor {
  id: string;
  name: string;
  bio: string;
  experienceYears: number;
  specialization: string;
  languages: string[];
  rating: number;
  imageUrl: string;
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
    imageUrl: placeholderImages.mentors[0].url
  },
  {
    id: "m2",
    name: "Sarah Fernandes",
    bio: "Certified career counselor and UX expert. Specialized in helping students from arts and design backgrounds build portfolios that stand out in the global market.",
    experienceYears: 8,
    specialization: "Design & Product",
    languages: ["English", "Marathi"],
    rating: 4.8,
    imageUrl: placeholderImages.mentors[1].url
  },
  {
    id: "m3",
    name: "Amitabh Singh",
    bio: "Corporate lawyer and career strategist for legal and management aspirants. Expert in competitive exam planning and professional career pivots for law students.",
    experienceYears: 12,
    specialization: "Management & Law",
    languages: ["English", "Hindi", "Punjabi"],
    rating: 4.7,
    imageUrl: placeholderImages.mentors[2].url
  },
  {
    id: "m4",
    name: "Priya Iyer",
    bio: "Senior HR Lead with extensive experience in the banking and fintech sectors. Specializes in mock interviews, career mapping, and corporate communication skills.",
    experienceYears: 10,
    specialization: "Banking & Finance",
    languages: ["English", "Tamil"],
    rating: 4.9,
    imageUrl: placeholderImages.mentors[3].url
  }
];
