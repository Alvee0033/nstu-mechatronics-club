import { Router, Request, Response } from 'express';

const router = Router();

// Mock doctor data - in production, this would come from a real medical API
const mockDoctors = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    location: 'Dhaka Medical College Hospital',
    experience: '15 years',
    rating: 4.8,
    phone: '+8801712345678',
    email: 'dr.sarah@example.com',
    availability: 'Mon-Fri 9AM-5PM',
    fees: 'BDT 1500',
    qualifications: 'MBBS, MD (Cardiology), FCCP'
  },
  {
    id: '2',
    name: 'Dr. Ahmed Rahman',
    specialty: 'Neurology',
    location: 'Bangabandhu Sheikh Mujib Medical University',
    experience: '12 years',
    rating: 4.6,
    phone: '+8801812345678',
    email: 'dr.ahmed@example.com',
    availability: 'Tue-Sat 10AM-6PM',
    fees: 'BDT 1200',
    qualifications: 'MBBS, MD (Neurology), FRCP'
  },
  {
    id: '3',
    name: 'Dr. Fatima Begum',
    specialty: 'Pediatrics',
    location: 'Dhaka Shishu Hospital',
    experience: '10 years',
    rating: 4.9,
    phone: '+8801912345678',
    email: 'dr.fatima@example.com',
    availability: 'Mon-Sat 8AM-4PM',
    fees: 'BDT 1000',
    qualifications: 'MBBS, DCH, MD (Pediatrics)'
  },
  {
    id: '4',
    name: 'Dr. Mohammad Ali',
    specialty: 'Orthopedics',
    location: 'National Institute of Traumatology',
    experience: '18 years',
    rating: 4.7,
    phone: '+8801612345678',
    email: 'dr.ali@example.com',
    availability: 'Mon-Fri 9AM-7PM',
    fees: 'BDT 1800',
    qualifications: 'MBBS, MS (Orthopedics), FACS'
  },
  {
    id: '5',
    name: 'Dr. Nusrat Jahan',
    specialty: 'Gynecology',
    location: 'Bangladesh Medical College Hospital',
    experience: '14 years',
    rating: 4.8,
    phone: '+8801512345678',
    email: 'dr.nusrat@example.com',
    availability: 'Mon-Wed, Fri-Sat 9AM-5PM',
    fees: 'BDT 1300',
    qualifications: 'MBBS, FCPS (Gynecology), MS'
  }
];

// GET /api/doctors - Get all doctors with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { specialty, location, search } = req.query;

    let filteredDoctors = [...mockDoctors];

    // Filter by specialty
    if (specialty && typeof specialty === 'string') {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    // Filter by location
    if (location && typeof location === 'string') {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Search by name or specialty
    if (search && typeof search === 'string') {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.name.toLowerCase().includes(search.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      count: filteredDoctors.length,
      doctors: filteredDoctors
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctors'
    });
  }
});

// GET /api/doctors/specialties - Get unique specialties
router.get('/specialties', async (req: Request, res: Response) => {
  try {
    const specialties = Array.from(new Set(mockDoctors.map(doctor => doctor.specialty)));
    res.json({
      success: true,
      specialties: specialties.sort()
    });
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch specialties'
    });
  }
});

// GET /api/doctors/locations - Get unique locations
router.get('/locations', async (req: Request, res: Response) => {
  try {
    const locations = Array.from(new Set(mockDoctors.map(doctor => doctor.location)));
    res.json({
      success: true,
      locations: locations.sort()
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations'
    });
  }
});

// GET /api/doctors/:id - Get specific doctor by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = mockDoctors.find(doc => doc.id === id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      doctor
    });

  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor'
    });
  }
});

// POST /api/doctors/search - Advanced search with multiple filters
router.post('/search', async (req: Request, res: Response) => {
  try {
    const {
      specialty,
      location,
      minRating,
      maxFees,
      availability,
      searchTerm
    } = req.body;

    let filteredDoctors = [...mockDoctors];

    // Filter by specialty
    if (specialty && specialty.length > 0) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        specialty.includes(doctor.specialty)
      );
    }

    // Filter by location
    if (location && location.length > 0) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        location.includes(doctor.location)
      );
    }

    // Filter by minimum rating
    if (minRating && typeof minRating === 'number') {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.rating >= minRating
      );
    }

    // Filter by maximum fees
    if (maxFees && typeof maxFees === 'number') {
      filteredDoctors = filteredDoctors.filter(doctor => {
        const feeAmount = parseInt(doctor.fees.replace('BDT ', ''));
        return feeAmount <= maxFees;
      });
    }

    // Filter by availability (day of week)
    if (availability && typeof availability === 'string') {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.availability.toLowerCase().includes(availability.toLowerCase())
      );
    }

    // Search by name, specialty, or qualifications
    if (searchTerm && typeof searchTerm === 'string') {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.qualifications.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by rating (highest first)
    filteredDoctors.sort((a, b) => b.rating - a.rating);

    res.json({
      success: true,
      count: filteredDoctors.length,
      doctors: filteredDoctors
    });

  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search doctors'
    });
  }
});

export default router;