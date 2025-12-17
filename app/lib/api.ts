class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL!;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Account routes
  async sendOtp(phoneNumber: string) {
    return this.request<{ message: string }>('/api/account/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    return this.request<{ message: string }>('/api/account/login/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });
  }

  // User routes
  async getUsers() {
    return this.request<any[]>('/api/user');
  }

  async getUser(id: string) {
    return this.request<any>(`/api/user/${id}`);
  }

  async createUser(user: any) {
    return this.request<any>('/api/user', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, user: any) {
    return this.request<any>(`/api/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: string) {
    return this.request<void>(`/api/user/${id}`, {
      method: 'DELETE',
    });
  }

  // Event routes
  async getEvents() {
    return this.request<any[]>('/api/event');
  }

  async getEvent(id: string) {
    return this.request<any>(`/api/event/${id}`);
  }

  async createEvent(event: any) {
    return this.request<any>('/api/event', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(id: string, event: any) {
    return this.request<any>(`/api/event/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string) {
    return this.request<void>(`/api/event/${id}`, {
      method: 'DELETE',
    });
  }

  // Event Segment routes
  async getEventSegments() {
    return this.request<any[]>('/api/event-segment');
  }

  async getEventSegment(id: string) {
    return this.request<any>(`/api/event-segment/${id}`);
  }

  async createEventSegment(segment: any) {
    return this.request<any>('/api/event-segment', {
      method: 'POST',
      body: JSON.stringify(segment),
    });
  }

  async updateEventSegment(id: string, segment: any) {
    return this.request<any>(`/api/event-segment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(segment),
    });
  }

  async deleteEventSegment(id: string) {
    return this.request<void>(`/api/event-segment/${id}`, {
      method: 'DELETE',
    });
  }

  // Event Attendee routes
  async getEventAttendees() {
    return this.request<any[]>('/api/event-attendee');
  }

  async getEventAttendee(id: string) {
    return this.request<any>(`/api/event-attendee/${id}`);
  }

  async createEventAttendee(attendee: any) {
    return this.request<any>('/api/event-attendee', {
      method: 'POST',
      body: JSON.stringify(attendee),
    });
  }

  async updateEventAttendee(id: string, attendee: any) {
    return this.request<any>(`/api/event-attendee/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendee),
    });
  }

  async deleteEventAttendee(id: string) {
    return this.request<void>(`/api/event-attendee/${id}`, {
      method: 'DELETE',
    });
  }

  // Event Attendee Contribution routes
  async getEventAttendeeContributions() {
    return this.request<any[]>('/api/event-attendee-contribution');
  }

  async getEventAttendeeContribution(id: string) {
    return this.request<any>(`/api/event-attendee-contribution/${id}`);
  }

  async createEventAttendeeContribution(contribution: any) {
    return this.request<any>('/api/event-attendee-contribution', {
      method: 'POST',
      body: JSON.stringify(contribution),
    });
  }

  async updateEventAttendeeContribution(id: string, contribution: any) {
    return this.request<any>(`/api/event-attendee-contribution/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contribution),
    });
  }

  async deleteEventAttendeeContribution(id: string) {
    return this.request<void>(`/api/event-attendee-contribution/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
