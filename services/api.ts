import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  Announcement,
  ApiError,
  AuthResponse,
  BatchVoteRequest,
  BatchVoteResponse,
  Candidate,
  Election,
  LoginCredentials,
  RegisterData,
  User,
  Vote,
  VotingStatus,
} from "../types/api";

const BASE_URL = "https://nuesa-absu-election.onrender.com";
const API_VERSION = "/api/v1";

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${BASE_URL}${API_VERSION}`;
  }

  private async getToken(): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem("auth_token");
    }
    return await AsyncStorage.getItem("auth_token");
  }

  private async setToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem("auth_token", token);
    } else {
      await AsyncStorage.setItem("auth_token", token);
    }
  }

  private async removeToken(): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem("auth_token");
    } else {
      await AsyncStorage.removeItem("auth_token");
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const url = `${this.baseUrl}${endpoint}`;

    // Use Record to avoid TypeScript error with HeadersInit
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: "Network error occurred",
      }));
      throw new Error(error.detail || "An error occurred");
    }

    return response.json();
  }

  private async makeFormRequest<T>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const url = `${this.baseUrl}${endpoint}`;

    // Use Record to avoid TypeScript error with HeadersInit
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: "Network error occurred",
      }));
      throw new Error(error.detail || "An error occurred");
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    await this.setToken(response.access_token);
    return response;
  }

  async register(
    data: RegisterData,
    imageUri?: string
  ): Promise<{ message: string; user_id: string }> {
    const formData = new FormData();

    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("matricNumber", data.matricNumber);
    formData.append("password", data.password);
    formData.append("department", data.department);
    formData.append("level", data.level);

    if (imageUri) {
      const imageData = {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any;
      formData.append("profileImage", imageData);
    }

    return this.makeFormRequest("/auth/register", formData);
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }

  async getCurrentUser(): Promise<User> {
    return this.makeRequest<User>("/users/me");
  }

  async getCurrentElection(): Promise<Election | null> {
    return this.makeRequest<Election | null>("/elections/current");
  }

  async getElections(): Promise<Election[]> {
    return this.makeRequest<Election[]>("/elections");
  }

  async getCandidates(
    params: {
      election_id?: string;
      election_type?: string;
      department?: string;
      position?: string;
    } = {}
  ): Promise<Candidate[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });

    const query = searchParams.toString();
    return this.makeRequest<Candidate[]>(
      `/candidates${query ? `?${query}` : ""}`
    );
  }

  async getPositions(
    params: {
      election_id?: string;
      election_type?: string;
    } = {}
  ): Promise<{ positions: string[] }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });

    const query = searchParams.toString();
    return this.makeRequest<{ positions: string[] }>(
      `/positions${query ? `?${query}` : ""}`
    );
  }

  async getElectionTypes(): Promise<Record<string, any>> {
    return this.makeRequest<Record<string, any>>("/elections/types");
  }

  async castVote(vote: Vote): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>("/votes", {
      method: "POST",
      body: JSON.stringify(vote),
    });
  }

  async castBatchVotes(votes: BatchVoteRequest): Promise<BatchVoteResponse> {
    return this.makeRequest<BatchVoteResponse>("/votes/batch", {
      method: "POST",
      body: JSON.stringify(votes),
    });
  }

  async getVotingStatus(
    params: {
      election_id?: string;
      election_type?: string;
    } = {}
  ): Promise<VotingStatus> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });

    const query = searchParams.toString();
    return this.makeRequest<VotingStatus>(
      `/votes/status${query ? `?${query}` : ""}`
    );
  }

  async getResults(
    params: {
      election_id?: string;
      election_type?: string;
      department?: string;
    } = {}
  ): Promise<Candidate[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });

    const query = searchParams.toString();
    return this.makeRequest<Candidate[]>(`/results${query ? `?${query}` : ""}`);
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return this.makeRequest<Announcement[]>("/announcements");
  }
}

export const apiService = new ApiService();
