import type {
  User,
  Event,
  EventSegment,
  EventAttendee,
  EventAttendeeContribution,
  EventInvitation,
} from 'common/schema';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL!;
  }

  private isIsoDateString(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
  }

  private transformDates(obj: unknown): unknown {
    if (!obj) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformDates(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const transformed = { ...(obj as Record<string, unknown>) };
      for (const key in transformed) {
        if (typeof transformed[key] === 'string' && this.isIsoDateString(transformed[key])) {
          transformed[key] = new Date(transformed[key]);
        } else {
          transformed[key] = this.transformDates(transformed[key]);
        }
      }
      return transformed;
    }

    return obj;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;

    // Add cache busting for GET requests
    // if (options.method === 'GET' || !options.method) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}_t=${Date.now()}`;
    // }

    const response = await fetch(url, {
      method: 'GET',
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }
    return this.transformDates(result.data) as T;
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

  async signup(user: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    phoneNumber: string;
    allergies: string[];
    verified: boolean;
    locked: boolean;
    lastLogin: null;
  }) {
    return this.request<{ message: string }>('/api/account/signup', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, user: Partial<User>) {
    return this.request<User>(`/api/user/${id}`, {
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
    return this.request<Event[]>('/api/event');
  }

  async getEvent(id: string) {
    return this.request<Event>(`/api/event/${id}`);
  }

  async createEvent(event: Omit<Event, 'id' | 'host' | 'segments' | 'hostId'>) {
    return this.request<Event>('/api/event', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(id: string, event: Partial<Omit<Event, 'id' | 'host' | 'segments'>>) {
    return this.request<Event>(`/api/event/${id}`, {
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
    return this.request<EventSegment[]>('/api/event-segment');
  }

  async getEventSegment(id: string) {
    return this.request<EventSegment>(`/api/event-segment/${id}`);
  }

  async createEventSegment(segment: Omit<EventSegment, 'id' | 'event' | 'attendees'>) {
    return this.request<EventSegment>('/api/event-segment', {
      method: 'POST',
      body: JSON.stringify(segment),
    });
  }

  async updateEventSegment(
    id: string,
    segment: Partial<Omit<EventSegment, 'id' | 'event' | 'attendees'>>
  ) {
    return this.request<EventSegment>(`/api/event-segment/${id}`, {
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
    return this.request<EventAttendee[]>('/api/event-attendee');
  }

  async getEventAttendee(id: string) {
    return this.request<EventAttendee>(`/api/event-attendee/${id}`);
  }

  async createEventAttendee(
    attendee: Omit<EventAttendee, 'id' | 'user' | 'segment' | 'contributions'>
  ) {
    return this.request<EventAttendee>('/api/event-attendee', {
      method: 'POST',
      body: JSON.stringify(attendee),
    });
  }

  async updateEventAttendee(
    id: string,
    attendee: Partial<Omit<EventAttendee, 'id' | 'user' | 'segment' | 'contributions'>>
  ) {
    return this.request<EventAttendee>(`/api/event-attendee/${id}`, {
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
    return this.request<EventAttendeeContribution[]>('/api/event-attendee-contribution');
  }

  async getEventAttendeeContribution(id: string) {
    return this.request<EventAttendeeContribution>(`/api/event-attendee-contribution/${id}`);
  }

  async createEventAttendeeContribution(
    contribution: Omit<EventAttendeeContribution, 'id' | 'attendee'>
  ) {
    return this.request<EventAttendeeContribution>('/api/event-attendee-contribution', {
      method: 'POST',
      body: JSON.stringify(contribution),
    });
  }

  async updateEventAttendeeContribution(
    id: string,
    contribution: Partial<Omit<EventAttendeeContribution, 'id' | 'attendee'>>
  ) {
    return this.request<EventAttendeeContribution>(`/api/event-attendee-contribution/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contribution),
    });
  }

  // Event Invitation routes
  async getEventInvitations(type?: 'sent' | 'received') {
    const query = type ? `?type=${type}` : '';
    return this.request<EventInvitation[]>(`/api/event-invitation${query}`);
  }

  async getEventInvitation(id: string) {
    return this.request<EventInvitation>(`/api/event-invitation/${id}`);
  }

  async createEventInvitation(invitation: { recipientId: string; message: string }) {
    return this.request<EventInvitation>('/api/event-invitation', {
      method: 'POST',
      body: JSON.stringify(invitation),
    });
  }

  async updateEventInvitation(
    id: string,
    invitation: Partial<Pick<EventInvitation, 'message' | 'viewed' | 'rsvpStatus'>>
  ) {
    return this.request<EventInvitation>(`/api/event-invitation/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invitation),
    });
  }

  async deleteEventInvitation(id: string) {
    return this.request<void>(`/api/event-invitation/${id}`, {
      method: 'DELETE',
    });
  }

  async getCurrentUser() {
    return this.request<User>('/api/user/me');
  }

  async logout() {
    return this.request<{ message: string }>('/api/account/logout', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
