import { Lead } from '../types';

// Mock Instagram Service for MVP
// In production, this would call a real scraping API or official Graph API
export const instagramService = {
  searchLeads: async (keyword: string, location: string, followersRange: [number, number]): Promise<Partial<Lead>[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockLeads: Partial<Lead>[] = [
      {
        username: 'fitness_pro_india',
        fullName: 'Rahul Sharma',
        bio: 'Certified Fitness Coach | Transformation Expert | Based in Mumbai',
        followers: 12500,
        category: 'Fitness',
        contactEmail: 'rahul@fitnesspro.in'
      },
      {
        username: 'cafe_delight_kolkata',
        fullName: 'Cafe Delight',
        bio: 'Best Coffee in Kolkata | Artisanal Bakery | Open 10 AM - 10 PM',
        followers: 8400,
        category: 'Food & Beverage',
        contactEmail: 'hello@cafedelight.com'
      },
      {
        username: 'tech_guru_official',
        fullName: 'Aryan Gupta',
        bio: 'Tech Reviews | Gadget Enthusiast | DM for Collabs',
        followers: 45000,
        category: 'Technology',
      },
      {
        username: 'urban_yoga_studio',
        fullName: 'Urban Yoga',
        bio: 'Find your inner peace | Yoga for all levels | Bangalore',
        followers: 3200,
        category: 'Wellness',
      }
    ];

    // Filter by followers (mock filtering)
    return mockLeads.filter(l => l.followers! >= followersRange[0] && l.followers! <= followersRange[1]);
  }
};
