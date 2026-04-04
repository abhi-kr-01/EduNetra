import { createUser, getUserByEmail } from "@/lib/models/User";
import { createInstitution } from "@/lib/models/Institution";
import { hashPassword, verifyPassword } from "@/lib/utils/password";
import { UserResponse } from "@/lib/types/user";

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: "Mentor" | "Coordinator" | "Institution Admin" = "Mentor"
): Promise<UserResponse> {
  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // If role is Institution Admin, create institution first
  let institutionId: string | undefined;
  if (role === "Institution Admin") {
    console.log("Creating institution for admin", { adminEmail: email, adminName: name });
    const institution = await createInstitution({
      name: name, // Use the user's name as institution name
      userIds: [],
    });
    institutionId = institution.id;
    console.log("Institution created successfully", { institutionId, institutionName: institution.name });
  }

  // Create user
  const user = await createUser({
    email,
    password: hashedPassword,
    name,
    role,
    institutionId,
  });

  console.log("Institution Admin user created", { 
    userId: user.id, 
    email: user.email, 
    role: user.role,
    institutionId: user.institutionId 
  });

  return user;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<UserResponse> {
  // Find user
  const user = await getUserByEmail(email);
  if (!user || !user.id) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  if (!user.password) {
      // User likely signed up with Google/OAuth and has no password set
      throw new Error("Please log in with Google");
  }
  
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Return user without password
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    institutionId: user.institutionId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
