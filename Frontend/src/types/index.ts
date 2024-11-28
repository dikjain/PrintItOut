export interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  role: 'student' | 'admin';
  phone: string;
  username: string;
  rollnumber: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'printed' | 'cancelled';
  courseCode: string;
}

export interface PrintRequest {
  id: string;
  assignmentId: string;
  userId: string;
  copies: number;
  instructions?: string;
  pickupDate: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}