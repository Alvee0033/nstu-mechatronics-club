# Admin Dashboard

Complete admin dashboard for managing NSTU Mechatronics Club website data.

## Features

### 🎯 Dashboard Overview (`/admin`)
- Quick navigation to all management sections
- Statistics overview
- Quick action buttons

### 👥 Members Management (`/admin/members`)
- Add, edit, and delete members
- Upload profile photos (full size and thumbnail)
  - **profilePhotoDataUrl**: Full resolution photo
  - **profilePhotoThumbDataUrl**: Thumbnail for display
- Manage member details:
  - Name, Role, Department, Year
  - Email, Phone
  - Bio
  - Joined date
- Search and filter members
- Photo preview before upload
- Responsive data table

### 📅 Events Management (`/admin/events`)
- Create and manage club events
- Upload event images
- Set event details:
  - Title, Description
  - Date, Location
  - Category, Organizer
- Grid view with cards
- Edit and delete events
- Search functionality

### 🔧 Projects Management (`/admin/projects`)
- Add and manage projects
- Upload project images
- Track project status (Planned/Ongoing/Completed)
- Add technologies used
- Add team members
- Include GitHub and demo URLs
- Visual status indicators

### 🏆 Achievements Management (`/admin/achievements`)
- Record club achievements
- Upload achievement images
- Set achievement details:
  - Title, Description
  - Date, Category
  - Awarded By
  - Team Members
- Search and filter
- Card-based display

### 📝 Applications Management (`/admin/applications`)
- View registration applications
- Filter by status (Pending/Approved/Rejected)
- Statistics dashboard
- Approve or reject applications
- View detailed application information
- Photo preview for applicants

## Access

Navigate to `/admin` or click "Admin" in the main navigation menu.

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript
- **UI**: Tailwind CSS, Framer Motion
- **Database**: Firebase Firestore
- **Icons**: Lucide React

## Data Structure

### Member Fields
```typescript
{
  name: string
  role: string
  department?: string
  year?: string
  email?: string
  phone?: string
  profilePhotoDataUrl?: string  // Full size photo (base64)
  profilePhotoThumbDataUrl?: string  // Thumbnail (base64)
  bio?: string
  joinedAt?: Timestamp
  createdAt?: Timestamp
}
```

### Event Fields
```typescript
{
  title: string
  description: string
  date: Timestamp
  location?: string
  image?: string
  category?: string
  organizer?: string
  createdAt?: Timestamp
}
```

### Project Fields
```typescript
{
  title: string
  description: string
  image?: string
  technologies?: string[]
  teamMembers?: string[]
  status?: 'completed' | 'ongoing' | 'planned'
  githubUrl?: string
  demoUrl?: string
  createdAt?: Timestamp
}
```

### Achievement Fields
```typescript
{
  title: string
  description: string
  date: Timestamp
  image?: string
  category?: string
  awardedBy?: string
  teamMembers?: string[]
  createdAt?: Timestamp
}
```

### Registration Fields
```typescript
{
  name: string
  studentId: string
  email: string
  phone: string
  department: string
  year: string
  interests?: string
  experience?: string
  motivation?: string
  photoUrl?: string
  status?: 'pending' | 'approved' | 'rejected'
  createdAt?: Timestamp
}
```

## Features Overview

### Image Upload
- Base64 encoding for Firebase Firestore storage
- Preview before submission
- Support for profile photos, event images, project images, and achievement images

### Search & Filter
- Real-time search across all sections
- Status-based filtering for applications
- Fast client-side filtering

### CRUD Operations
All sections support:
- ✅ **Create**: Add new records with forms
- ✅ **Read**: View all records in tables/grids
- ✅ **Update**: Edit existing records
- ✅ **Delete**: Remove records with confirmation

### Responsive Design
- Mobile-friendly tables and grids
- Touch-optimized buttons
- Adaptive layouts

### User Experience
- Loading states
- Success/error feedback
- Confirmation dialogs for destructive actions
- Modal forms for data entry
- Smooth animations

## Usage

### Adding a Member
1. Go to `/admin/members`
2. Click "Add Member" button
3. Upload profile photo (full size) and thumbnail
4. Fill in member details
5. Click "Add Member" to save

### Managing Events
1. Go to `/admin/events`
2. Click "Add Event" to create new event
3. Edit existing events by clicking the Edit button
4. Delete events using the Delete button

### Reviewing Applications
1. Go to `/admin/applications`
2. View statistics at the top
3. Filter by status or search by name
4. Click eye icon to view full details
5. Approve or reject from detail view or table

## Security Note

⚠️ **Important**: This admin dashboard does not include authentication. In production, you should:
1. Add authentication (Firebase Auth recommended)
2. Implement role-based access control
3. Protect admin routes with middleware
4. Add audit logging for admin actions

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Role-based permissions (admin, moderator, viewer)
- [ ] Audit logs
- [ ] Bulk operations
- [ ] Export data to CSV/Excel
- [ ] Image optimization and compression
- [ ] File upload to Firebase Storage
- [ ] Advanced analytics dashboard
- [ ] Email notifications for applications
- [ ] Drag-and-drop image upload
