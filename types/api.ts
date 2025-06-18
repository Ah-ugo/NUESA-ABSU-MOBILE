export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  matricNumber: string;
  department: string;
  level: string;
  profileImage?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Election {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  election_type: string;
  department?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  position: string;
  election_id: string;
  election_type: string;
  department?: string;
  level: string;
  manifesto: string;
  photo?: string;
  vote_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Vote {
  candidate_id: string;
  position: string;
  election_id: string;
  election_type: string;
  department?: string;
}

export interface BatchVoteRequest {
  votes: Vote[];
}

export interface BatchVoteResponse {
  message: string;
  successful: number;
  failed: number;
  successful_votes: Array<{
    candidate_id: string;
    position: string;
  }>;
  failed_votes: Array<{
    candidate_id?: string;
    error: string;
  }>;
}

export interface VotingStatus {
  voted_positions: string[];
  total_votes: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
  created_by: string;
}

export interface ElectionType {
  id: string;
  key: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Position {
  id: string;
  name: string;
  election_type: string;
  department?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Department {
  id: string;
  name: string;
  faculty?: string;
  created_at: string;
}

export interface Level {
  id: string;
  name: string;
  created_at: string;
}

export interface ApiError {
  detail: string;
}

export interface LoginCredentials {
  matricNumber: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  matricNumber: string;
  password: string;
  department: string;
  level: string;
  profileImage?: string;
}