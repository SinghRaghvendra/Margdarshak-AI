
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
    bio: "Ex-Google hiring manager with 15+ years in tech career pathing. Helped 500+ students land jobs in FAANG.",
    experienceYears: 15,
    specialization: "IT & Software Engineering",
    languages: ["English", "Hindi"],
    rating: 4.9,
    imageUrl: "https://picsum.photos/seed/rj/400/400"
  },
  {
    id: "m2",
    name: "Sarah Fernandes",
    bio: "Certified career coach specializing in Product Management and UX Design. Focuses on portfolio building.",
    experienceYears: 8,
    specialization: "Design & Product",
    languages: ["English", "Marathi"],
    rating: 4.8,
    imageUrl: "https://picsum.photos/seed/sf/400/400"
  },
  {
    id: "m3",
    name: "Amitabh Singh",
    bio: "Corporate lawyer turned career strategist for legal and management aspirants. Expert in competitive exam planning.",
    experienceYears: 12,
    specialization: "Management & Law",
    languages: ["English", "Hindi", "Punjabi"],
    rating: 4.7,
    imageUrl: "https://picsum.photos/seed/as/400/400"
  },
  {
    id: "m4",
    name: "Priya Iyer",
    bio: "HR Lead with extensive experience in banking and finance sectors. Specializes in mock interviews and resume reviews.",
    experienceYears: 10,
    specialization: "Banking & Finance",
    languages: ["English", "Tamil"],
    rating: 4.9,
    imageUrl: "https://picsum.photos/seed/pi/400/400"
  }
];
