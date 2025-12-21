import type {
  User,
  Event,
  EventSegment,
  EventAttendee,
  EventSegmentAttendee,
  EventSegmentAttendeeContribution,
  EventInvitation,
  EventChatMessage,
  EventChatMessageReaction,
} from 'common/schema';

class ApiClient {
  private get baseUrl(): string {
    return typeof window !== 'undefined'
      ? `${window.location.origin.replace(/:\d+$/, '')}:3002`
      : 'http://localhost:3002';
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

    // Handle 204 No Content responses
    if (response.status === 204) {
      return undefined as T;
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
  async getEvents(options?: { includePast?: boolean }) {
    let url = '/api/event';
    if (options?.includePast) {
      url += '?includePast=true';
    }
    return this.request<Event[]>(url);
  }

  async getEvent(id: string) {
    return this.request<Event>(`/api/event/${id}`);
  }

  async createEvent(
    event: Omit<Event, 'id' | 'host' | 'segments' | 'hostId' | 'createdAt' | 'updatedAt'>
  ) {
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

  async createEventSegment(
    segment: Omit<EventSegment, 'id' | 'event' | 'attendees' | 'createdAt' | 'updatedAt'>
  ) {
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

  async createEventAttendee(attendee: { userId: string; eventId: string }) {
    return this.request<EventAttendee>('/api/event-attendee', {
      method: 'POST',
      body: JSON.stringify(attendee),
    });
  }

  async updateEventAttendee(id: string, attendee: Partial<{ userId: string; eventId: string }>) {
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

  // Event Segment Attendee routes
  async getEventSegmentAttendees() {
    return this.request<EventSegmentAttendee[]>('/api/event-segment-attendee');
  }

  async getEventSegmentAttendee(id: string) {
    return this.request<EventSegmentAttendee>(`/api/event-segment-attendee/${id}`);
  }

  async createEventSegmentAttendee(attendee: { userId: string; segmentId: string }) {
    return this.request<EventSegmentAttendee>('/api/event-segment-attendee', {
      method: 'POST',
      body: JSON.stringify(attendee),
    });
  }

  async updateEventSegmentAttendee(
    id: string,
    attendee: Partial<{ userId: string; segmentId: string }>
  ) {
    return this.request<EventSegmentAttendee>(`/api/event-segment-attendee/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendee),
    });
  }

  async deleteEventSegmentAttendee(id: string) {
    return this.request<void>(`/api/event-segment-attendee/${id}`, {
      method: 'DELETE',
    });
  }

  // Event Segment Attendee Contribution routes
  async getEventSegmentAttendeeContributions() {
    return this.request<EventSegmentAttendeeContribution[]>(
      '/api/event-segment-attendee-contribution'
    );
  }

  async getEventSegmentAttendeeContribution(id: string) {
    return this.request<EventSegmentAttendeeContribution>(
      `/api/event-segment-attendee-contribution/${id}`
    );
  }

  async createEventSegmentAttendeeContribution(
    contribution: Omit<
      EventSegmentAttendeeContribution,
      'id' | 'eventSegmentAttendee' | 'createdAt' | 'updatedAt'
    >
  ) {
    return this.request<EventSegmentAttendeeContribution>(
      '/api/event-segment-attendee-contribution',
      {
        method: 'POST',
        body: JSON.stringify(contribution),
      }
    );
  }

  async updateEventSegmentAttendeeContribution(
    id: string,
    contribution: Partial<Omit<EventSegmentAttendeeContribution, 'id' | 'eventSegmentAttendee'>>
  ) {
    return this.request<EventSegmentAttendeeContribution>(
      `/api/event-segment-attendee-contribution/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(contribution),
      }
    );
  }

  async deleteEventSegmentAttendeeContribution(id: string) {
    return this.request<void>(`/api/event-segment-attendee-contribution/${id}`, {
      method: 'DELETE',
    });
  }

  // Event Invitation routes
  async getEventInvitations(type?: 'sent' | 'received', eventId?: string) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (eventId) params.append('eventId', eventId);
    const query = params.toString();
    return this.request<EventInvitation[]>(`/api/event-invitation${query ? `?${query}` : ''}`);
  }

  async getEventInvitation(id: string) {
    return this.request<EventInvitation>(`/api/event-invitation/${id}`);
  }

  async createEventInvitation(invitation: {
    phoneNumber: string;
    eventId: string;
    message: string;
  }) {
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

  async getUser(id: string) {
    return this.request<User>(`/api/user/${id}`);
  }

  async getCurrentUser() {
    return this.request<User>('/api/user/me');
  }

  // Event Chat Message routes
  async getEventChatMessages(eventId: string) {
    return this.request<EventChatMessage[]>(`/api/event-chat-message?eventId=${eventId}`);
  }

  async createEventChatMessage(message: { eventId: string; message: string }) {
    return this.request<EventChatMessage>('/api/event-chat-message', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async updateEventChatMessage(id: string, message: { message: string }) {
    return this.request<EventChatMessage>(`/api/event-chat-message/${id}`, {
      method: 'PUT',
      body: JSON.stringify(message),
    });
  }

  // Event Chat Message Reaction routes
  async getEventChatMessageReactions(messageId: string) {
    return this.request<EventChatMessageReaction[]>(
      `/api/event-chat-message-reaction?messageId=${messageId}`
    );
  }

  async createEventChatMessageReaction(reaction: { messageId: string; reaction: string }) {
    return this.request<EventChatMessageReaction>('/api/event-chat-message-reaction', {
      method: 'POST',
      body: JSON.stringify(reaction),
    });
  }

  async deleteEventChatMessageReaction(id: string) {
    return this.request<void>(`/api/event-chat-message-reaction/${id}`, {
      method: 'DELETE',
    });
  }

  async logout() {
    return this.request<{ message: string }>('/api/account/logout', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
