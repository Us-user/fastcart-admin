/** Profile of the logged-in admin (GET /Profile). */
export interface ProfileData {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dob?: string;
  imageUrl?: string;
}

/** Multipart PUT /Profile — fields that the form can update. */
export interface UpdateProfileRequest {
  FirstName?: string;
  LastName?: string;
  Email?: string;
  PhoneNumber?: string;
  Dob?: string;
  Image?: File;
}

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  image: File | null;
}
